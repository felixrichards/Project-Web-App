from flask import render_template, request, redirect, url_for, session
from flask.views import MethodView
from app.models import Galaxy, Annotation, Shape
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
                return redirect(url_for('.annotate_by_id',g_id=galaxy.g_id))
        
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
        if a_id is not None:
            annotation = Annotation.query.filter_by(a_id=a_id).one_or_none()
            if annotation is None:
                return redirect(url_for('.annotate'))

            shapes = Shape.query.filter_by(a_id=a_id).all()
            galaxy = Galaxy.query.filter_by(g_id=annotation.g_id).one_or_none()

        session['g_id'] = galaxy.g_id
        
        return render_template('annotate.html', title='Annotate', galaxy=galaxy, shapes=shapes)
    
    def post(self, g_id=None, g_name=None, g_survey=None, a_id=None):
        shapes = request.get_json()
        print("In post request")
        print(session['g_id'])
        if a_id is not None:
            a = Annotation.query.filter_by(a_id=a_id).one_or_none()
            
        else:
            a = Annotation(g_id=session['g_id'], shapes=shapes)
        # db.session.flush()
        # db.session.refresh()
        db.session.commit()
        a_id = a.a_id
        return json.dumps({"a_id": a_id}), 200, {'ContentType':'application/json'} 
