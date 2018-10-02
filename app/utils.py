from app.models import Galaxy, Annotation
import random


def get_random_galaxy(survey=None):
    if survey is None:
        rand = random.randrange(1, Galaxy.query.count()+1)
    return Galaxy.query.get(rand)
