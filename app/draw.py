import cv2
import numpy as np


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
    ra_tl, dec_tl = shape.ra_tl, shape.dec_tl
    ra_tr, dec_tr = shape.ra_tr, shape.dec_tr
    ra_tc, dec_tc = shape.ra_tc, shape.dec_tc
    ra_bl, dec_bl = shape.ra_bl, shape.dec_bl
    ra_points = np.array([ra_tl, ra_tr, ra_tc, ra_bl], dtype=np.float64)
    dec_points = np.array([dec_tl, dec_tr, dec_tc, dec_bl], dtype=np.float64)
    draw_polygon(canvas, ra_points, dec_points, wcs)


def draw_circle(canvas, shape, wcs):
    pass


def draw_ellipse(canvas, shape, wcs):
    ra1, ra2 = shape.ra_xy, shape.ra_wh
    dec1, dec2 = shape.dec_xy, shape.dec_wh


def draw_line(canvas, shape, wcs):
    pass


def draw_region(canvas, shape, wcs):
    ra_points, dec_points = np.array(shape.ra_points), np.array(shape.dec_points)
    draw_polygon(canvas, ra_points, dec_points, wcs)


def draw_polygon(canvas, ra_points, dec_points, wcs):
    coords = np.stack((ra_points, dec_points)).transpose()
    polygon_points = wcs.wcs_world2pix(coords, 0)
    polygon_points = polygon_points.astype(np.int32)
    cv2.fillPoly(canvas, [polygon_points], color=255)
