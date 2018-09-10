from flask_script import Manager
from sqlalchemy.schema import CreateTable
from metamix.application import create_app
from metamix.extensions import db
import os

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

if __name__ == "__main__":
    manager.run()
