from app import db, create_app
from app.models import Galaxy, User

app = create_app()
with app.app_context():
    g=Galaxy(name='dummy')
    db.session.add(g)
    ua=[User(username='paduc'),User(username='felix'),User(username='adeline')]
    for u in ua:
        u.set_access(3)
        db.session.add(u)
    db.session.commit()
    print("added")