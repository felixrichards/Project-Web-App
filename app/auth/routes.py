from flask import render_template, redirect, url_for, request, flash
from flask_login import login_user, logout_user, current_user
from flask_babel import _
from werkzeug.urls import url_parse
from app import db
from app.auth import bp
from app.auth.forms import LoginForm, RegistrationForm
from app.models import User
import json


# @bp.route('/<callback>/login')
# def login_popup(callback):
#     # user = User.query.filter_by(username=username).first_or_404()
#     return render_template('login_popup.html')


@bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    print("Login route")
    print(request.form)
    form = LoginForm()
    print("Form accepted")
    if form.validate_on_submit():
        print("post")
        user = User.query.filter_by(username=form.username.data).first()
        if user is None:
            print("Invalid authentication")
            return json.dumps({"success": False}), 400, {'ContentType': 'application/json'}
        print("Valid authentication")
        login_user(user, remember=form.remember_me.data)
        return json.dumps({"success": True}), 200, {'ContentType': 'application/json'}
    return render_template('login.html', title=_('Sign In'), form=form)


@bp.route('/logout')
def logout():
    logout_user()
    print(request.endpoint)
    return redirect(url_for('main.index'))


@bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash(_('Congratulations, you are now a registered user!'))
        return redirect(url_for('auth.login'))
    return render_template('auth/register.html', title=_('Register'),
                           form=form)