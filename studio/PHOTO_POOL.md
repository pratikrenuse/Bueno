# The photo pool for the text-free frames

`studio/render_frames.py` crops these 15 photographs. They are not in the repo: together
they are 83 MB of full resolution licensed files, and they already live on Pratik's
machine. The renderer reads whatever folder `STUDIO_PHOTOS` points at, defaulting to
`studio/photos-brand`.

To rebuild the folder:

    mkdir -p studio/photos-brand
    cp studio/photos/couple_beach.jpg studio/photos/golden_coast.jpg studio/photos-brand/
    IMG="$HOME/Documents/Claude/Projects/Bueno/Images"
    cp "$IMG/GettyImages-130408166.jpg" "$IMG/GettyImages-130408168.jpg" \
       "$IMG/GettyImages-1533960278 8.jpg" "$IMG/GettyImages-1584776003 18.jpg" \
       "$IMG/GettyImages-467520162 warm.jpg" "$IMG/GettyImages-507832451 1.jpg" \
       "$IMG/GettyImages-515484776 warm.jpg" "$IMG/GettyImages-576912916_edit.jpg" \
       "$IMG/GettyImages-641196042.jpg" "$IMG/iStock-1137412003.jpg" \
       "$IMG/iStock-1202029143.jpg" "$IMG/istockphoto-475122592.jpg" \
       "$IMG/luxury-villa-2022-11-14-02-53-44-utc.jpg" studio/photos-brand/
    python3 studio/render_frames.py && python3 studio/check_frames.py

## What is deliberately not in the pool

Seven files in `studio/photos` and the Images folder are the same pictures as the ones
above, under different names, or are off-brand:

| Not used | Why |
|---|---|
| `arch_terrace.jpg` | same image as `GettyImages-641196042.jpg` |
| `coast_bay.jpg` | same image as `GettyImages-467520162 warm.jpg` |
| `cove_house.jpg` | same image as `GettyImages-507832451 1.jpg` |
| `marina.jpg` | same image as `GettyImages-1584776003 18.jpg`, and it is not a marina |
| `pool_dusk.jpg` | same image as `GettyImages-130408166.jpg` |
| `poolside.jpg` | same image as `GettyImages-130408168.jpg` |
| `property-2.jpg` | same image as `golden_coast.jpg` |
| `sunset_village.jpg` | same image as `iStock-1137412003.jpg` |
| `terrace_sunset.jpg` | same image as `GettyImages-1533960278 8.jpg` |
| `GettyImages-1152763706*.jpg` | greyscale, reads off-brand against a warm set |

Where a pair existed the higher resolution original was kept, which is why three of the
15 gained resolution. `check_frames.py` fails if a duplicate or a greyscale photo is in
the pool, so adding one back will be caught rather than shipped.

## If you add photos

More photos means fewer reuses and more variety, so it is the single best improvement
available here. Nothing in this session could download any: neither the cloud container
nor the desktop VM can reach Pexels, Unsplash or any other image host, so the pool is
whatever is licensed and on disk. Drop them in `studio/photos-brand`, re-run `studio/render_frames.py` and then `studio/check_frames.py`. Warm golden
light, Mediterranean settings, people in their forties to seventies, nothing with visible
text or a recognisable brand.
