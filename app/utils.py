from app.models import Galaxy, Annotation
from flask_login import current_user
import random

# Attempts to return list of galaxies not already annotated by the user
# Returns empty list if no active galaxies
# Returns none if no active galaxies that user has not annotated
def get_random_galaxy(survey=None):
    if survey is None:
        gals = Galaxy.query.filter(Galaxy.active == True).all()
        if current_user.is_authenticated:  # Attmept to give user a galaxy they have not annotated.
            my_anns = Annotation.query.filter(Annotation.u_id == current_user.get_id()).all()
            my_anns_g_id = [a.g_id for a in my_anns]
            new_gals = [g for g in gals if g.g_id not in my_anns_g_id]
            if not new_gals:
                return None
            else:
                gals = new_gals

    if not gals:  # if list is empty
        return gals
    print("Here")
    return random.choice(gals)
