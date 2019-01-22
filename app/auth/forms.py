from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, SelectField, PasswordField, BooleanField
from wtforms.validators import ValidationError, DataRequired, Email
from flask_babel import _, lazy_gettext as _l
from app.models import User


class LoginForm(FlaskForm):
    username = StringField(_l('Username'), validators=[DataRequired()])
    password = PasswordField(_l('Password'))
    submit = SubmitField(_l('Sign In'))


class RegistrationForm(FlaskForm):
    username = StringField(_l('Username'), validators=[DataRequired()])
    email = StringField(_l('Email'), validators=[DataRequired(), Email()])
    submit = SubmitField(_l('Register'))

    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user is not None:
            raise ValidationError(_('Please use a different username.'))

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError(_('Please use a different email address.'))


class PasswordForm(FlaskForm):
    password = PasswordField(_l('Password'), validators=[DataRequired()])
    submit = SubmitField(_l('Set Password'))


class SearchForm(FlaskForm):
    search = StringField(_l('Search'), validators=[DataRequired()])
    submit = SubmitField(_l('Search'))


class ResultsForm(FlaskForm):
    username = StringField(_l('Username'), validators=[DataRequired()], render_kw={'readonly': True})
    access = SelectField(_l('Access'), coerce=int)
    reset_password = BooleanField(_l('Reset Password?'))
    submit = SubmitField(_l('Set Access'))

    def set_choices(self, access):
        if access == 2:
            self.access.choices = [(0, 'Basic'), (1, 'Expert')]
        if access == 3:
            self.access.choices = [(0, 'Basic'), (1, 'Expert'), (2, 'Superuser')]
