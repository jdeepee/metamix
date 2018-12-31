from metamix.extensions import db
from metamix.models.song import Song, Effect
from metamix.models.clip import Clip
from metamix.errors import MetaMixException
from sqlalchemy.dialects.postgresql import UUID
import uuid
import json

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

    owner_id = db.Column("owner_id", UUID(as_uuid=True), db.ForeignKey('user.id', ondelete='CASCADE'))
    audio = db.relationship("MixAudio", backref="audio", lazy="dynamic")

    def update_mix_data(self, data):
        print "Updating mix data with: {}".format(data)
        self.validate_mix_audio(data)

        if "length" in data:
            data = {"name": data["name"], "description": data["description"], 
                    "genre": data["genre"], "json_description": data, "length": data["length"]}

        else:
            data = {"name": data["name"], "description": data["description"], 
                    "genre": data["genre"], "json_description": data}

        for key, value in data.items():
            if value != getattr(self, key):
                setattr(self, key, value)

        db.session.commit()

    @staticmethod
    def insert_mix(name, description, genre, user_id, json_description):
        """Method used upon mix creation - adds core mix structure to database"""
        Mix.validate_mix_audio(json_description)
        id = uuid.uuid4()
        json_description["id"] = str(id)

        mix = Mix(id=id, name=name, description=description, genre=genre, json_description=json.dumps(json_description), processing_status="Processing", length=0, owner_id=user_id)
        db.session.add(mix)
        db.session.commit()

        return mix

    @staticmethod
    def validate_mix_audio(json_description):
        for audio in json_description["audio"]:
            print "Validating: {}".format(audio)
            if audio["type"] == "song":
                if Song.exists(audio["audio_id"]) != True:
                    raise MetaMixException(message="Song with ID: " + str(audio["audio_id"]) + "does not exist")

            else:
                if Clip.exists(audio["audio_id"]) != True:
                    raise MetaMixException(message="Clip with ID: " + str(audio["audio_id"]) + "does not exist")

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
    #These song related values are being saved here so we dont change the original songs values - effect changes should only show in a mix
    waveform = db.Column("waveform", db.String())#String of s3 waveform key name - this is used if a song has the BPM changed 
    beat_positions = db.Column(db.JSON()) #Used to keep an updated version of the beat_positions if BPM is changed
    bpm = db.Column("bpm", db.Float()) #Used to keep an updated version of the BPM
    key = db.Column("key", db.String(50)) #Used to keep an updated version of the key

    clip_id = db.Column("clip_id", UUID(as_uuid=True), db.ForeignKey('clip.id', ondelete='CASCADE'))
    song_id = db.Column("song_id", UUID(as_uuid=True), db.ForeignKey('song.id', ondelete='CASCADE'))
    effects = db.relationship("Effect", backref="effect", lazy="dynamic")

    @staticmethod
    def save_audio(mix_id, audio_obj):
        #Recomputation of waveform/beat positions and saving of new bpm/key should happen here on save_audio
        if audio_obj["type"] == "song":
            audio = MixAudio(id=uuid.uuid4(), mix_id=mix_id, name=audio_obj["name"], s3_key=audio_obj["s3_key"], start=audio_obj["song_start"], end=audio_obj["song_end"], 
                             mix_start=audio_obj["start"], mix_end=audio_obj["end"], song_id=audio_obj["audio_id"], 
                             waveform=audio_obj["waveform"], beat_positions=audio_obj["beat_positions"], bpm=audio_obj["bpm"], key=audio_obj["key"])
            db.session.add(audio)
            db.session.commit()

        elif audio_obj["type"] == "clip":
            audio = MixAudio(id=uuid.uuid4(), mix_id=mix_id, name=audio_obj["name"], s3_key=audio_obj["s3_key"], start=audio_obj["song_start"], end=audio_obj["song_end"], 
                             mix_start=audio_obj["start"], mix_end=audio_obj["end"], clip_id=audio_obj["audio_id"], 
                             waveform=audio_obj["waveform"], beat_positions=audio_obj["beat_positions"], bpm=audio_obj["bpm"], key=audio_obj["key"])
            db.session.add(audio)
            db.session.commit()

        effect_data = {}
        for effect in audio_obj["effects"]:
            effect_data["type"] = effect["type"]
            effect_data["start"] = effect["start"]
            effect_data["end"] = effect["end"]
            effect_data["effect_parameters"] = effect
            effect_data["id"] = effect["id"] #id is most likley not necassary/will break things as id may be computed by front end each time mix is loaded? Or just computed once at first load
            effect_data["mix_audio_id"] = audio.id
            Effect.insert_audio_effect(effect_data)

        return audio

    @staticmethod
    def get_mix_song(mix_id, song_id, song_start, song_end, target_effects):
        """Returns song with given effects on it - if exists
        Note this returns exact audio/effect matches for given mix - useful for retrieving previously computed data for this mix
        not useful for looking at all created audio clips for a given user as a result of their mixing
        """
        print "Getting mix song, song id: {}, start {} end {} mix id {}".format(song_id, song_start, song_end, mix_id)
        songs = MixAudio.query.filter(MixAudio.song_id == song_id, MixAudio.start == song_start, MixAudio.end == song_end, MixAudio.mix_id == mix_id).all()
        out = []

        for song in songs:
            e = song.effects.all()
            print "Match on song: {}".format(e)
            #Create list of dictionaries which is the same as input effect data shape
            song_effects = [effect.effect_parameters for effect in song.effects.all()]
            match = True
            print "Effects for matched song: {} vs target effects: {}".format(song_effects, target_effects)

            for effect in target_effects:
                if effect not in song_effects:
                    match = False
                    break;


            if match == True:
                out.append(song)

        if len(out) > 0:
            return out[0]

        else:
            return None

    @staticmethod
    def get_mix_clip(mix_id, clip_id, clip_start, clip_end, target_effects):
        """Returns song with given effects on it - if exists
        Note this returns exact audio/effect matches for given mix - useful for retrieving previously computed data for this mix
        not useful for looking at all created audio clips for a given user as a result of their mixing
        """
        #Most likely this wont work - as we are quering as if a MixSong audio clip will only have one applied effect - likely effects table
        #will have multiple effects applied
        clips = MixAudio.query.filter(MixAudio.clip_id == clip_id, MixAudio.start == clip_start, MixAudio.end == clip_end, MixAudio.mix_id == mix_id).all()
        out = []

        for clip in clips:
            #Create list of dictionaries which is the same as input effect data shape
            clip_effects = [{"type": effect.type, "start": effect.start, "end": effect.end, 
                            "effect_parameters": effect.effect_parameters} for effect in clip.effects]
            match = True

            for effect in target_effects:
                if effect in clip_effects:
                    match = True

            if match == True:
                out.append(clip)

        if len(out) > 0:
            return out[0]

        else:
            return None