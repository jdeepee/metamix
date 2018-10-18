from metamix.extensions import db, rq
from metamix.blueprints import all_blueprints
from metamix.models.mix import Mix, MixAudio
from metamix.models.song import Song, Effect
from metamix.models.user import User
from metamix.models.clip import Clip
from metamix.errors import MetaMixException
from flask import Flask, jsonify
from importlib import import_module
import os
import logging

class SubClassFlask(Flask):
    """ subclassing because need to override js cache 
    for development.
    """
    def get_send_file_max_age(self, name):
        if name.lower().endswith('.js') or name.lower().endswith('.css') :
            return 1
        return Flask.get_send_file_max_age(self, name)

def create_app(config):
    """Creates flask application

    :return: flask application object
    """
    app = SubClassFlask(__name__)
    # Creating flask application from Config object in ./config.py
    app.config.from_object(config)
    # Settings stripe API key
    app.secret_key = os.environ.get("APPLICATION_SECRET")
    # Init SQLAlchemy
    db.init_app(app)
    rq.init_app(app)

    # Register blueprints on application
    for item in all_blueprints:
        import_module(item.import_name)
        app.register_blueprint(item)

        # Register error handlers for each blueprint
        # for error in [400, 401, 403, 404, 500]:
        #     app.register_error_handler(error,
        #         MetaMixException)
    
    @app.errorhandler(MetaMixException)
    def handle_invalid_usage(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    if app.config["ADMIN"] is True:
        from flask_admin import Admin
        from flask_admin.contrib.sqla import ModelView
        admin = Admin(app, name='MetaMix Backend', template_mode='bootstrap3')
        models = []

        for model in models:
            admin.add_view(ModelView(model, db.session))

    if not app.debug:
        # In production mode, add log handler to sys.stderr.
        app.logger.addHandler(logging.StreamHandler())
        app.logger.setLevel(logging.DEBUG)

    # Return flask application
    return app
