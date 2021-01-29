import os
from dotenv import load_dotenv


basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))


class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY')
    CSRF_ENABLED = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.sqlite3')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    PATH_TO_SURVEYS = os.environ.get('PATH_TO_SURVEYS')
    PATH_TO_FITS_HEADERS = os.environ.get('PATH_TO_FITS_HEADERS')
