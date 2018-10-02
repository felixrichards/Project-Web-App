from app import app, db
from app.models import Galaxy, Annotation


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'Galaxy': Galaxy, 'Annotation': Annotation}
