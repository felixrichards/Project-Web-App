from flask import render_template, request, jsonify,flash, redirect,url_for
from app import app,db
from app.models import Galaxy, Annotation
from app.utils import get_random_galaxy
from app.views import AnnotateView
import random


def create_annotation_route(url, endpoint, view=AnnotateView):
    annotate_view = view.as_view(endpoint)
    app.add_url_rule(url, defaults={},
                     view_func=annotate_view, methods=['GET',])
    app.add_url_rule(url, view_func=annotate_view, methods=['POST',])

create_annotation_route('/annotate','annotate')
create_annotation_route('/annotate/','annotate/')
create_annotation_route('/annotate/id/<g_id>','annotate_by_id')
create_annotation_route('/annotate/name/<g_name>','annotate_by_name')
create_annotation_route('/annotate/name/<g_survey>','annotate_by_survey')

@app.route('/')
@app.route('/index')
def index():
    user={'username':'Felix'}
    return render_template('index.html', title='Home',user=user)
    
    