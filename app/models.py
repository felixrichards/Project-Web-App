from datetime import datetime
from app import db
from sqlalchemy.sql import func
import sqlalchemy.types as types

class Galaxy(db.Model):
    g_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), index=True, unique=True,nullable=False)
    survey = db.Column(db.String(64), index=True)
    annotations = db.relationship('Annotation', backref='name', lazy='dynamic')
    
    def __repr__(self):
        return '<Galaxy ID: {}. Name: {}.>'.format(self.g_id, self.name)
    
class Annotation(db.Model):
    a_id = db.Column(db.Integer, primary_key=True)
    g_id = db.Column(db.Integer, db.ForeignKey('galaxy.g_id'))
    timestamp = db.Column(db.DateTime, index=True, default=func.now(), server_default=func.now())
    shapes = db.relationship('Shape', backref='name', lazy='dynamic')
    
    def __init__(self,galaxy):
        self.g_id = galaxy.g_id
    
    
    def __repr__(self):
        return '<Annotation ID: {}. Galaxy ID: {}. Timestamp: {}>'.format(self.a_id, self.g_id, self.timestamp)
    
class Shape(db.Model):
    s_id = db.Column(db.Integer, primary_key=True)
    a_id = db.Column(db.Integer, db.ForeignKey('annotation.a_id'))
    shape = db.Column(db.String(64), index=True,nullable=False)
    x0 = db.Column(db.Float,nullable=False)
    y0 = db.Column(db.Float,nullable=False)
    sigma = db.Column(db.Float,nullable=False)
    w = db.Column(db.Float)
    h = db.Column(db.Float)
    r = db.Column(db.Float)
    x1 = db.Column(db.Float)
    x2 = db.Column(db.Float)
    x3 = db.Column(db.Float)
    y1 = db.Column(db.Float)
    y2 = db.Column(db.Float)
    y3 = db.Column(db.Float)
