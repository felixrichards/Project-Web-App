from flask import render_template, request, jsonify,flash, redirect,url_for
from app import app,db
from app.models import Galaxy, Annotation
from app.utils import get_random_galaxy
import random


@app.route('/')
@app.route('/index')
def index():
    user={'username':'Felix'}
    return render_template('index.html', title='Home',user=user)
    
    
@app.route('/annotate')
def annotate():
    galaxy=get_random_galaxy()
    return redirect(url_for('annotate_by_id',g_id=galaxy.g_id))

@app.route('/annotate/name/<name>')
def annotate_by_name(name):
    galaxy=Galaxy.query.filter_by(name=name).one_or_none()
    if (galaxy==None):
        return annotate()
    return annotate_by_id(galaxy.g_id)
    #return redirect(url_for('annotate_by_id',g_id=galaxy.g_id))
    
    
@app.route('/annotate/id/<int:g_id>',methods=['GET','POST'])
def annotate_by_id(g_id):
    galaxy=Galaxy.query.get(g_id)
    
    if request.method=='POST':
        shapes=request.get_json()
        a = Annotation(galaxy)
        print(shapes[0])
    
    
    dim={'width':800,'height':700,'image_width':500,'image_height':500}
    return render_template('annotate.html',title='Annotate',file=galaxy,dim=dim)
    
