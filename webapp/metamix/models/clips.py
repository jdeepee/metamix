from metamix.extensions import db
from sqlalchemy.dialects.postgresql import UUID

class Clip(db.Model):
    """Clip database object
	Clips which users have created or uploaded
    """
    __tablename__ = "clip"

    id = db.Column("id", UUID(as_uuid=True), primary_key=True)
    name = db.Column("name", db.String(50))
    s3_uri = db.Column("s3_uri", db.String(50))
    bpm = db.Column("bpm", db.Integer)
    pitch = db.Column("pitch", db.String(50))
    description = db.Column("description", db.String())
    length = db.Column("length", db.Integer)