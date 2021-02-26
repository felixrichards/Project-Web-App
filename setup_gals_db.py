import os
from os.path import join
from app import db, create_app
from app.models import Galaxy, User


def load_hips_prop(fpath):
    prop_list = open(join(fpath, "properties"), "r").readlines()
    properties = {}
    for prop in prop_list:
        prop_key = prop.split(' ', 1)[0]
        if prop_key[0] != '#':
            properties[prop_key] = prop[23:len(prop)-2]
    return properties


app = create_app()
base_survey_path = "D:/MATLAS Data/HiPS/Surveys"
with app.app_context():
    Galaxy.query.filter().update({"active": False})
    surveys = next(os.walk(base_survey_path))[1]
    for survey in surveys:
        gals = next(os.walk(join(base_survey_path, survey)))[1]
        for gal in gals:
            bands = next(os.walk(join(base_survey_path, survey, gal)))[1]
            properties = load_hips_prop(join(base_survey_path, survey, gal, bands[0]))
            check_dup = Galaxy.query.filter_by(name=gal)
            if check_dup.count() == 0:
                continue
                # g = Galaxy(name=gal, survey=survey, bands=",".join(bands),
                #            ra=float(properties['hips_initial_ra']),
                #            dec=float(properties['hips_initial_dec']),
                #            fov=float(properties['hips_initial_fov']))
                # db.session.add(g)
            else:
                print("Record already exists, updating bands/surveys", check_dup.all())
                dup = check_dup.first()
                if "col" in bands:
                    bands.remove("col")
                    bands.insert(0, "col")
                dup.survey = ",".join(surveys)
                dup.bands = ",".join(bands)
                check_dup.update({"active": True})
    db.session.flush()
    db.session.commit()
