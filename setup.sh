flask db upgrade
flask shell <<@@
g=Galaxy(name='dummy')
db.session.add(g)
ua=[User(username='paduc'),User(username='felix'),User(username='adeline')]
for u in ua:
    ua.set_access(3)
    db.session.add(u)
db.session.commit()
@@
