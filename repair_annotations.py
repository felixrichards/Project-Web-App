import os
import random
import numpy as np
from os.path import join
from app import db, create_app
from app.models import Galaxy, User, Annotation, Shape
from astropy.wcs import WCS
import argparse


def find_largest_triangle(points):
    def area(A, B, C):
        return .5 * (
            points[A][0] * (points[B][1] - points[C][1]) +
            points[B][0] * (points[C][1] - points[A][1]) +
            points[C][0] * (points[A][1] - points[B][1])
        )

    N = len(points)
    A = 0
    B = 1
    C = 2
    best_A = A
    best_B = B
    best_C = C

    i = 0
    while True:
        while True:
            while area(A, B, C) <= area(A, B, (C+1) % N):
                i = i + 1
                if i > 30000:
                    if area(best_A, best_B, best_C) < 100:
                        return None
                    return best_A, best_B, best_C
                C = (C + 1) % N
            if area(A, B, C) <= area(A, (B + 1) % N, C):
                B = (B + 1) % N
                continue
            else:
                break

        if area(A, B, C) > area(best_A, best_B, best_C):
            best_A = A
            best_B = B
            best_C = C

        A = (A + 1) % N
        if A == B:
            B = (B + 1) % N
        if B == C:
            C = (C + 1) % N
        if A == 0:
            break
    if area(best_A, best_B, best_C) < 100:
        return None
    return best_A, best_B, best_C


def retrieve_reference_points(shape):
    if shape.shape == "Region" or shape.shape == "Freehand" or shape.shape == "Snake":
        p_idxs = find_largest_triangle(list(zip(shape.x_points, shape.y_points)))
        if p_idxs is None:
            return None
        zipped_properties = zip(
            [shape.x_points[i] for i in p_idxs],
            [shape.y_points[i] for i in p_idxs],
            [shape.ra_points[i] for i in p_idxs],
            [shape.dec_points[i] for i in p_idxs]
        )
    if shape.shape == "Line":
        zipped_properties = zip(
            [shape.x1, shape.x2, shape.x3],
            [shape.y1, shape.y2, shape.y3],
            [shape.ra1, shape.ra2, shape.ra3],
            [shape.dec1, shape.dec2, shape.dec3]
        )

    points = [
        {
            'x': x,
            'y': y,
            'ra': ra,
            'dec': dec
        } for x, y, ra, dec in zipped_properties
    ]
    return points


def calc_linear_projection_matrix(points):
    x1 = points[0]['x'] - points[1]['x']
    x2 = points[0]['x'] - points[2]['x']
    y1 = points[0]['y'] - points[1]['y']
    y2 = points[0]['y'] - points[2]['y']
    ra1 = points[0]['ra'] - points[1]['ra']
    ra2 = points[0]['ra'] - points[2]['ra']
    dec1 = points[0]['dec'] - points[1]['dec']
    dec2 = points[0]['dec'] - points[2]['dec']

    CD1_1 = (y2 * ra1 - y1 * ra2) / (y2 * x1 - y1 * x2)
    CD1_2 = (x2 * ra1 - x1 * ra2) / (y1 * x2 - y2 * x1)
    CD2_1 = (y2 * dec1 - y1 * dec2) / (y2 * x1 - y1 * x2)
    CD2_2 = (x2 * dec1 - x1 * dec2) / (y1 * x2 - y2 * x1)
    return [
        [CD1_1, CD1_2],
        [CD2_1, CD2_2]
    ]


def calc_pixel_offsets(points, CD):
    CRPIX1 = points[0]['x'] - (CD[1][1] * points[0]['ra'] - CD[0][1] * points[0]['dec']) / (CD[0][0] * CD[1][1] - CD[1][0] * CD[0][1])
    CRPIX2 = points[0]['y'] - (CD[1][0] * points[0]['ra'] - CD[0][0] * points[0]['dec']) / (CD[1][0] * CD[0][1] - CD[0][0] * CD[1][1])
    return CRPIX1, CRPIX2


def pix_to_world(point, CD, CR):
    if type(point) is dict:
        x = point['x']
        y = point['y'] 
    else:
        x = point[0]
        y = point[1]
    return (
        (x - CR[0]) * CD[0][0] + (y - CR[1]) * CD[0][1],
        (x - CR[0]) * CD[1][0] + (y - CR[1]) * CD[1][1]
    )


def world_to_pix(point, CD, CR):
    if type(point) is dict:
        ra = point['ra']
        dec = point['dec'] 
    else:
        ra = point[0]
        dec = point[1]
    return (
        CR[0] + (ra * CD[1][1] - dec * CD[0][1]) / (CD[0][0] * CD[1][1] - CD[1][0] * CD[0][1]),
        CR[1] + (ra * CD[1][0] - dec * CD[0][0]) / (CD[1][0] * CD[0][1] - CD[0][0] * CD[1][1])
    )


def rotate(point, theta, centre):
    x = point[0] - centre[0]
    y = point[1] - centre[1]
    return (
        x * np.cos(theta) + y * np.sin(theta) + centre[0],
        -x * np.sin(theta) + y * np.cos(theta) + centre[1]
    )


def compare_shape(shape1, shape2):
    order = [
                'Region',
                'Freehand',
                'Snake',
                'Line'
    ]

    if order.index(shape1) < order.index(shape2):
        return 1
    elif order.index(shape1) > order.index(shape2):
        return -1
    else:
        return 0


