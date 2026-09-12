# Pose generator

The pixel-art poses in `src/renderer/popup/index.html` weren't hand-typed pixel by
pixel — they're rasterized from smooth vector shapes (ellipses, polygons, thick
curved lines), then thresholded down to a grid. That gives properly round heads and
curves instead of the jagged blob you get from placing rects by hand.

## Editing a pose or adding a new one

1. Open `build_poses.py` and edit the `POSES["name"]` shape list, or add a new
   `POSES["newpose"] = [...]` entry. Each shape is
   `(shape_tuple, color, label)`:
   - `("ellipse", cx, cy, rx, ry, angle_degrees=0)`
   - `("polygon", [(x, y), ...])`
   - `("thickline", points, width)` — `points` can come from `bezier_points(p0, p1, p2)`
     for a curved stroke, or a plain list of `(x, y)` for a straight one.
   - `color` is `'B'` (black) or `'W'` (white, drawn on top — eyes, belly, nose).
   - `label` groups cells into an SVG `<g class="label">` for CSS animation
     (`body`, `eye`, `tail`, `paw`, `leg`, `belly`, `yarn` are the ones already
     wired up with keyframes in `style.css`).
2. Run it: `python3 build_poses.py` (needs only the stdlib — no PIL/pip installs).
   It writes `output/<name>.svgfrag` (the `<g>`-grouped rects to paste into
   `index.html`) and `output/<name>_preview.svg` (open directly in a browser to
   check it before wiring it in).
3. Paste the new `.svgfrag` content into a `<svg class="pose pose-<name>" ...>` in
   `index.html` (match `viewBox`/`width`/`height` to the numbers `build_poses.py`
   printed), and add `"<name>"` to the `POSES` array in `renderer.ts`.

Coordinates are in an arbitrary working canvas (`CANVAS = 900` by default) — draw at
that scale, the script downsamples to `GRID` cells (48 by default) and re-emits at
`CELL = 5` px/cell for the final SVG. Bump `GRID` for more detail, `CELL` to change
the on-screen size.

## App icon & tray icon

Both `build/icon.icns` and `build/trayTemplate.png`/`@2x.png` are generated
directly from 08's own `sitting` sprite
(`src/renderer/popup/sprites/08/sitting.png`) — not hand-drawn separately —
so the logo is literally her, not a redrawn glyph. The sprite's eyes/belly
patch are opaque white, which a macOS template image would just render as
more solid black (template images only read alpha), so the first step turns
those into real transparent cutouts:

```bash
magick sitting.png -fuzz 0 -transparent white cutout.png
```

From `cutout.png`: the tray icon is a plain nearest-neighbor resize to the
real menu-bar heights (`-filter point -resize x22` / `x44`, to keep the pixel
edges crisp instead of blurring them); the app icon is the same cutout
resized and composited (`-gravity center -composite`) onto the existing
white rounded-square background (`rx="220"` on a 1024×1024 canvas), at each
size `iconutil` needs, then packed with `iconutil -c icns`.
