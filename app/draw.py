import cv2
import numpy as np


def get_draw_function(shape):
    draw_functions = {
        'Rect': draw_rect,
        'Circle': None,
        'Ellipse': None,
        'Line': None,
        'Snake': None,
        'Region': draw_region,
        'Freehand': draw_region
    }
    return draw_functions[shape]


def draw_ellipse(canvas, shape, wcs):
    ra1, ra2 = shape.ra_xy, shape.ra_wh
    dec1, dec2 = shape.dec_xy, shape.dec_wh


def draw_rect(canvas, shape, wcs):
    ra1, ra2 = shape.ra_xy, shape.ra_wh
    dec1, dec2 = shape.dec_xy, shape.dec_wh
    ra_points = np.array([ra1, ra1, ra2, ra2])
    dec_points = np.array([dec1, dec2, dec2, dec1])
    draw_polygon(canvas, ra_points, dec_points, wcs)


def draw_region(canvas, shape, wcs):
    ra_points, dec_points = np.array(shape.ra_points), np.array(shape.dec_points)
    draw_polygon(canvas, ra_points, dec_points, wcs)


def draw_polygon(canvas, ra_points, dec_points, wcs):
    coords = np.stack((ra_points, dec_points)).transpose()
    polygon_points = wcs.wcs_world2pix(coords, 0).astype(np.int32)
    cv2.fillPoly(canvas, [polygon_points], color=255)
