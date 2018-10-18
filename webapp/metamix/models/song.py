from metamix.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Song(db.Model):
    """Song database object"""
    __tablename__ = "song"

    id = db.Column("id", UUID(as_uuid=True), primary_key=True)
    name = db.Column("name", db.String(50))
    s3_key = db.Column("s3_key", db.String(50))
    bpm = db.Column("bpm", db.Float())
    pitch = db.Column("pitch", db.String(50))
    description = db.Column("description", db.String())
    length = db.Column("length", db.Float()) #Song length in seconds 
    genre = db.Column("genre", db.String(50))

    mixes = db.relationship("MixAudio", backref="mixes", lazy="dynamic") #Mixes which the song is contained in
    effects = db.relationship("Effect", backref="effects", lazy="dynamic") #relationship to effects which have been applied to the song

    @classmethod
    def get_song(id):
        return Song.query.filter(Song.id == id).first()

    @staticmethod
    def insert_song(data):
        data["id"] = uuid.uuid4()

        song = Song(**data)
        db.session.add(song)
        db.session.commit()

    def update_data(self, data):
        for key, value in data.items():
            setattr(self, key, value)

        db.session.commit()

class Effect(db.Model):
    """Effect database object
    Describes effects applied to given audio clip
    """
    __tablename__ = "effect"

    id = db.Column("id", UUID(as_uuid=True), primary_key=True)
    type = db.Column("type", db.String())
    start = db.Column("start", db.Float) #Start timestamp of effect in song recorded in seconds
    end = db.Column("end", db.Float) #End timestamp of effect in song recorded in seconds

    strength_curve = db.Column("effect_curve", db.String())
    effect_start = db.Column("effect_start", db.String()) #Starting value for effect
    effect_target = db.Column("effect_target", db.String()) #Ending value for effect 
    #Defining two strength curve/effect start/target values as some algorithms have two 
    strength_curve_2 = db.Column("strength_curve_2", db.String())
    effect_start_2 = db.Column("effect_start_2", db.String()) #Starting value for effect
    effect_target_2 = db.Column("effect_target_2", db.String()) #Ending value for effect 

    frequency = db.Column("frequency", db.String()) #Frequency of EQ
    q_width = db.Column("q_width", db.String()) #Q Width of EQ
    upper_bound = db.Column("upper_bound", db.Integer) #Upperbound of filter 
    lower_bound = db.Column("lower_bound", db.Integer) #Lowerbound of filter

    mix_audio_id = db.Column("mix_audio_id", UUID(as_uuid=True), db.ForeignKey('mix_audio.id', ondelete='CASCADE'))
    song_id = db.Column("song_id", UUID(as_uuid=True), db.ForeignKey('song.id', ondelete='CASCADE'))
    clip_id = db.Column("clip_id", UUID(as_uuid=True), db.ForeignKey("clip.id", ondelete="CASCADE"))

    @classmethod
    def insert_audio_effect(data):
        """Inserts audio effect into Effect table - accepts data which should contain all fields required by table"""
        # for c in Effect.__table__.columns:
        data["id"] = uuid.uuid4()
        
        effect = Effect(**data)
        db.session.add(effect)
        db.session.add()
