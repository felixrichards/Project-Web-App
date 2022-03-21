import cv2
import numpy as np
import bezier


def get_draw_function(shape):
    draw_functions = {
        'Rect': draw_rect,
        'Circle': draw_circle,
        'Ellipse': draw_ellipse,
        'Line': draw_line,
        'Snake': draw_region,
        'Region': draw_region,
        'Freehand': draw_region
    }
    return draw_functions[shape]


def draw_rect(canvas, shape, wcs):
    coords = _as_coords(
        [shape.ra_tl, shape.ra_tr, shape.ra_br, shape.ra_bl],
        [shape.dec_tl, shape.dec_tr, shape.dec_br, shape.dec_bl]
    )
    draw_polygon(canvas, coords, wcs)


def draw_circle(canvas, shape, wcs):
    coords = _as_coords(
        [shape.ra_xy, shape.ra_wh],
        [shape.dec_xy, shape.dec_wh]
    )
    pixel_coords = wcs.wcs_world2pix(coords, 0)
    pixel_coords = pixel_coords.astype(np.int32)
    center = (
        (pixel_coords[0, 0] + pixel_coords[1, 0]) // 2,
        (pixel_coords[0, 1] + pixel_coords[1, 1]) // 2
    )
    radius = int(np.sqrt(
        (pixel_coords[0, 0] - pixel_coords[1, 0]) ** 2 +
        (pixel_coords[0, 1] - pixel_coords[1, 1]) ** 2
    ) / 2)
    cv2.circle(canvas, center, radius, color=255, thickness=10)


def draw_ellipse(canvas, shape, wcs):
    coords = _as_coords(
        [shape.ra_tl, shape.ra_tr, shape.ra_br, shape.ra_bl, shape.ra_tc],
        [shape.dec_tl, shape.dec_tr, shape.dec_br, shape.dec_bl, shape.dec_tc]
    )
    pixel_coords = wcs.wcs_world2pix(coords, 0)
    pixel_coords = pixel_coords.astype(np.int32)
    centre = (
        (pixel_coords[0, 0] + pixel_coords[2, 0]) // 2,
        (pixel_coords[0, 1] + pixel_coords[2, 1]) // 2,
    )
    major = int(np.sqrt(
        (pixel_coords[0, 0] - pixel_coords[1, 0]) ** 2 +
        (pixel_coords[0, 1] - pixel_coords[1, 1]) ** 2
    ) / 2)
    minor = int(np.sqrt(
        (pixel_coords[0, 0] - pixel_coords[3, 0]) ** 2 +
        (pixel_coords[0, 1] - pixel_coords[3, 1]) ** 2
    ) / 2)
    theta = np.degrees(np.arctan(
        (pixel_coords[4, 1] - centre[1]) / (pixel_coords[4, 0] - centre[0])
    )) + 90

    # if minor > major:
    #     tmp = minor
    #     minor = major
    #     major = tmp

    cv2.ellipse(canvas, centre, (major, minor), theta, 0, 360, color=255, thickness=-1)


def draw_line(canvas, shape, wcs):
    coords = _as_coords(
        [shape.ra_xy, shape.ra1, shape.ra2, shape.ra3],
        [shape.dec_xy, shape.dec1, shape.dec2, shape.dec3]
    )
    pixel_coords = wcs.wcs_world2pix(coords, 0)
    pixel_coords = pixel_coords.astype(np.int32)
    curve = bezier.Curve.from_nodes(pixel_coords.transpose())
    evaluation_points = np.linspace(0, 1, int(max(10, curve.length/5)))
    curve_coords = curve.evaluate_multi(evaluation_points).astype(np.int32).transpose()

    cv2.polylines(canvas, [curve_coords], False, color=255, thickness=16)


def draw_region(canvas, shape, wcs):
    coords = _as_coords(
        shape.ra_points,
        shape.dec_points
    )
    draw_polygon(canvas, coords, wcs)


def draw_polygon(canvas, coords, wcs):
    polygon_points = wcs.wcs_world2pix(coords, 0)
    polygon_points = polygon_points.astype(np.int32)
    cv2.fillPoly(canvas, [polygon_points], color=255)


def _as_coords(ras, decs):
    ra_points = np.array(ras, dtype=np.float64)
    dec_points = np.array(decs, dtype=np.float64)
    coords = np.stack((ra_points, dec_points)).transpose()
    return coords
