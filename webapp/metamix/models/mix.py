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
    json_description = db.Column("json_description", db.JSON)
    processing_status = db.Column("processing_status", db.String())

    songs = db.relationship("MixSongs", backref="songs", lazy="dynamic")

    def get_mix(self, id):
        """Returns mix object given supplied id"""
        mix = self.query.filter(self.id == id).first()

        return mix

class MixSong(db.Model):
    """MixSong database object"""
    __tablename__ = "mix_song"

    id = db.Column("id", UUID(as_uuid=True), primary_key=True)
    mix_id = db.Column("mix_id", UUID(as_uuid=True), db.ForeignKey('mix.id', ondelete='CASCADE'))
    name = db.Column("name", db.String(50))
    s3_uri = db.Column("s3_uri", db.String(50)) #S3 URI to wav of file 
    song_start = db.Column("song_start", db.Float) #Float of song start timestamp in seconds
    song_end = db.Column("song_end", db.Float) #Float of song end timestamp in seconds

    song_id = db.Column("song_id", UUID(as_uuid=True), db.ForeignKey('song.id', ondelete='CASCADE'))
    effects = db.relationship("SongEffects", backref="effects", lazy="dynamic")

    def get_mix_song(self, song_id, effect_type, effect_song_start, effect_song_end, 
        effect_strength_curve, effect_start, effect_target, effect_frequency, effect_q_width):
        """Returns song with given effects on it - if exists"""
        if effect_strength_curve == "linear":
            song = self.query.filter(self.song_id == song_id, self.effects.type == effect_type, 
                                        self.effects.start == effect_song_start, self.effects.end == effect_song_end,
                                        self.effects.strength_curve == effect_strength_curve, self.effects.effect_start == effect_start,
                                        self.effects.effect_target == effect_target, self.effects.frequency == effect_frequency,
                                        self.effects.q_width == effect_q_width).first()

        elif effect_strength_curve == "continuous":
            #Effect start/end values do not have to match they target values should just be inside previous as effect would be continous across audio
            song = self.query.filter(self.song_id == song_id, self.effects.type == effect_type, 
                                        self.effects.start <= effect_song_start, self.effects.end >= effect_song_end,
                                        self.effects.strength_curve == effect_strength_curve, self.effects.effect_start == effect_start,
                                        self.effects.effect_target == effect_target, self.effects.frequency == effect_frequency,
                                        self.effects.q_width == effect_q_width).first()
        return song