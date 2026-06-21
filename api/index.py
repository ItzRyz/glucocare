import os

from flask import Flask
from flask_cors import CORS

from model_service import ModelService
from routes import init_routes

model_service = ModelService()

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r'/*': {'origins': os.getenv('CORS_ORIGINS', '*')}})
    app.register_blueprint(init_routes(model_service), url_prefix='/api/flask')
    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', '5328'))
    app.run(
        debug=os.getenv('FLASK_DEBUG', 'true').lower() == 'true',
        port=port,
    )
