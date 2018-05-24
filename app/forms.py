from flask_wtf import FlaskForm
from wtforms import SubmitField
import wtforms_json

class AnnotationForm(FlaskForm):
    shapes
    submit=SubmitField('Submit')