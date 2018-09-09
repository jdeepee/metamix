from flask_sqlalchemy import SQLAlchemy
from flask import current_app
from flask_rq2 import RQ

db = SQLAlchemy()
rq = RQ()