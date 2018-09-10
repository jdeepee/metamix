from metamix.extensions import db
from sqlalchemy.dialects.postgresql import UUID

class User(db.Model):
    """User database object"""
    __tablename__ = "user"

    id = db.Column("id", UUID(as_uuid=True), primary_key=True)
    email = db.Column("email", db.String(50), unique=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    first_name = db.Column("first_name", db.String(30), default='')
    last_name = db.Column("last_name", db.String(50), default='')
    password = db.Column("password", db.String())