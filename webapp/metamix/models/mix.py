from metamix.extensions import db
from metamix.models.song import Song, Effect
from metamix.models.clip import Clip
from metamix.errors import MetaMixException
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Mix(db.Model):
    """Mix database object"""
    __tablename__ = "mix"

    id = db.Column("id", UUID(as_uuid=True), primary_key=True)
    name = db.Column("name", db.String(50))
    s3_key = db.Column("s3_key", db.String(50))
    length = db.Column("length", db.Integer()) #Mix length in seconds
    description = db.Column("description", db.String(50))
    genre = db.Column("genre", db.String(50))
    json_description = db.Column("json_description", db.JSON)
    processing_status = db.Column("processing_status", db.String())

    #owner_id = db.Column("owner_id", UUID(as_uuid=True), db.ForeignKey('user.id', ondelete='CASCADE'))
    audio = db.relationship("MixAudio", backref="audio", lazy="dynamic")

    def update_mix_data(self, data):
        self.validate_mix_audio(data)

        data = {"name": data["name"], "description": data["description"], 
                "genre": data["genre"], "json_description": data}

        for key, value in data.items():
            if value != getattr(self, key):
                setattr(self, key, value)

        db.session.commit()

    @staticmethod
    def insert_mix(name, description, genre, json_description):
        """Method used upon mix creation - adds core mix structure to database"""
        Mix.validate_mix_audio(json_description)
        id = uuid.uuid4()
        json_description["id"] = id

        mix = Mix(id=id, name=name, description=description, genre=genre, json_description=json_description, processing_status="Processing", length=0)
        db.session.add(mix)
        db.session.commit()

        return mix

    @staticmethod
    def validate_mix_audio(json_description):
        for song in json_description["songs"]:
            if Song.exists(song["id"]) != True:
                raise MetaMixException(message="Song with ID: " + str(song["id"]) + "does not exist")

        for clip in json_description["clips"]:
            if Clip.exists(clip["id"]) != True:
                raise MetaMixException(message="Clip with ID: " + str(Clip["id"]) + "does not exist")

    @staticmethod
    def get_mix(id):
        """Returns mix object given supplied id"""
        mix = Mix.query.filter(Mix.id == id).first()

        return mix

class MixAudio(db.Model):
    """MixSong database object - used for storing information about created audio segments - useful for caching and data analysis"""
    __tablename__ = "mix_audio"

    id = db.Column("id", UUID(as_uuid=True), primary_key=True)
    mix_id = db.Column("mix_id", UUID(as_uuid=True), db.ForeignKey('mix.id', ondelete='CASCADE'))
    name = db.Column("name", db.String(50))
    s3_key = db.Column("s3_key", db.String(50)) #S3 URI to wav of file 
    start = db.Column("start", db.Float) #Float of song start timestamp in seconds
    end = db.Column("end", db.Float) #Float of song end timestamp in seconds
    mix_start = db.Column("mix_start", db.Float)
    mix_end = db.Column("mix_end", db.Float)

    clip_id = db.Column("clip_id", UUID(as_uuid=True), db.ForeignKey('clip.id', ondelete='CASCADE'))
    song_id = db.Column("song_id", UUID(as_uuid=True), db.ForeignKey('song.id', ondelete='CASCADE'))
    effects = db.relationship("Effect", backref="effect", lazy="dynamic")

    @staticmethod
    def save_audio(mix_id, name, s3_key, start, end, mix_start, mix_end, audio_id, type, effects):
        if type == "song":
            audio = MixAudio(id=uuid.uuid4(), mix_id=mix_id, name=name, s3_key=s3_key, start=start, end=end, 
                             mix_start=mix_start, mix_end=mix_end, song_id=audio_id)
            db.session.add(audio)
            db.sesson.commit()

            for effect in effects:
                effect_params = next((item for item in modulation_algorithm_parameters if item['type'] == effect_type), None)
                for key, value in effect["params"].iteritems():
                    effect_data[effect_params["database_defaults"][key]] = value

                effect_data["mix_audio_id"] = audio.id

                Effect.insert_audio_effect(**effect_data)

        elif type == "clip":
            audio = MixAudio(id=uuid.uuid4(), mix_id=mix_id, name=name, s3_key=s3_key, start=start, end=end, 
                             mix_start=mix_start, mix_end=mix_end,clip_id=audio_id)
            db.session.add(audio)
            db.sesson.commit()

            for effect in effects:
                effect_params = next((item for item in modulation_algorithm_parameters if item['type'] == effect_type), None)
                for key, value in effect["params"].iteritems():
                    effect_data[effect_params["database_defaults"][key]] = value

                effect_data["mix_audio_id"] = audio.id

                Effect.insert_audio_effect(**effect_data)

        return audio

    @staticmethod
    def get_mix_song(song_id, song_start, song_end, target_effects):
        """Returns song with given effects on it - if exists
        Note this returns exact audio/effect matches for given mix - useful for retrieving previously computed data for this mix
        not useful for looking at all created audio clips for a given user as a result of their mixing
        """
        #Most likely this wont work - as we are quering as if a MixSong audio clip will only have one applied effect - likely effects table
        #will have multiple effects applied
        songs = MixAudio.query.filter(MixAudio.song_id == song_id, MixAudio.start == song_start, MixAudio.end == song_end).all()
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

    @staticmethod
    def get_mix_clip(clip_id, clip_start, clip_end, target_effects):
        """Returns song with given effects on it - if exists
        Note this returns exact audio/effect matches for given mix - useful for retrieving previously computed data for this mix
        not useful for looking at all created audio clips for a given user as a result of their mixing
        """
        #Most likely this wont work - as we are quering as if a MixSong audio clip will only have one applied effect - likely effects table
        #will have multiple effects applied
        clips = MixAudio.query.filter(MixAudio.clip_id == clip_id, MixAudio.start == clip_start, MixAudio.end == clip_end).all()
        out = []

        for clip in clips:
            #Create list of dictionaries which is the same as input effect data shape
            clip_effects = [{"type": effect.type, "start": effect.start, "end": effect.end, 
                            "strength_curve": effect.strength_curve, "effect_start": effect.effect_start,
                            "effect_target": effect.effect_target, "strength_curve_2": effect.strength_curve_2,
                            "effect_start_2": effect.effect_start_2, "effect_target_2": effect.effect_target_2,
                            "frequency": effect.frequency, "q_width": effect.q_width,
                            "upper_bound": effect.upper_bound, "lower_bound": effect.lower_bound} for effect in clip.effects]
            match = True

            for effect in target_effects:
                if effect not in clip_effects:
                    match = True

            if match == True:
                out.append(clip)

        if len(out) > 0:
            return out[0]

        else:
            return None