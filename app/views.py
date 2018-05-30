from flask.views import View,MethodView
from app import app,db
from app.models import Galaxy, Annotation
from app.utils import get_random_galaxy

class AnnotateView(MethodView):
    galaxy={}
    
    def get(self, g_id=None,g_name=None,g_survey=None):
        if g_id is None and g_name is None and g_survey is None:
            # no given id or name
            galaxy=get_random_galaxy()
        
        if g_id is not None:
            # find galaxy by id
            galaxy=Galaxy.query.get(g_id)
            
        if g_name is not None:
            # find galaxy by name
            galaxy=Galaxy.query.filter_by(name=g_name).one_or_none()
            
        if g_survey is not None:
            # find galaxy by survey
            galaxy=get_random_galaxy(survey=g_survey)
            
        if galaxy is None:
            # incorrect id or name
            galaxy=get_random_galaxy()
            
            
        dim={'width':800,'height':700,'image_width':500,'image_height':500}
        return render_template('annotate.html',title='Annotate',file=galaxy,dim=dim)
    
    def post(self):
        shapes=request.get_json()
        a = Annotation(galaxy)
        print(shapes[0])
