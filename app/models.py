from datetime import datetime
from app import db

class Galaxy(db.Model):
    g_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), index=True, unique=True)
    survey = db.Column(db.String(64), index=True)
    
    def __repr__(self):
        return '<Galaxy ID: {}. Name: {}.>'.format(self.g_id, self.name)
    
class Annotations(db.Model):
    a_id = db.Column(db.Integer, primary_key=True)
    g_id = db.Column(db.Integer, db.ForeignKey('galaxy.galaxyNo'))
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    
    def __repr__(self):
        return '<Annotation ID: {}. Galaxy ID: {}.>'.format(self.a_id, self.g_id)