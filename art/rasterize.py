"""
Pure-Python smooth-shape rasterizer -> pixel grid, no PIL needed.
Define shapes as (kind, params, color) where color is 'B' (black) or 'W' (white),
drawn in order (later shapes paint over earlier ones). Supersamples each grid cell
to decide fill, so curves come out properly round instead of jagged rects.
"""
import math

def in_ellipse(x, y, cx, cy, rx, ry, angle=0):
    if angle:
        a = math.radians(angle)
        dx, dy = x - cx, y - cy
        rxr = dx * math.cos(a) + dy * math.sin(a)
        ryr = -dx * math.sin(a) + dy * math.cos(a)
        x, y, cx, cy = rxr, ryr, 0, 0
    return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.0

def in_polygon(x, y, pts):
    n = len(pts)
    inside = False
    j = n - 1
    for i in range(n):
        xi, yi = pts[i]
        xj, yj = pts[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside

def dist_to_segment(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    if dx == 0 and dy == 0:
        return math.hypot(px - ax, py - ay)
    t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))

def in_thick_polyline(x, y, pts, width):
    r = width / 2
    for i in range(len(pts) - 1):
        if dist_to_segment(x, y, pts[i][0], pts[i][1], pts[i+1][0], pts[i+1][1]) <= r:
            return True
    return False

def bezier_points(p0, p1, p2, steps=30):
    out = []
    for i in range(steps + 1):
        t = i / steps
        x = (1-t)**2 * p0[0] + 2*(1-t)*t*p1[0] + t**2 * p2[0]
        y = (1-t)**2 * p0[1] + 2*(1-t)*t*p1[1] + t**2 * p2[1]
        out.append((x, y))
    return out

def shape_hit(x, y, shape):
    kind = shape[0]
    if kind == "ellipse":
        _, cx, cy, rx, ry = shape[:5]
        angle = shape[5] if len(shape) > 5 else 0
        return in_ellipse(x, y, cx, cy, rx, ry, angle)
    if kind == "polygon":
        return in_polygon(x, y, shape[1])
    if kind == "thickline":
        return in_thick_polyline(x, y, shape[1], shape[2])
    raise ValueError(kind)

def render(shapes, canvas=800, grid=44, supersample=4, threshold=0.5):
    """shapes: list of (shape_tuple, color, label) drawn in order.
    Returns (color_grid of ' '/'B'/'W', label_grid of the topmost label per cell)."""
    cell = canvas / grid
    out = [[' '] * grid for _ in range(grid)]
    labels = [[None] * grid for _ in range(grid)]
    step = cell / supersample
    for gy in range(grid):
        for gx in range(grid):
            counts = {'B': 0, 'W': 0}
            total = supersample * supersample
            top_label = None
            for sy in range(supersample):
                for sx in range(supersample):
                    px = gx * cell + (sx + 0.5) * step
                    py = gy * cell + (sy + 0.5) * step
                    color = None
                    label = None
                    for shape, col, lab in shapes:
                        if shape_hit(px, py, shape):
                            color = col
                            label = lab
                    if color:
                        counts[color] += 1
                        top_label = label
            b, w = counts['B'], counts['W']
            if b + w == 0:
                continue
            frac = (b + w) / total
            if frac < threshold:
                continue
            out[gy][gx] = 'W' if w > b else 'B'
            labels[gy][gx] = top_label
    return out, labels

def to_ascii(grid_data):
    return "\n".join("".join(row) for row in grid_data)
