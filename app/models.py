from app import db
from sqlalchemy.sql import func
import sqlalchemy.dialects.postgresql as psql


class Galaxy(db.Model):
    g_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), index=True, unique=True)
    survey = db.Column(db.String(64), index=True)
    ra = db.Column(psql.REAL, index=True)
    dec = db.Column(psql.REAL, index=True)
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
        db.session.add(self)
        db.session.flush()
        db.session.refresh(self)
        print(self)
        for shape in shapes:
            s = Shape(a_id=self.a_id, shape=shape['shape'],
                        number=shape['id'], feature=shape['feature'],
                        x0=shape['x0'], y0=shape['y0'])
            s.parse_js_shape(shape)
            db.session.add(s)
        print("added shapes")

    def __repr__(self):
        return '<Annotation ID: {}. Galaxy ID: {}. Timestamp: {}>'.format(self.a_id, self.g_id, self.timestamp)

    def modify_shapes(self, shapes):
        # Delete old shapes
        Shape.query.filter_by(a_id=self.a_id).delete()
        db.session.commit()

        # Add new shapes
        for shape in shapes:
            s = Shape(a_id=self.a_id, shape=shape['shape'],
                        number=shape['id'], feature=shape['feature'],
                        x0=shape['x0'], y0=shape['y0'])
            s.parse_js_shape(shape)
            db.session.add(s)


class Shape(db.Model):
    s_id = db.Column(db.Integer, primary_key=True)
    a_id = db.Column(db.Integer, db.ForeignKey('annotation.a_id'))
    shape = db.Column(db.String(64), index=True, nullable=False)
    number = db.Column(db.Integer, nullable=False)
    feature = db.Column(db.String(32), nullable=False)
    x0 = db.Column(psql.REAL, nullable=False)
    y0 = db.Column(psql.REAL, nullable=False)
    ra_xy = db.Column(psql.REAL)
    dec_xy = db.Column(psql.REAL)
    theta = db.Column(psql.REAL)
    xw = db.Column(psql.REAL)
    yh = db.Column(psql.REAL)
    ra_wh = db.Column(psql.REAL)
    dec_wh = db.Column(psql.REAL)
    r = db.Column(psql.REAL)
    x1 = db.Column(psql.REAL)
    x2 = db.Column(psql.REAL)
    x3 = db.Column(psql.REAL)
    y1 = db.Column(psql.REAL)
    y2 = db.Column(psql.REAL)
    y3 = db.Column(psql.REAL)
    ra1 = db.Column(psql.REAL)
    ra2 = db.Column(psql.REAL)
    ra3 = db.Column(psql.REAL)
    dec1 = db.Column(psql.REAL)
    dec2 = db.Column(psql.REAL)
    dec3 = db.Column(psql.REAL)
    x_points = db.Column(psql.ARRAY(psql.REAL))
    y_points = db.Column(psql.ARRAY(psql.REAL))
    ra_points = db.Column(psql.ARRAY(psql.REAL))
    dec_points = db.Column(psql.ARRAY(psql.REAL))

    def __repr__(self):
        return '<Shape ID: {}. Annotation ID: {}. Shape: {}>'.format(self.s_id, self.a_id, self.shape)

    def parse_js_shape(self, shape):
        if shape['shape'] == 'Rect' or shape['shape'] == 'Circle' or shape['shape'] == 'Ellipse':
            self.ra_xy = shape['ra_xy']
            self.dec_xy = shape['dec_xy']
            self.xw = shape['x'] + shape['w']
            self.yh = shape['y'] + shape['h']
            self.ra_wh = shape['ra_wh']
            self.dec_wh = shape['dec_wh']
            self.theta = shape['theta']
        if shape['shape'] == 'Line':
            self.ra_xy = shape['ra_xy']
            self.dec_xy = shape['dec_xy']
            self.x1 = shape['x1']
            self.x2 = shape['x2']
            self.x3 = shape['x3']
            self.y1 = shape['y1']
            self.y2 = shape['y2']
            self.y3 = shape['y3']
            self.ra1 = shape['ra1']
            self.ra2 = shape['ra2']
            self.ra3 = shape['ra3']
            self.dec1 = shape['dec1']
            self.dec2 = shape['dec2']
            self.dec3 = shape['dec3']
        if shape['shape'] == 'Region' or shape['shape'] == 'Freehand':
            self.x_points = [si['x'] for si in shape['points']]
            self.y_points = [si['y'] for si in shape['points']]
            self.ra_points = [si['ra_xy'] for si in shape['points']]
            self.dec_points = [si['dec_xy'] for si in shape['points']]
        if shape['shape'] == 'Snake':
            self.x_points = [si['x_t'] for si in shape['points']]
            self.y_points = [si['y_t'] for si in shape['points']]
            self.ra_points = [si['ra_xy_t'] for si in shape['points']]
            self.dec_points = [si['dec_xy_t'] for si in shape['points']]
            self.x_points += [si['x_b'] for si in reversed(shape['points'])]
            self.y_points += [si['y_b'] for si in reversed(shape['points'])]
            self.ra_points += [si['ra_xy_b'] for si in reversed(shape['points'])]
            self.dec_points += [si['dec_xy_b'] for si in reversed(shape['points'])]
    