from flask import render_template, request, redirect, url_for, session
from flask.views import MethodView
from app import app, db
from app.models import Galaxy, Annotation
from app.utils import get_random_galaxy


class AnnotateView(MethodView):
    def get(self, g_id=None, g_name=None, g_survey=None):
        if 'advanced' not in session:
            session['advanced'] = 0
        if g_id is None and g_name is None and g_survey is None:
            # no given id or name
            galaxy = get_random_galaxy()
            # comment out to keep url as /annotate
            
            if session['advanced']:
                return redirect(url_for('annotate_by_id',g_id=galaxy.g_id))
        
        if g_id is not None:
            # find galaxy by id
            galaxy = Galaxy.query.get(g_id)
            
        if g_name is not None:
            # find galaxy by name
            galaxy = Galaxy.query.filter_by(name=g_name).one_or_none()
            
        if g_survey is not None:
            # find galaxy by survey
            galaxy = get_random_galaxy(survey=g_survey)

        session['g_id'] = galaxy.g_id
        
        return render_template('annotate.html', title='Annotate', galaxy=galaxy)
    
    def post(self, g_id=None, g_name=None):
        shapes = request.get_json()
        print("In post request")
        print(session['g_id'])
        a = Annotation(g_id=session['g_id'], shapes=shapes)
        return ""
