from app import app

@app.route('/')
@app.route('/index')
def index():
    user={'username':'felix'}
    return '''
<html>
    <head>
        <title>Home Page - GC</title>
    </head>
    <body>
        <h1>Hello, ''' + user['username'] + '''!</h1>
    </body>
</html>'''