from app.models import Galaxy, Annotation, Shape
from astropy.io import fits
from astropy.wcs import WCS
from flask import url_for
from flask_login import current_user
import os
import random
import numpy as np
import cv2
import datetime
import zipfile
from io import BytesIO
from app import Config
from app.draw import get_draw_function


# Attempts to return list of galaxies not already annotated by the user
# Returns empty list if no active galaxies
# Returns none if no active galaxies that user has not annotated
def get_random_galaxy(survey=None):
    if survey is None:
        gals = Galaxy.query.filter(Galaxy.active == True).all()
        if current_user.is_authenticated:  # Attmept to give user a galaxy they have not annotated.
            my_anns = Annotation.query.filter(Annotation.u_id == current_user.get_id()).all()
            my_anns_g_id = [a.g_id for a in my_anns]
            new_gals = [g for g in gals if g.g_id not in my_anns_g_id]
            if not new_gals:
                return None
            else:
                gals = new_gals

    if not gals:  # if list is empty
        return gals
    return random.choice(gals)


def get_annotations(annotations, features, segmentation_type='semantic', file_type='fits'):
    def get_first_fits(path):
        walk = list(os.walk(galaxy_fits_path))
        for item in walk:
            if item[2]:
                fpath = item[2][0]
                if fpath[len(fpath)-4:] == 'fits':
                    return os.path.join(item[0], fpath)

    images = []
    names = []
    centres = []
    for annotation in annotations:
        # Somehow I set backref as 'name' for the Annotation's relationship with Galaxy
        galaxy_fits_path = os.path.join(
            Config.PATH_TO_FITS_HEADERS,
            annotation.name.name
        )

        # Retrive path to first fits file for galaxy and create annotation mask
        first_fits = get_first_fits(galaxy_fits_path)
        if first_fits is not None:
            header = fits.getheader(first_fits)
            image, name, centre = create_image(annotation, features, header, segmentation_type, file_type)
            images.append(image)
            names.append(name)
            centres.append(centre)
            annotations.pop(0)

    return images, names, centres, annotations


def binary_mask(mask_size, features, shapes, wcs):
    array = np.zeros(mask_size, dtype=np.uint8)
    for i, feature in enumerate(features):
        feature_shapes = [s for s in shapes if s.feature == feature]
        for shape in feature_shapes:
            draw = get_draw_function(shape.shape)
            draw(array[0], shape, wcs)

    return array


def semantic_mask(mask_size, features, shapes, wcs):
    array = np.zeros(mask_size, dtype=np.uint8)
    for i, feature in enumerate(features):
        feature_shapes = [s for s in shapes if s.feature == feature]
        for shape in feature_shapes:
            draw = get_draw_function(shape.shape)
            draw(array[i], shape, wcs)

    return array


def instance_mask(mask_size, features, shapes, wcs):
    pass


def create_image(annotation, features, header, segmentation_type='semantic', file_type='fits'):
    def construct_mask_header(header, mask_size):
        return fits.Header({
            'SIMPLE': 'T',
            'BITPIX': '1',
            'NAXIS': 3,
            'NAXIS1': mask_size[2],
            'NAXIS2': mask_size[1],
            'NAXIS3': mask_size[0],
            'DATE': f'{datetime.datetime.now()}',
            'OBJECT': header['OBJECT'],
            'CTYPE1': header['CTYPE1'],
            'CUNIT1': header['CUNIT1'],
            'CRVAL1': header['CRVAL1'],
            'CRPIX1': header['CRPIX1'],
            'CD1_1': header['CD1_1'],
            'CTYPE2': header['CTYPE2'],
            'CUNIT2': header['CUNIT2'],
            'CRVAL2': header['CRVAL2'],
            'CRPIX2': header['CRPIX2'],
            'CD2_2': header['CD2_2'],
        })

    # Filter annotated shapes by feature
    annotated_shapes = Shape.query.filter_by(a_id=annotation.a_id)
    if features is not None:
        annotated_shapes = annotated_shapes.filter(Shape.feature.in_(features))
    else:
        features = [s.feature for s in annotated_shapes.all()]
    annotated_shapes = annotated_shapes.all()

    # Select mask type
    if segmentation_type == 'binary':
        naxis3 = 1
        generate_mask = binary_mask
    elif segmentation_type == 'semantic':
        naxis3 = len(features)
        generate_mask = semantic_mask
    elif segmentation_type == 'instance':
        naxis3 = len(annotated_shapes)
        generate_mask = instance_mask

    # Generate mask + header
    mask_size = (naxis3, header['NAXIS2'], header['NAXIS1'])
    mask_header = construct_mask_header(header, mask_size)
    wcs = WCS(mask_header, naxis=2)
    mask = generate_mask(mask_size, features, annotated_shapes, wcs)

    # Create filename with args in form 'key1=val1&key2=val2&...&keyN=valN
    name = '-'.join(
        f'{var_name}={var}'
        for var, var_name in zip(
            [annotation.name.name, annotation.a_id, annotation.u_id, features, segmentation_type],
            ['name', 'a_id', 'user', 'features', 'seg_type']
        )
    )

    # Add file extension
    if file_type == 'fits':
        mask = fits.PrimaryHDU(data=mask, header=mask_header)
        name += '.fits'
    elif file_type == 'np':
        mask = mask.astype(np.bool)
        name += '.npz'

    return mask, name, (annotation.name.ra, annotation.name.dec)


def compress_images(images, filenames, centres, missing_headers):
    def write_image(image, centre, file_object):
        if isinstance(image, np.ndarray):
            np.savez(file_object, shape=image.shape, centre=centre, mask=np.packbits(image))
        elif isinstance(image,  fits.PrimaryHDU):
            image.writeto(file_object)

    zip_memory_file = BytesIO()
    with zipfile.ZipFile(zip_memory_file, 'w') as zf:
        for filename, image, centre in zip(filenames, images, centres):
            file_object = BytesIO()
            write_image(image, centre, file_object)
            zf.writestr(
                filename,
                file_object.getbuffer(),
                compress_type=zipfile.ZIP_DEFLATED
            )
        zf.writestr(
            'missing_headers.txt',
            '\n'.join(
                f'{a.name.name}, a_id={a.a_id}' for a in
                sorted(missing_headers, key=lambda a: a.name.name)
            )
        )
    zip_memory_file.seek(0)
    return zip_memory_file
