from app.models import Galaxy
import random


def get_random_galaxy(survey=None):
    if survey is None:
        gals = Galaxy.query.filter(Galaxy.active == True).all()
    return random.choice(gals)
