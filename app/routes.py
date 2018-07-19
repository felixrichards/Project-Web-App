from flask import render_template, request, jsonify,flash, redirect,url_for, session, redirect, g, url_for
from app import app,db
from app.models import Galaxy, Annotation
from app.utils import get_random_galaxy
from app.views import AnnotateView
import random
import os
import sys

app.secret_key = os.urandom(24)

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
@app.route('/News')
def News():
	with open("News.txt", "r") as ins:
		news = []
		for line in ins:
			news.append(line)
		
		return render_template('News.html', title='Team', news=news)

@app.route('/')
@app.route('/Tutorial')
def Tutorial():
    user={'username':'Felix'}
    return render_template('Tutorial.html', title='Team',user=user)

@app.route('/NGC-1300', methods=['GET', 'POST'])
def Login():
    if request.method == 'POST':
        session.pop('user', None)

        if request.form['password'] == 'NGC-5457':
            session['user'] = 'Andromeda'
            return redirect(url_for('protected'))

    return render_template('Anonymous.html')

@app.route('/AccessGranted', methods=['GET', 'POST'])
def protected():
	if request.method == 'POST':
		subject = request.form['subject']
		date = request.form['date']
		with open("News.txt", "a") as myfile:
			myfile.write(date + "\n")
			myfile.write(subject + "\n")
		return redirect(url_for('News'))

	if g.user:
		return render_template('Updates.html')
			
	return redirect(url_for('index'))

@app.before_request
def before_request():
    g.user = None
    if 'user' in session:
        g.user = session['user']

@app.route('/getsession')
def getsession():
    if 'user' in session:
        return session['user']

    return 'Not logged in!'

@app.route('/dropsession')
def dropsession():
    session.pop('user', None)
    return 'Dropped!'

if __name__ == '__main__':
    app.run(debug=True)