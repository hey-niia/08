import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rasterize import *

CANVAS = 900
GRID = 48

POSES = {}

POSES["sitting"] = [
    (("ellipse", 400, 520, 170, 200), 'B', 'body'),
    (("ellipse", 400, 260, 140, 140), 'B', 'body'),
    (("polygon", [(280,180),(255,60),(340,165)]), 'B', 'body'),
    (("polygon", [(520,180),(545,60),(460,165)]), 'B', 'body'),
    (("thickline", bezier_points((565,610),(720,650),(540,745)), 55), 'B', 'tail'),
    (("ellipse", 350, 730, 45, 30), 'B', 'body'),
    (("ellipse", 450, 730, 45, 30), 'B', 'body'),
    (("ellipse", 350, 270, 18, 24), 'W', 'eye'),
    (("ellipse", 450, 270, 18, 24), 'W', 'eye'),
    (("polygon", [(385,300),(415,300),(400,320)]), 'W', 'eye'),
    (("ellipse", 400, 625, 60, 65), 'W', 'belly'),
]

POSES["sleeping"] = [
    (("ellipse", 430, 560, 260, 170), 'B', 'body'),
    (("ellipse", 220, 470, 135, 125), 'B', 'body'),
    (("polygon", [(120,410),(95,290),(190,390)]), 'B', 'body'),
    (("polygon", [(250,380),(280,270),(330,400)]), 'B', 'body'),
    (("thickline", bezier_points((650,600),(760,560),(700,470)), 45), 'B', 'tail'),
    (("ellipse", 178, 462, 24, 6, -12), 'W', 'eye'),
    (("ellipse", 262, 458, 24, 6, 8), 'W', 'eye'),
    (("polygon", [(210,505),(232,505),(221,522)]), 'W', 'eye'),
    (("ellipse", 430, 610, 110, 80), 'W', 'belly'),
]

POSES["stretching"] = [
    (("ellipse", 480, 420, 220, 160, 20), 'B', 'body'),
    (("ellipse", 230, 620, 90, 110), 'B', 'body'),
    (("thickline", [(230,560),(230,700)], 60), 'B', 'body'),
    (("ellipse", 190, 470, 110, 100), 'B', 'body'),
    (("polygon", [(120,410),(105,320),(180,400)]), 'B', 'body'),
    (("polygon", [(210,390),(230,300),(270,410)]), 'B', 'body'),
    (("thickline", [(650,480),(660,700)], 55), 'B', 'body'),
    (("thickline", bezier_points((690,380),(800,320),(770,180)), 40), 'B', 'tail'),
    (("ellipse", 165, 465, 14, 18), 'W', 'eye'),
    (("ellipse", 215, 460, 14, 18), 'W', 'eye'),
    (("polygon", [(182,500),(202,500),(192,515)]), 'W', 'eye'),
    (("ellipse", 192, 535, 30, 16), 'W', 'eye'),
]

POSES["playing"] = [
    (("ellipse", 380, 560, 220, 130), 'B', 'body'),
    (("ellipse", 210, 400, 120, 115), 'B', 'body'),
    (("polygon", [(130,330),(110,230),(195,320)]), 'B', 'body'),
    (("polygon", [(225,300),(250,200),(300,320)]), 'B', 'body'),
    (("thickline", [(330,460),(420,340),(470,260)], 55), 'B', 'paw'),
    (("ellipse", 475, 235, 45, 40), 'B', 'paw'),
    (("thickline", bezier_points((560,520),(680,470),(640,340)), 45), 'B', 'tail'),
    (("ellipse", 180, 395, 15, 20), 'W', 'eye'),
    (("ellipse", 240, 390, 15, 20), 'W', 'eye'),
    (("polygon", [(200,430),(222,430),(211,447)]), 'W', 'eye'),
    (("ellipse", 640, 650, 60, 55), 'B', 'yarn'),
    (("thickline", [(600,625),(680,675)], 5), 'W', 'yarn'),
    (("thickline", [(600,675),(680,625)], 5), 'W', 'yarn'),
    (("thickline", [(590,650),(690,650)], 5), 'W', 'yarn'),
]

POSES["walking"] = [
    (("ellipse", 430, 430, 210, 110), 'B', 'body'),
    (("ellipse", 640, 380, 110, 100), 'B', 'body'),
    (("polygon", [(570,300),(555,210),(630,290)]), 'B', 'body'),
    (("polygon", [(650,280),(670,190),(715,300)]), 'B', 'body'),
    (("thickline", [(280,500),(255,650)], 45), 'B', 'leg'),
    (("thickline", [(370,510),(390,660)], 48), 'B', 'leg'),
    (("thickline", [(520,510),(500,660)], 48), 'B', 'leg'),
    (("thickline", [(600,500),(640,640)], 45), 'B', 'leg'),
    (("thickline", bezier_points((240,420),(120,380),(150,260)), 42), 'B', 'tail'),
    (("ellipse", 660, 375, 15, 19), 'W', 'eye'),
    (("ellipse", 700, 370, 13, 17), 'W', 'eye'),
    (("polygon", [(705,405),(725,405),(715,420)]), 'W', 'eye'),
]

def bbox(labels, grid):
    minx, miny, maxx, maxy = grid, grid, -1, -1
    for y in range(grid):
        for x in range(grid):
            if labels[y][x] is not None:
                minx, miny = min(minx, x), min(miny, y)
                maxx, maxy = max(maxx, x), max(maxy, y)
    return minx, miny, maxx, maxy

def emit_svg_fragment(color_grid, label_grid, grid, cell):
    minx, miny, maxx, maxy = bbox(label_grid, grid)
    w = (maxx - minx + 1) * cell
    h = (maxy - miny + 1) * cell
    by_label = {}
    for y in range(miny, maxy + 1):
        for x in range(minx, maxx + 1):
            c = color_grid[y][x]
            if c == ' ':
                continue
            lab = label_grid[y][x]
            fill = "#000" if c == 'B' else "#fff"
            rx = (x - minx) * cell
            ry = (y - miny) * cell
            by_label.setdefault(lab, []).append(f'<rect x="{rx}" y="{ry}" width="{cell}" height="{cell}" fill="{fill}"/>')
    frag = ""
    # stable order: body first, then decorative/animated groups on top
    order = ["body", "belly", "leg", "paw", "tail", "yarn", "eye"]
    for lab in order:
        if lab in by_label:
            frag += f'<g class="{lab}">' + "".join(by_label[lab]) + "</g>"
    return frag, w, h

if __name__ == "__main__":
    CELL = 5
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
    os.makedirs(out_dir, exist_ok=True)
    results = {}
    for name, shapes in POSES.items():
        color_grid, label_grid = render(shapes, canvas=CANVAS, grid=GRID)
        frag, w, h = emit_svg_fragment(color_grid, label_grid, GRID, CELL)
        results[name] = (frag, w, h)
        print(name, "viewBox 0 0", w, h)
        with open(os.path.join(out_dir, f"{name}.svgfrag"), "w") as f:
            f.write(frag)
        # also a standalone preview (open directly in a browser to check a pose)
        preview = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w*2}" height="{h*2}"><rect width="100%" height="100%" fill="#8ecae6"/>' + frag + "</svg>"
        with open(os.path.join(out_dir, f"{name}_preview.svg"), "w") as f:
            f.write(preview)
