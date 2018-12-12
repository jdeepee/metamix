from metamix.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import bcrypt
import uuid

class User(db.Model):
    """User database object"""
    __tablename__ = "user"

    id = db.Column("id", UUID(as_uuid=True), primary_key=True)
    email = db.Column("email", db.String(50), unique=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    first_name = db.Column("first_name", db.String(30), default='')
    last_name = db.Column("last_name", db.String(50), default='')
    password = db.Column("password", db.String())

    @staticmethod
    def get_hashed_password(plain_text_password):
        return bcrypt.hashpw(plain_text_password, bcrypt.gensalt(12))

    @staticmethod
    def check_password(plain_text_password, hashed_password):
        # Check hased password. Using bcrypt, the salt is saved into the hash itself
        return bcrypt.checkpw(plain_text_password, hashed_password)

    @staticmethod
    def get_user(email):
        user = User.query.filter_by(email=email).first()
        return user

    @staticmethod
    def add_user(data):
        data["id"] = uuid.uuid4()
        data["password"] = User.get_hashed_password(data["password"])
        user = User(**data)
        db.session.add(user)
        db.session.commit()
        return user
