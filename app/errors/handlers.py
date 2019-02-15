from flask import render_template
from app import db
from app.errors import bp


@bp.app_errorhandler(401)
def forbidden(error):
    return render_template('errors/401.html', title='401'), 401


@bp.app_errorhandler(403)
def forbidden(error):
    return render_template('errors/403.html', title='403'), 403


@bp.app_errorhandler(404)
def not_found_error(error):
    return render_template('errors/404.html', title='404'), 404


@bp.app_errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('errors/500.html', title='500'), 500
