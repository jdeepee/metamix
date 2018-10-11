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

    mixes = db.relationship("MixSong", backref="mixes", lazy="dynamic") #Mixes which the song is contained in
    effects = db.relationship("SongEffect", backref="effects", lazy="dynamic") #relationship to effects which have been applied to the song

class SongEffect(db.Model):
    """SongEffect database object
    Describes effects applied to given songs in MixSong database object
    """
    __tablename__ = "SongEffects"

    id = db.Column("id", UUID(as_uuid=True), primary_key=True)
    type = db.Column("type", db.String())
    start = db.Column("start", db.Float) #Start timestamp of effect in song recorded in seconds
    end = db.Column("end", db.Float) #End timestamp of effect in song recorded in seconds
    strength_curve = db.Column("effect_curve", db.String())
    effect_start = db.Column("start", db.String()) #Starting value for effect
    effect_target = db.Column("target", db.String()) #Ending value for effect 
    frequency = db.Column("frequency", db.String()) #Frequency of EQ
    q_width = db.Column("q_width", db.String()) #Q Width of EQ
    upper_bound = db.Column("upper_bound", db.Integer) #Upperbound of filter 
    lower_bound = db.Column("lower_bound", db.Integer) #Lowerbound of filter

    mix_song_id = db.Column("mix_song_id", UUID(as_uuid=True), db.ForeignKey('mix_song.id', ondelete='CASCADE'))
    song_id = db.Column("song_id", UUID(as_uuid=True), db.ForeignKey('song.id', ondelete='CASCADE'))