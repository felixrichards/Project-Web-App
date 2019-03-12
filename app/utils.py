from app.models import Galaxy, Annotation
import random


def get_random_galaxy(survey=None):
    if survey is None:
        start = Galaxy.query.first().g_id
        rand = random.randrange(start, start+Galaxy.query.count())
    return Galaxy.query.get(rand)
