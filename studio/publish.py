"""Publish approved studio posts to Instagram (and optionally a Facebook Page).
Runs on a cron in GitHub Actions. Takes the OLDEST approved post(s) and publishes
them via the official Meta Content Publishing API, then marks them published
with the live permalink. Zero cost, official API, no third parties.

Env (GitHub secrets):
  SUPABASE_URL, SUPABASE_SERVICE_KEY   - as before
  META_ACCESS_TOKEN                    - long-lived token with instagram_basic,
                                         instagram_content_publish, pages_read_engagement
  IG_USER_ID                           - Instagram Business account ID
  FB_PAGE_ID                           - optional; if set, also posts to the FB Page
Optional env:
  POSTS_PER_RUN  (default 1)
  LANGS          (default all; e.g. "en" or "en,no")
"""
import os, sys, time, datetime, urllib.parse, urllib.request, json

SUPABASE_URL = (os.environ["SUPABASE_URL"]).rstrip("/")
SB_KEY = os.environ["SUPABASE_SERVICE_KEY"]
TOKEN = os.environ["META_ACCESS_TOKEN"]
IG_ID = os.environ["IG_USER_ID"]
FB_PAGE = os.environ.get("FB_PAGE_ID", "")
PER_RUN = int(os.environ.get("POSTS_PER_RUN", "1"))
LANGS = [l.strip() for l in os.environ.get("LANGS", "").split(",") if l.strip()]
GRAPH = "https://graph.facebook.com/v21.0"


def http(method, url, data=None, headers=None):
    body = None
    if data is not None:
        body = urllib.parse.urlencode(data).encode() if isinstance(data, dict) else json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, method=method, headers=headers or {})
    if data is not None and not isinstance(data, dict):
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{url} -> {e.code}: {e.read().decode()[:500]}")


def sb(method, path, data=None, prefer=None):
    h = {"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"}
    if prefer: h["Prefer"] = prefer
    return http(method, f"{SUPABASE_URL}/rest/v1/{path}", data, h)


def ig_publish(image_url, caption):
    create = http("POST", f"{GRAPH}/{IG_ID}/media",
                  {"image_url": image_url, "caption": caption, "access_token": TOKEN})
    cid = create["id"]
    # media container can take a moment to be ready
    for _ in range(10):
        st = http("GET", f"{GRAPH}/{cid}?fields=status_code&access_token={TOKEN}")
        if st.get("status_code") == "FINISHED":
            break
        time.sleep(3)
    pub = http("POST", f"{GRAPH}/{IG_ID}/media_publish",
               {"creation_id": cid, "access_token": TOKEN})
    media_id = pub["id"]
    perma = http("GET", f"{GRAPH}/{media_id}?fields=permalink&access_token={TOKEN}")
    return perma.get("permalink", f"https://www.instagram.com/p/{media_id}")


def fb_publish(image_url, caption):
    r = http("POST", f"{GRAPH}/{FB_PAGE}/photos",
             {"url": image_url, "message": caption, "access_token": TOKEN})
    return f"https://www.facebook.com/{r.get('post_id', r.get('id', ''))}"


def main():
    q = "studio_packages?status=eq.approved&order=decided_at.asc&select=*"
    rows = sb("GET", q)
    if LANGS:
        rows = [r for r in rows if r.get("language") in LANGS]
    if not rows:
        print("Nothing approved to publish.")
        return
    for row in rows[:PER_RUN]:
        slug = row["slug"]
        image_url = (row.get("image_url") or "").split("?")[0]
        caption = (row.get("content") or {}).get("caption", "")
        if not image_url:
            print("no image, skipping", slug)
            continue
        print("publishing", slug)
        ig_url = ig_publish(image_url, caption)
        fb_url = fb_publish(image_url, caption) if FB_PAGE else None
        content = row.get("content") or {}
        content["published"] = {
            "ig_url": ig_url, "fb_url": fb_url,
            "at": datetime.datetime.utcnow().isoformat() + "Z",
        }
        sb("PATCH", f"studio_packages?id=eq.{row['id']}",
           {"status": "published", "content": content,
            "updated_at": datetime.datetime.utcnow().isoformat()},
           prefer="return=minimal")
        print("published", slug, "->", ig_url)


if __name__ == "__main__":
    main()
