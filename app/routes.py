from flask import render_template, request, flash, redirect, url_for, session, g, url_for
from app import app, db
from app.models import Galaxy, Annotation
from app.utils import get_random_galaxy
from app.views import AnnotateView
import os


def create_annotation_route(url, endpoint, view=AnnotateView):
    annotate_view = view.as_view(endpoint)
    app.add_url_rule(url, defaults={},
                     view_func=annotate_view, methods=['GET',])
    app.add_url_rule(url, view_func=annotate_view, methods=['POST',])


create_annotation_route('/annotate', 'annotate')
create_annotation_route('/annotate/id/<g_id>', 'annotate_by_id')
create_annotation_route('/annotate/name/<g_name>', 'annotate_by_name')
create_annotation_route('/annotate/name/<g_survey>', 'annotate_by_survey')

@app.route('/')
@app.route('/home')
def index():
    return render_template('home.html', title='Home')

@app.route('/team')
def team():
    return render_template('team.html', title='Team')

@app.route('/funding')
def funding():
    return render_template('funding.html', title='Funding')

@app.route('/news')
def news():
    with open("News.txt", "r") as ins:
        news = []
        for line in ins:
            news.append(line)
        
        return render_template('news.html', title='News', news=news)

@app.route('/tutorial')
def Tutorial():
    return render_template('tutorial.html', title='Tutorial')

@app.route('/AdvancedLogin', methods=['GET', 'POST'])
def AdvancedAccess():
    if request.method == 'POST':
        session['advanced']=0
        if request.form['password'] == 'NGC-5457':
            session['advanced']=1
            return redirect(url_for('annotate'))

    return render_template('AdvancedLogin.html')

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
        return render_template('updates.html')
            
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