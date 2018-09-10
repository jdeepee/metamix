from metamix.extensions import db
from sqlalchemy.dialects.postgresql import UUID

class Mix(db.Model):
    """Mix database object"""
    __tablename__ = "mix"

    id = db.Column("id", UUID(as_uuid=True), primary_key=True)
    name = db.Column("name", db.String(50))
    s3_uri = db.Column("s3_uri", db.String(50))
    length = db.Column("length", db.Integer()) #Mix length in seconds
    description = db.Column("name", db.String(50))
    genre = db.Column("genre", db.String(50))

    songs = db.relationship("MixSongs", backref="songs", lazy="dynamic")


class MixSongs(db.Model):
    """MixSongs database object"""
    __tablename__ = "mix_song"

    id = db.Column("id", UUID(as_uuid=True), primary_key=True)
    mix_id = db.Column("mix_id", UUID(as_uuid=True), db.ForeignKey('mix.id', ondelete='CASCADE'))
    song_id = db.Column("song_id", UUID(as_uuid=True), db.ForeignKey('song.id', ondelete='CASCADE'))
    song_start = db.Column("song_start", db.Float) #Float of song start timestamp in seconds
    song_end = db.Column("song_end", db.Float) #Float of song end timestamp in seconds
    mix_start = db.Column("mix_start", db.Float) #Float of song start timestamp in mix recorded in seconds
    mix_end = db.Column("mix_end", db.Float) #Float of song end timestamp in mix recorded in seconds 

    effects = db.relationship("SongEffects", backref="effects", lazy="dynamic")
