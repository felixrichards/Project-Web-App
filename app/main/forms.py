from flask_wtf import FlaskForm
from wtforms import SubmitField
from flask_babel import _, lazy_gettext as _l
from app.models import User


class DownloadForm(FlaskForm):
    submit = SubmitField(_l('Download Masks'))
