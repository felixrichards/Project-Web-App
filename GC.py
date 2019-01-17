from app import create_app, db
from app.models import Galaxy, Annotation, Shape, User


app = create_app()


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'Galaxy': Galaxy, 'Annotation': Annotation, 'Shape': Shape, 'User': User}
