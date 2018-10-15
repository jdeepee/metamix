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

    @classmethod
    def get_mix(id):
        """Returns mix object given supplied id"""
        mix = Mix.query.filter(Mix.id == id).first()

        return mix

class MixClip (db.Model):
    """MixClip database object"""
    __tablename__ = "mix_clip"

    id = db.Column("id", UUID(as_uuid=True), primary_key=True)
    mix_id = db.Column("mix_id", UUID(as_uuid=True), db.ForeignKey('mix.id', ondelete='CASCADE'))
    name = db.Column("name", db.String(50))
    s3_uri = db.Column("s3_uri", db.String(50)) #S3 URI to wav of file 
    clip_start = db.Column("song_start", db.Float) #Float of song start timestamp in seconds
    clip_end = db.Column("song_end", db.Float) #Float of song end timestamp in seconds

    clip_id = db.Column("clip_id", UUID(as_uuid=True), db.ForeignKey('clip.id', ondelete='CASCADE'))
    effects = db.relationship("Effects", backref="effects", lazy="dynamic")

    @classmethod
    def get_mix_clip(clip_id, clip_start, clip_end, target_effects):
        pass

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
    effects = db.relationship("Effects", backref="effects", lazy="dynamic")

    #How can we query MixSong effectivly? Need to filter by song_id, song_start, song_end and then exact effect matches
    @classmethod
    def get_mix_song(song_id, song_start, song_end, target_effects):
        """Returns song with given effects on it - if exists
        Note this returns exact audio/effect matches for given mix - useful for retrieving previously computed data for this mix
        not useful for looking at all created audio clips for a given user as a result of their mixing
        """
        #Most likely this wont work - as we are quering as if a MixSong audio clip will only have one applied effect - likely effects table
        #will have multiple effects applied
        songs = MixSong.query.filter(MixSong.song_id == song_id, MixSong.song_start == song_start, MixSong.song_end == song_end).all()
        out = []

        for song in songs:
            #Create list of dictionaries which is the same as input effect data shape
            song_effects = [{"type": effect.type, "start": effect.start, "end": effect.end, 
                            "strength_curve": effect.strength_curve, "effect_start": effect.effect_start,
                            "effect_target": effect.effect_target, "strength_curve_2": effect.strength_curve_2,
                            "effect_start_2": effect.effect_start_2, "effect_target_2": effect.effect_target_2,
                            "frequency": effect.frequency, "q_width": effect.q_width,
                            "upper_bound": effect.upper_bound, "lower_bound": effect.lower_bound} for effect in song.effects]
            match = True

            for effect in target_effects:
                if effect not in song_effects:
                    match = True

            if match == True:
                out.append(song)

        if len(out) > 0:
            return out[0]

        else:
            return None