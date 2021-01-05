from flask import render_template, request, redirect, url_for, session
from flask.views import MethodView
from flask_login import current_user
from app.models import Galaxy, Annotation, Shape, User
from app.utils import get_random_galaxy
from app import db
import json


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

        if galaxy is None:
            return render_template('complete.html', title='Complete')
        if not galaxy:  # if list is empty
            return render_template('empty.html', title='No Galaxies')

        shapes = None
        # verify annotation
        if a_id is not None:
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
    def get(self, a_ids=None):
        pass