def check_dubious_wcs(ra, dec, ref_ra, ref_dec):
    return abs(ra - ref_ra) > .6 or abs(dec - ref_dec) > .6


def check_dubious_px(x, y, ref_x, ref_y):
    return abs(x - ref_x) > 50 or abs(y - ref_y) > 50


def repair_annotations():
    app = create_app()
    with app.app_context():
        annotations = Annotation.query.filter_by(repaired=False)
        broken = annotations.join(Shape).filter(
            Shape.shape.in_([
                'Ellipse',
                'Rect'
            ])
        )
        broken_a_ids = [a.a_id for a in broken.all()]
        repairable = annotations.filter(Annotation.a_id.in_(
            broken_a_ids
        ))

        reference_shape_names = [  # Ordered by projection accuracy
                    'Region',
                    'Freehand',
                    'Snake',
                    'Line'
        ]
        repairable = repairable.join(Shape).filter(
            Shape.shape.in_(reference_shape_names)
        )
        irrepairable_ann_ids = set(a.a_id for a in broken.all()) ^ set(a.a_id for a in repairable.all())

        fixed_ann_ids = []
        dubious_ann_ids = []
        unsuccessful_ann_ids = []
        for ann in repairable.all():
            print("Repairing " + ann.__repr__())
            shapes = Shape.query.filter_by(a_id=ann.a_id)
            correct_shapes = shapes.filter(Shape.shape.in_(
                reference_shape_names
            )).all()
            # Attempt to find a shape which has three points which cover an area of at least 5 pixels
            reference_points = None
            correct_shapes = sorted(
                correct_shapes,
                key=lambda x: reference_shape_names.index(x.shape)
            )
            while correct_shapes and reference_points is None:
                reference_shape = correct_shapes[0]
                reference_points = retrieve_reference_points(reference_shape)
                correct_shapes.pop(0)
            if reference_points is None:
                print("Warning: a_id=" + str(ann.a_id) + " could not be repaired: no good reference shape")
                unsuccessful_ann_ids.append(ann.a_id)
                if ann.a_id == 1:
                    return
                continue
            CD = calc_linear_projection_matrix(reference_points)
            CR = calc_pixel_offsets(reference_points, CD)

            broken_shapes = shapes.filter(Shape.shape.in_([
                'Rect',
                'Ellipse'
            ])).all()
            for shape in broken_shapes:
                x0, y0 = world_to_pix((shape.ra_xy, shape.dec_xy), CD, CR)
                xw, yh = world_to_pix((shape.ra_wh, shape.dec_wh), CD, CR)

                if check_dubious_px(shape.x0, shape.y0, x0, y0):
                    dubious_ann_ids.append(ann.a_id)

                centre = x0 + (xw - x0) / 2, y0 + (yh - y0) / 2

                tl = rotate((x0, y0), shape.theta, centre)
                tr = rotate((xw, y0), shape.theta, centre)
                tc = rotate((x0 + (xw - x0) / 2, y0), shape.theta, centre)
                bl = rotate((x0, yh), shape.theta, centre)
                br = rotate((xw, yh), shape.theta, centre)
                bc = rotate((x0 + (xw - x0) / 2, yh), shape.theta, centre)
                shape.ra_tl, shape.dec_tl = pix_to_world(tl, CD, CR)
                shape.ra_tr, shape.dec_tr = pix_to_world(tr, CD, CR)
                shape.ra_tc, shape.dec_tc = pix_to_world(tc, CD, CR)
                shape.ra_bl, shape.dec_bl = pix_to_world(bl, CD, CR)
                shape.ra_br, shape.dec_br = pix_to_world(br, CD, CR)
                shape.ra_bc, shape.dec_bc = pix_to_world(bc, CD, CR)
                print("Completed " + shape.__repr__())
            ann.repaired = True
            fixed_ann_ids.append(ann.a_id)
        dubious_ann_ids = list(set(dubious_ann_ids))
        print(
            "The following annotation ids contained no correct reference shape,"
            "thus a repair could not be attempted:" + str(irrepairable_ann_ids)
        )
        print(
            "The following annotation ids contained broken shapes where the shape's "
            "pixel coords heavily disagreed with the shape's projected world coords, "
            "thus the repair may be incorrect:" + str(dubious_ann_ids)
        )
        print("The following annotation ids could not be repaired as no good reference "
              "shape could be found:" + str(unsuccessful_ann_ids))
        commit_db(
            "Repaired annotation ids: " + str(sorted(fixed_ann_ids)) + "."
        )
        return fixed_ann_ids


def parse_none_bool(x):
    if x.lower() == 'true':
        return True
    if x.lower() == 'false':
        return False
    return None


def commit_db(msg):
    answer = ""
    while answer not in ["y", "n"]:
        answer = input(msg + " Confirm db commit [Y/N]? ").lower()
    if answer == "y":
        db.session.commit()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--set_repaired_column',
        default=None, type=parse_none_bool,
        choices=[None, False, True],
        help='Sets repaired=False for all annotations')
    args = parser.parse_args()

    if args.set_repaired_column is not None:
        app = create_app()
        with app.app_context():
            for ann in Annotation.query.all():
                ann.repaired = args.set_repaired_column
            commit_db(
                "Setting repaired=" +
                str(args.set_repaired_column) +
                " for all annotations."
            )
    else:
        repair_annotations()




if __name__ == "__main__":
    main()
