"""Render every studio/content/*.json that has no assets yet, upload to Supabase
Storage (bucket: studio-assets), and upsert studio_packages rows as pending.
Runs in GitHub Actions from the repo root. Env: SUPABASE_URL, SUPABASE_SERVICE_KEY.
"""
import json, os, glob, subprocess, sys, mimetypes, time

sys.path.insert(0, "studio/renderer")
import simple3  # noqa

from supabase import create_client

SB = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])
BUCKET = "studio-assets"
THEME = "studio/themes/247spain.json"


def upload(local, remote):
    with open(local, "rb") as f:
        SB.storage.from_(BUCKET).upload(
            remote, f.read(),
            {"content-type": mimetypes.guess_type(local)[0] or "application/octet-stream",
             "upsert": "true"},
        )
    return SB.storage.from_(BUCKET).get_public_url(remote)


def all_packages():
    pkgs = [simple3.load(p) for p in sorted(glob.glob("studio/content/*.json"))]
    batch = "studio/content_batch.json"
    if os.path.exists(batch):
        pkgs += simple3.load(batch)
    caps_path = "studio/captions.json"
    if os.path.exists(caps_path):
        caps = simple3.load(caps_path)
        for c in pkgs:
            if c["slug"] in caps:
                c["caption"] = caps[c["slug"]]
    return pkgs


def main():
    th = simple3.T(simple3.load(THEME))
    images_only = os.environ.get("IMAGES_ONLY", "1").lower() in ("1", "true", "yes")
    os.makedirs("studio/out", exist_ok=True)
    for c in all_packages():
        slug = c["slug"]
        force = os.environ.get("FORCE_RERENDER", "").lower() in ("1", "true", "yes")
        existing = SB.table("studio_packages").select("id,status,image_url,video_url").eq("slug", slug).execute().data
        if not force and existing and existing[0].get("image_url") and existing[0]["status"] != "rejected":
            # no re-render needed, but keep the stored content (captions etc.) in sync
            SB.table("studio_packages").update({"content": c, "updated_at": __import__("datetime").datetime.utcnow().isoformat()}).eq("slug", slug).execute()
            print("skip (content synced)", slug)
            continue
        errs = simple3.validate(c)
        if errs:
            print("BUDGET FAIL", slug, errs)
            continue
        img = f"studio/out/{slug}.png"
        try:
            simple3.render_image(c, th, img)
        except Exception as e:
            print("RENDER FAIL", slug, e)  # e.g. photos folder missing: skip, never crash the batch
            continue
        v = int(time.time())
        image_url = upload(img, f"{slug}.png") + f"?v={v}"
        video_url = None
        if not images_only:
            simple3.render_video_frames(c, th, "/tmp/s3frames")
            vid = f"studio/out/{slug}_12s.mp4"
            subprocess.run(
                ["ffmpeg", "-y", "-framerate", "30", "-i", "/tmp/s3frames/f%05d.jpg",
                 "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
                 "-movflags", "+faststart", vid],
                check=True, capture_output=True,
            )
            video_url = upload(vid, f"{slug}_12s.mp4") + f"?v={v}"
        if video_url is None and existing and existing[0].get("video_url"):
            video_url = existing[0]["video_url"]  # keep an already rendered video
        SB.table("studio_packages").upsert({
            "slug": slug,
            "language": c.get("language", "en"),
            "layout": simple3.pick_layout(c),
            "content": c,
            "image_url": image_url,
            "video_url": video_url,
            "status": "pending",
        }, on_conflict="slug").execute()
        print("rendered + uploaded", slug)


if __name__ == "__main__":
    main()
