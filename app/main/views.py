from flask import render_template, request, redirect, url_for, session, send_file
from flask.views import MethodView
from flask_login import current_user
from app.models import Galaxy, Annotation, Shape, User
from app.utils import get_random_galaxy, get_annotations, compress_images
from app import db
import json
from werkzeug.wrappers import Response


class AnnotateView(MethodView):
    def get(self, g_id=None, g_name=None, g_survey=None, a_id=None):
        if 'advanced' not in session:
            session['advanced'] = 0
        if g_id is None and g_name is None and g_survey is None:
            # no given id or name
            galaxy = get_random_galaxy()
            # comment out to keep url as /annotate

            if session['advanced']:
                return redirect(url_for('.annotate_by_id', g_id=galaxy.g_id))

        if g_id is not None:
            # find galaxy by id
            galaxy = Galaxy.query.get(g_id)

        if g_name is not None:
            # find galaxy by name
            galaxy = Galaxy.query.filter_by(name=g_name).one_or_none()

        if g_survey is not None:
            # find galaxy by survey
            galaxy = get_random_galaxy(survey=g_survey)

        shapes = None
        if a_id is None:
            if galaxy is None:
                return render_template('complete.html', title='Complete')
            if not galaxy:  # if list is empty
                print(a_id)
                return render_template('empty.html', title='No Galaxies')
        else:
            # verify annotation
            annotation = Annotation.query.filter_by(a_id=a_id).one_or_none()
            if annotation is None:
                return redirect(url_for('.annotate'))

            if not current_user.is_authenticated:
                # User is not logged in
                return redirect(url_for('auth.login'))
            if current_user.get_id() == annotation.u_id or current_user.is_advanced():
                shapes = Shape.query.filter_by(a_id=a_id).all()
                galaxy = Galaxy.query.filter_by(g_id=annotation.g_id).one_or_none()
            else:
                # User is not expert and annotation does not belong to current user
                return redirect(url_for('.annotate'))

        session['g_id'] = galaxy.g_id

        return render_template('annotate.html', title='Annotate', galaxy=galaxy, shapes=shapes)

    def post(self, g_id=None, g_name=None, g_survey=None, a_id=None, u_id=None):
        shapes = request.get_json()
        print("In post request")
        print(session['g_id'])
        if a_id is None:
            a = Annotation(g_id=session['g_id'], u_id=current_user.get_id(), shapes=shapes)
        else:
            a = Annotation.query.filter_by(a_id=a_id).one_or_none()
            a.modify_shapes(shapes)

        db.session.commit()
        a_id = a.a_id
        return json.dumps({"a_id": a_id,
                           "is_authenticated": current_user.is_authenticated}), 200, {'ContentType': 'application/json'} 


class ListAnnotationView(MethodView):
    def get(self, username=None):
        if current_user.is_authenticated:
            if username is None:
                if current_user.get_access() > 1:
                    anns = db.session.query(Annotation, Galaxy, User).\
                        join(User, Annotation.u_id == User.u_id).\
                        join(Galaxy, Galaxy.g_id == Annotation.g_id).\
                        all()
            else:
                u_id = User.query.filter_by(username=username).first().u_id
                anns = db.session.query(Annotation, Galaxy).\
                    join(Galaxy, Galaxy.g_id == Annotation.g_id).\
                    filter(Annotation.u_id == u_id).\
                    all()

            return render_template('annotations.html', title='View Annotations', anns=anns, show_users=(True if username is None else False))
        else:
            return redirect(url_for('error.unauthorised'))


class GetAnnotationView(MethodView):
    def get(self):
        """
        Retrieves annotation labels.

        Args:
            a_ids (list of str, optional): Annotation IDs to generate masks for.
                Defaults to None, in which case all annotation IDs will be considered.
            features (list of str, optional): Features to create masks for.
                Defaults to None, in which case all features will be considered.
            seg_type (list of str, optional): Type of segmentation mask to generate.
                Defaults to 'semantic'. Choices are ['binary', 'semantic', 'instance'].
            file_type (str, optional): File type to save annotations with.
                Defaults to 'fits', with a basic header. Choices are ['fits', 'np'].
                Numpy arrays are bit packed before zipping, call np.unpackbits before using. 

        Returns:
            500:
                description: Incorrect parameters.
            200:
                description: Generated annotation masks.

        """
        keys = list(request.args.keys())
        a_ids = None
        features = None
        seg_type = 'semantic'
        file_type = 'fits'

        # Grab annotations by a_ids
        if 'a_ids' in keys:
            a_ids = request.args.getlist('a_ids')
            annotations = Annotation.query.filter(Annotation.a_id.in_(a_ids))
        elif 'g_ids' in keys:
            g_ids = request.args.getlist('g_ids')
            annotations = Annotation.query.filter(Annotation.g_id.in_(g_ids))
        elif 'galaxies' in keys:
            g_names = request.args.getlist('galaxies')
            g_ids = [g.g_id for g in Galaxy.query.filter(Galaxy.name.in_(g_names))]
            annotations = Annotation.query.filter(Annotation.g_id.in_(g_ids))
        else:
            annotations = Annotation.query

        if 'features' in keys:
            features = request.args.getlist('features')
            # Trim annotations by removing those without desired features
            annotations = annotations.join(Shape).filter(Shape.feature.in_(features))
        if not annotations.all():
            feature_string = f" with features {', '.join(features)}" if features else ""
            return "No annotations found" + feature_string + "."

        if 'seg_type' in keys:
            seg_type = request.args['seg_type']

        if 'file_type' in keys:
            file_type = request.args['file_type']

        # Join with Galaxy table for name/ra/dec info
        annotations = annotations.join(Galaxy).all()
        images, names, centres, missing_headers = get_annotations(
            annotations=annotations,
            features=features,
            segmentation_type=seg_type,
            file_type=file_type
        )

        comp_images = compress_images(images, names, centres, missing_headers)

        return send_file(
            comp_images,
            attachment_filename='annotations.zip',
            as_attachment=True)
