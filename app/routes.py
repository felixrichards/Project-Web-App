from flask import render_template
from app import app

@app.route('/')
@app.route('/index')
def index():
    user={'username':'Felix'}
    return render_template('index.html', title='Home',user=user)
    
@app.route('/annotate')
def annotate():
    file=genFile()
    return render_template('annotate.html',file=file)
    