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

create_annotation_route('/Annotate','annotate')
create_annotation_route('/Annotate/','annotate/')
create_annotation_route('/Annotate/id/<g_id>','annotate_by_id')
create_annotation_route('/Annotate/name/<g_name>','annotate_by_name')
create_annotation_route('/Annotate/name/<g_survey>','annotate_by_survey')

@app.route('/')
@app.route('/Home')
def index():
    user={'username':'Felix'}
    return render_template('Home.html', title='Home',user=user)

@app.route('/')
@app.route('/MeetTheTeam')
def MeetTheTeam():
    user={'username':'Felix'}
    return render_template('MeetTheTeam.html', title='Team',user=user)

@app.route('/')
@app.route('/Funding')
def Funding():
    user={'username':'Felix'}
    return render_template('Funding.html', title='Team',user=user)

@app.route('/')
@app.route('/Tutorial')
def Tutorial():
    user={'username':'Felix'}
    return render_template('Tutorial.html', title='Team',user=user)