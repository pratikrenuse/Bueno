"""Render every studio/content/*.json that has no assets yet, upload to Supabase
Storage (bucket: studio-assets), and upsert studio_packages rows as pending.
Runs in GitHub Actions from the repo root. Env: SUPABASE_URL, SUPABASE_SERVICE_KEY.
"""
import json, os, glob, subprocess, sys, mimetypes

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


def main():
    th = simple3.T(simple3.load(THEME))
    os.makedirs("studio/out", exist_ok=True)
    for path in sorted(glob.glob("studio/content/*.json")):
        c = simple3.load(path)
        slug = c["slug"]
        existing = SB.table("studio_packages").select("id,status,image_url").eq("slug", slug).execute().data
        if existing and existing[0].get("image_url") and existing[0]["status"] != "rejected":
            print("skip", slug)
            continue
        errs = simple3.validate(c)
        if errs:
            print("BUDGET FAIL", slug, errs)
            continue
        img = f"studio/out/{slug}.png"
        simple3.render_image(c, th, img)
        simple3.render_video_frames(c, th, "/tmp/s3frames")
        vid = f"studio/out/{slug}_12s.mp4"
        subprocess.run(
            ["ffmpeg", "-y", "-framerate", "30", "-i", "/tmp/s3frames/f%05d.jpg",
             "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
             "-movflags", "+faststart", vid],
            check=True, capture_output=True,
        )
        image_url = upload(img, f"{slug}.png")
        video_url = upload(vid, f"{slug}_12s.mp4")
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
