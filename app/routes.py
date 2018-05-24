from flask import render_template, request, jsonify,flash
from app import app,db
from app.models import Galaxy
import random

@app.route('/')
@app.route('/index')
def index():
    user={'username':'Felix'}
    return render_template('index.html', title='Home',user=user)
    
@app.route('/annotate',methods=['GET','POST'])
def annotate():
    if request.method=='POST':
        shapes=request.get_json()
        print(shapes[0])
        
    file=genFile()
    dim={'width':800,'height':700,'image_width':500,'image_height':500}
    return render_template('annotate.html',title='Annotate',file=file,dim=dim)
    
def genFile(survey=None):
    if (survey==None):
        rand=random.randrange(1,Galaxy.query.count()+1)
    return Galaxy.query.get(rand)