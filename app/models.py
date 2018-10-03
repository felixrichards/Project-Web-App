from app import db
from sqlalchemy.sql import func
import sqlalchemy.dialects.postgresql as psql


class Galaxy(db.Model):
    g_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), index=True, unique=True)
    survey = db.Column(db.String(64), index=True)
    ra = db.Column(psql.FLOAT, index=True)
    dec = db.Column(psql.FLOAT, index=True)
    annotations = db.relationship('Annotation', backref='name', lazy='dynamic')

    def __repr__(self):
        return '<Galaxy ID: {}. Name: {}.>'.format(self.g_id, self.name)


class Annotation(db.Model):
    a_id = db.Column(db.Integer, primary_key=True)
    g_id = db.Column(db.Integer, db.ForeignKey('galaxy.g_id'))
    timestamp = db.Column(db.DateTime, index=True, default=func.now(), server_default=func.now())
    shapes = db.relationship('Shape', backref='name', lazy='dynamic')

    def __init__(self, **kwargs):
        shapes = kwargs.pop('shapes')
        print("In annotation record creation")
        print("kwargs are")
        print(kwargs)
        super(Annotation, self).__init__(**kwargs)
        print(self)
        for shape in shapes:
            s = Shape(a_id=self.a_id, shape=shape['shape'],
                        number=shape['id'], feature=shape['noFeature'],
                        x0=shape['x0'], y0=shape['y0'])
            if shape['shape'] == 'Rect' or shape['shape'] == 'Circle' or shape['shape'] == 'Ellipse':
                s.ra_xy = shape['xy_ra']
                s.dec_xy = shape['xy_dec']
                s.xw = shape['x'] + shape['w']
                s.yh = shape['y'] + shape['h']
                s.ra_xy = shape['wh_ra']
                s.dec_xy = shape['wh_dec']
                s.theta = shape['theta']
            if shape['shape'] == 'Line':
                s.ra_xy = shape['xy_ra']
                s.dec_xy = shape['xy_dec']
                s.x1 = shape['x1']
                s.x2 = shape['x2']
                s.x3 = shape['x3']
                s.y1 = shape['y1']
                s.y2 = shape['y2']
                s.y3 = shape['y3']
                s.ra1 = shape['xy1_ra']
                s.ra2 = shape['xy2_ra']
                s.ra3 = shape['xy3_ra']
                s.dec1 = shape['xy1_dec']
                s.dec2 = shape['xy2_dec']
                s.dec3 = shape['xy3_dec']
            if shape['shape'] == 'Region' or shape['shape'] == 'Freehand':
                s.x_points = [si['x'] for si in shape['points']]
                s.y_points = [si['y'] for si in shape['points']]
                s.ra_points = [si['xy_ra'] for si in shape['points']]
                s.dec_points = [si['xy_dec'] for si in shape['points']]
            if shape['shape'] == 'Snake':
                s.x_points = [si['x_t'] for si in shape['points']]
                s.y_points = [si['y_t'] for si in shape['points']]
                s.ra_points = [si['xy_t_ra'] for si in shape['points']]
                s.dec_points = [si['xy_t_dec'] for si in shape['points']]
                s.x_points += [si['x_b'] for si in reversed(shape['points'])]
                s.y_points += [si['y_b'] for si in reversed(shape['points'])]
                s.ra_points += [si['xy_b_ra'] for si in reversed(shape['points'])]
                s.dec_points += [si['xy_b_dec'] for si in reversed(shape['points'])]
            db.session.add(s)
        print("added shapes")

    def __repr__(self):
        return '<Annotation ID: {}. Galaxy ID: {}. Timestamp: {}>'.format(self.a_id, self.g_id, self.timestamp)


class Shape(db.Model):
    s_id = db.Column(db.Integer, primary_key=True)
    a_id = db.Column(db.Integer, db.ForeignKey('annotation.a_id'))
    shape = db.Column(db.String(64), index=True, nullable=False)
    number = db.Column(db.Integer, nullable=False)
    feature = db.Column(db.String(32), nullable=False)
    x0 = db.Column(psql.FLOAT, nullable=False)
    y0 = db.Column(psql.FLOAT, nullable=False)
    ra_xy = db.Column(psql.FLOAT)
    dec_xy = db.Column(psql.FLOAT)
    theta = db.Column(psql.FLOAT)
    xw = db.Column(psql.FLOAT)
    yh = db.Column(psql.FLOAT)
    ra_wh = db.Column(psql.FLOAT)
    dec_wh = db.Column(psql.FLOAT)
    r = db.Column(psql.FLOAT)
    x1 = db.Column(psql.FLOAT)
    x2 = db.Column(psql.FLOAT)
    x3 = db.Column(psql.FLOAT)
    y1 = db.Column(psql.FLOAT)
    y2 = db.Column(psql.FLOAT)
    y3 = db.Column(psql.FLOAT)
    ra1 = db.Column(psql.FLOAT)
    ra2 = db.Column(psql.FLOAT)
    ra3 = db.Column(psql.FLOAT)
    dec1 = db.Column(psql.FLOAT)
    dec2 = db.Column(psql.FLOAT)
    dec3 = db.Column(psql.FLOAT)
    x_points = db.Column(psql.ARRAY(psql.FLOAT))
    y_points = db.Column(psql.ARRAY(psql.FLOAT))
    ra_points = db.Column(psql.ARRAY(psql.FLOAT))
    dec_points = db.Column(psql.ARRAY(psql.FLOAT))

    def __repr__(self):
        return '<Shape ID: {}. Annotation ID: {}. Shape: {}>'.format(self.s_id, self.a_id, self.shape)
