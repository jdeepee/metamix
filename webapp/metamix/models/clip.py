from metamix.extensions import db
from sqlalchemy.dialects.postgresql import UUID

class Clip(db.Model):
    """Clip database object
	Clips which users have created or uploaded
    """
    __tablename__ = "clip"

    id = db.Column("id", UUID(as_uuid=True), primary_key=True)
    name = db.Column("name", db.String(50))
    s3_key = db.Column("s3_key", db.String(50))
    bpm = db.Column("bpm", db.Float())
    pitch = db.Column("pitch", db.String(50))
    description = db.Column("description", db.String())
    length = db.Column("length", db.Float())

    mixes = db.relationship("MixAudio", backref="clip_mixes", lazy="dynamic") #Mixes which the song is contained in
    effects = db.relationship("Effect", backref="clip_effects", lazy="dynamic") #relationship to effects which have been applied to the song

    @staticmethod
    def exists(id):
        query = Clip.query.filter(Clip.id == id).first()

        if query is None:
            return False

        else:
            return True
            
    @staticmethod
    def get_clip(id):
        return Clip.query.filter(Clip.id == id).first()

    @staticmethod
    def insert_clip(data):
        data["id"] = uuid.uuid4()

        clip = Clip(**data)
        db.session.add(clip)
        db.session.commit()

    def update_data(self, data):
        for key, value in data.items():
            setattr(self, key, value)

        db.session.commit()