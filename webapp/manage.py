from flask_script import Manager
from sqlalchemy.schema import CreateTable
from metamix.application import create_app
from metamix.extensions import db
import os
from flask import *

# Set config Object based on Ennv
if os.environ.get('METAMIX_ENV') == "production":
    config = "metamix.config.Production"

elif os.environ.get('METAMIX_ENV') == "development":
    config = "metamix.config.Development"

elif os.environ.get('METAMIX_ENV') == "test":
    config = "metamix.config.Test"

print "Running app with config: " + config

app = create_app(config)
manager = Manager(app)

def has_no_empty_params(rule):
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)

@manager.command
def create_tables():
    with app.app_context():
        print "Creating tables"
        db.create_all()

@manager.command
def drop_tables():
    with app.app_context():
        # sure = raw_input('Are you sure you want to drop ALL tables?" (Y/n) ')
        # if sure == 'Y':
        #     print 'Dropping tables...'
        db.drop_all()

@manager.command
def site_routes():
    links = []
    for rule in app.url_map.iter_rules():
        # Filter out rules we can't navigate to in a browser
        # and rules that require parameters
        if has_no_empty_params(rule):
            url = url_for(rule.endpoint, **(rule.defaults or {}))
            links.append((url, rule.endpoint))

    print links

if __name__ == "__main__":
    manager.run()
