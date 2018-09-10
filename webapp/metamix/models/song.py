from metamix.extensions import db
from sqlalchemy.dialects.postgresql import UUID

class Song(db.Model):
    """Song database object"""
    __tablename__ = "song"

    id = db.Column("id", UUID(as_uuid=True), primary_key=True)
    name = db.Column("name", db.String(50))
    s3_uri = db.Column("s3_uri", db.String(50))
    bpm = db.Column("bpm", db.Integer)
    pitch = db.Column("pitch", db.String(50))
    description = db.Column("description", db.String())
    length = db.Column("length", db.Integer) #Song length in seconds 
    genre = db.Column("genre", db.String(50))

class SongEffects(db.Model):
    """Song Effect database object"""
    __tablename__ = "song_effect"

    id = db.Column("id", UUID(as_uuid=True), primary_key=True)
    type = db.Column("type", db.String())
    start = db.Column("start", db.Float) #Start timestamp of effect in song recorded in seconds
    end = db.Column("end", db.Float) #End timestamp of effect in song recorded in seconds
    effect_curve = db.Column("effect_curve", db.JSON)
    mix_song_id = db.Column("mix_song_id", UUID(as_uuid=True), db.ForeignKey('mix_song.id', ondelete='CASCADE'))