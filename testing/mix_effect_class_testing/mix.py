from metamix.models.mix import Mix, MixAudio
from metamix.models.song import Song, SongEffects
from metamix.models.user import User
from metamix.models.clip import Clip
from metamix.worker.meta_modulate import MetaModulate
import json

class Mix():
    """
    Class to be used by Flask-RQ worker for creating a MP3 of a mix given its ID - fetches JSON representation of mix
    """
    def __init__(self, id, testing, debug_level):
        self.mix_id = id
        self.testing = testing
        self.debug_level = debug_level

    @classmethod
    def mix(cls, id):
        '''method intended to be called on the class, not an instance'''
        return cls(id)

    #Core mix methods
    def create_mix_data(self):
        """Iterate over mix schema - figure out which song sections in mix have already been processed - fetch parts of mixed already processed
        - call apply_effects with relevant effect schema on parts of the mix that need to be computed 
        - call mix_songs with relevant mix schema and full mix data (in order and effects computed)
        - then call to_mp3 to get mp3 of mix data"""
        self.mix_object = Mix.get_mix(self.mix_id)
        self.json_decription = json.loads(self.mix_object.json_decription)
        out = []

        for song in self.json_decription["songs"]:
            print 'Currently computing song: {}'.format(song)
            song_id = song["id"]
            mix_start = song["mix_start"]
            mix_end = song["mix_end"]
            song_start = song["song_start"]
            song_end = song["song_end"]
            effects = song["effects"]

            if len(effects) > 0:
                #Here we are only searching for an exact match - in the future should also look for matches which we can shape/slice into the correct format as
                #Defined by the effects i.e if continuous effects are applied on song between timestamps greater than timestamps specified here - then we can
                #just grab previous data and then slice down to the right size
                prev_processed = MixAudio.get_mix_song(song_id, song_start, song_end, effects)
                print "Previously processed value: {}".format(prev_processed)

                if prev_processed != None:
                    print "Previously processed clip found - appending to output data"
                    #Get prev processed value and use this as output
                    data, sample_rate = fetch_s3(prev_processed.s3_uri)
                    out.append("id": song_id, "start": mix_start, "end": mix_end, "data": data)

                else:
                    #Make computation, save data - then add data to output
                    print "No previous processed clip found - running clip effect computation"
                    song_obj = Song.get_song(song_id)
                    data, sample_rate = fetch_s3(song_obj.s3_uri)
                    song["data"] = data[song_start*sample_rate:song_end*sample_rate]
                    song["sample_rate"] = sample_rate

                    effect_creator = MetaModulate(song, 1)
                    data = effect_creator.modulate()
                    out.append("id": song_id, "start": mix_start, "end": mix_end, "data": data)

            else:
                #No effects applied on this song - just grab song and slice accordingly - then append data to out
                print "No effects applied on this song - fetching slicing and appending to output"
                song = Song.get_song(song_id)
                data, sample_rate = fetch_s3(song.s3_uri)

                out.append("id": song_id, "start": mix_start, "end": mix_end, "data": data[song_start*sample_rate:song_end*sample_rate])

        for clip in self.json_decription['clips']:
            print 'Currently computing clip: {}'.format(clip)
            clip_id = clip["id"]
            mix_start = clip["mix_start"]
            mix_end = clip["mix_end"]
            clip_start = clip["start"]
            clip_end = clip["end"]
            effects = clip["effects"]

            if len(effects) > 0:
                prev_processed = MixAudio.get_mix_clip(clip_id, clip_start, clip_end, effects)
                print "Previously processed value: {}".format(prev_processed)

                if prev_processed != None:
                    print "Previously processed clip found - appending to output data"
                    #Get prev processed value and use this as output
                    data, sample_rate = fetch_s3(prev_processed.s3_uri)
                    out.append("id": clip_id, "start": mix_start, "end": mix_end, "data": data)

                else:
                    #Make computation, save data - then add data to output
                    print "No previous processed clip found - running clip effect computation"
                    clip_obj = Clip.get_clip(clip_id)
                    data, sample_rate = fetch_s3(clip_obj.s3_uri)

                    clip["data"] = data[clip_start*sample_rate:clip_end*sample_rate]
                    clip["sample_rate"] = sample_rate

                    effect_creator = MetaModulate(clip, 1)
                    data = effect_creator.modulate()
                    out.append("id": clip_id, "start": mix_start, "end": mix_end, "data": data)

            else:
                print "No effects applied on this clip - fetching slicing and appending to output"
                clip = Clip.get_clip(clip_id)
                data, sample_rate = fetch_s3(clip.s3_uri)

                out.append("id": clip_id, "start": mix_start, "end": mix_end, "data": data[clip_start*sample_rate:clip_end*sample_rate])

        pass

    def mix_songs(self):
        pass

    def to_mp3(self):
        pass

    def fetch_s3(self, s3_uri):
        pass

    def upload_s3(self):
        pass