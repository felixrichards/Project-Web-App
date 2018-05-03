from flask import render_template
from app import app,db
from app.models import Galaxy
import random

@app.route('/')
@app.route('/index')
def index():
    user={'username':'Felix'}
    return render_template('index.html', title='Home',user=user)
    
@app.route('/annotate')
def annotate():
    file=genFile()
    dim={'width':1000,'height':1000,'image_width':500,'image_height':500}
    return render_template('annotate.html',title='Annotate',file=file,dim=dim)
    
def genFile(survey=None):
    if (survey==None):
        rand=random.randrange(1,Galaxy.query.count()+1)
    return Galaxy.query.get(rand)