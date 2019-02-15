from flask import render_template, redirect, url_for, request, flash, session
from flask_login import login_user, logout_user, current_user, login_required
from flask_babel import _
from app import db
from app.auth import bp
from app.auth.forms import LoginForm, RegistrationForm, SearchForm, ResultsForm, PasswordForm
from app.models import User
import json


@bp.before_app_request
def before_request():
    if request.endpoint != 'auth.password':
        if current_user.is_authenticated:
            if current_user.get_access() > 0:
                if current_user.check_password(""):
                    print(url_for(request.endpoint))
                    session['redirect_url'] = url_for(request.endpoint)
                    return redirect(url_for('auth.password'))


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
            return json.dumps({"success": False}), 200, {'ContentType': 'application/json'}
        print("Valid authentication")
        if user.check_password(form.password.data):
            login_user(user, remember=True)
            return json.dumps({"success": True,
                           "username": user.username,
                           "user_dropdown": render_template('user_dropdown.html')}), 200, {'ContentType': 'application/json'}
        else:
            return json.dumps({"success": False}), 200, {'ContentType': 'application/json'}
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
    print(form.validate_on_submit())
    if form.validate_on_submit():
        print(form.username.data)
        user = User(username=form.username.data, email=form.email.data, advanced=0)
        db.session.add(user)
        db.session.commit()
        login_user(user, remember=True)

        flash(_('Congratulations, you are now a registered user!'))
        return json.dumps({"success": True,
                           "username": user.username,
                           "user_dropdown": render_template('user_dropdown.html')}), 200, {'ContentType': 'application/json'}
    return render_template('register.html', title=_('Register'),
                           form=form)


@bp.route('/manage', methods=['GET', 'POST'])
@login_required
def manage():
    my_access = current_user.get_access()
    if my_access < 2:
        return url_for('error.forbidden')
    s_form = SearchForm()
    r_form = ResultsForm()
    r_form.set_choices(my_access)
    if s_form.validate_on_submit():
        user = User.query.filter_by(username=s_form.search.data).first()
        if user is not None:
            if user.advanced > 2 or user.advanced >= current_user.get_access():
                user = None
        return json.dumps({"success": True,
                            "html": render_template('search_results.html', user=user, form=r_form)}),\
            200, {'ContentType': 'application/json'}

    if r_form.validate_on_submit():
        print("results validated")
        user = User.query.filter_by(username=r_form.username.data).first()
        if my_access > r_form.access.data and my_access > user.get_access():
            old_access = user.get_access(as_str=True)
            user.set_access(r_form.access.data)
        if my_access == 3 and r_form.reset_password.data:
            user.set_password("")
        db.session.commit()
        new_access = user.get_access(as_str=True)
        return json.dumps({"success": True,
                           "old_access": old_access,
                           "new_access": new_access,
                           'reset': r_form.reset_password.data,
                           "username": user.username}), 200, {'ContentType': 'application/json'}

    print(r_form.errors)
    return render_template('manage.html', form=s_form)


@bp.route('/set_password', methods=['GET', 'POST'])
@login_required
def password():
    form = PasswordForm()

    if form.validate_on_submit():
        user = User.query.filter_by(username=current_user.username).first()
        user.set_password(form.password.data)
        db.session.commit()
        if 'redirect_url' not in session:
            session['redirect_url'] = url_for("main.index")
        if session['redirect_url'] == "auth.password":
            session['redirect_url'] = url_for("main.index")
        return json.dumps({"success": True,
                           "redirect": session['redirect_url']}), 200, {'ContentType': 'application/json'}

    print(form.errors)

    return render_template('password.html', form=form)
