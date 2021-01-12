from flask import render_template, request, redirect, url_for, session, g, send_from_directory
from flask_login import current_user
from app import db, Config
from app.models import Galaxy, Annotation, User
from app.main.views import AnnotateView, ListAnnotationView, GetAnnotationView
from app.main import bp
from app.main.forms import DownloadForm


def create_annotation_route(url, endpoint, view=AnnotateView):
    annotate_view = view.as_view(endpoint)
    bp.add_url_rule(url, defaults={},
                    view_func=annotate_view, methods=['GET',])
    bp.add_url_rule(url, view_func=annotate_view, methods=['POST',])


def create_get_route(url, endpoint, view=ListAnnotationView):
    list_annotate_view = view.as_view(endpoint)
    bp.add_url_rule(url, defaults={},
                    view_func=list_annotate_view, methods=['GET',])


create_annotation_route('/annotate', 'annotate')
create_annotation_route('/annotate/id/<g_id>', 'annotate_by_id')
create_annotation_route('/annotate/name/<g_name>', 'annotate_by_name')
create_annotation_route('/annotate/name/<g_survey>', 'annotate_by_survey')
create_annotation_route('/verify/id/<a_id>', 'verify_by_id')

create_get_route('/view_annotations/<username>', 'view_user_annotations')
create_get_route('/view_annotations', 'view_annotations')

create_get_route('/get_annotations/<a_ids>', 'get_annotations', view=GetAnnotationView)


@bp.route('/cdn/<path:filename>')
def survey_static(filename):
    if Config.PATH_TO_SURVEYS == '':
        return redirect(url_for('static', filename=filename))
    return send_from_directory(Config.PATH_TO_SURVEYS, filename)


@bp.route('/')
@bp.route('/home')
def index():
    return render_template('home.html', title='Home')


@bp.route('/team')
def team():
    return render_template('team.html', title='Team')


@bp.route('/funding')
def funding():
    return render_template('funding.html', title='Funding')


@bp.route('/news')
def news():
    with open("News.txt", "r") as ins:
        news = []
        for line in ins:
            news.append(line)
        return render_template('news.html', title='News', news=news)


@bp.route('/tutorial')
def Tutorial():
    return render_template('tutorial.html', title='Tutorial')


@bp.route('/AdvancedLogin', methods=['GET', 'POST'])
def AdvancedAccess():
    if request.method == 'POST':
        session['advanced'] = 0
        if request.form['password'] == 'NGC-5457':
            session['advanced'] = 1
            return redirect(url_for('annotate'))

    return render_template('AdvancedLogin.html')


@bp.route('/NGC-1300', methods=['GET', 'POST'])
def TempLogin():
    if request.method == 'POST':
        session.pop('user', None)

        if request.form['password'] == 'NGC-5457':
            session['user'] = 'Andromeda'
            return redirect(url_for('protected'))

    return render_template('Anonymous.html')


@bp.route('/AccessGranted', methods=['GET', 'POST'])
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


@bp.before_request
def before_request():
    g.user = None
    if 'user' in session:
        g.user = session['user']


@bp.route('/getsession')
def getsession():
    if 'user' in session:
        return session['user']
    return 'Not logged in!'


@bp.route('/dropsession')
def dropsession():
    session.pop('user', None)
    return 'Dropped!'