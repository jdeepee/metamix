from metamix.models.mix import Mix, MixSongs
from metamix.models.song import Song, SongEffects
from metamix.models.user import User
from metamix.worker.meta_modulate import MetaModulate
import json

class Mix():
	"""
	Class to be used by Flask-RQ worker for creating a MP3 of a mix given its ID - fetches JSON representation of mix
	"""
	def __init__(self, id):
		self.mix_id = id

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
	    		prev_processed = MixSong.get_mix_song(song_id, song_start, song_end, effects)
	    		print "Previously processed value: {}".format(prev_processed)

	    		if prev_processed != None:
	    			print "Previously processed clip found - appending to output data"
	    			#Get prev processed value and use this as output
	    			data, sample_rate = fetch_s3(prev_processed.s3_uri)
	    			out.append("id": song_id, "start": mix_start, "end": mix_end, "data": data)

	    		else:
	    			#Make computation, save data - then add data to output
	    			print "No previous processed clip found - running clip effect computation"
	    			song = Song.get_song(song_id)
	    			data, sample_rate = fetch_s3(song.s3_uri)
	    			song["data"] = data[song_start*sample_rate:song_end*sample_rate]
	    			song["sample_rate"] = sample_rate

	    			effect_creator = MetaModulate(song)
	    			data = effect_creator.modulate()
	    			out.append("id": song_id, "start": mix_start, "end": mix_end, "data": data)

	    	else:
	    		#No effects applied on this song - just grab song and slice accordingly - then append data to out
	    		print "No effects applied on this song - fetching slicing and appending to output"
	    		song = Song.get_song(song_id)
	    		data, sample_rate = fetch_s3(song.s3_uri)

	    		out.append("id": song_id, "start": mix_start, "end": mix_end, "data": data[song_start*sample_rate:song_end*sample_rate])

    	for clip in self.json_decription['clips']:
    		pass

    	pass

	def mix_songs(self):
		pass

	#Util methods
	def get_audio_timestamps(self, song):
	    """Takes song object as input and will return list of dictionaries describing the timestamps of each section of song and their relevant effects"""
	    starting_timestamp = song["song_start"]
	    ending_timestamp = song["song_end"]
	    effects = song["effects"]
	    out = []

	    if len(effects) != 0:
	        ending_value = effects[0]["start"]
	        out.append({"start": starting_timestamp, "end": ending_value, "effects": []})
	        start_list = sorted([x for x in effects if x["start"] > ending_value], key=lambda x: x["start"])
	        end_list = sorted([x for x in effects if x["end"] > ending_value], key=lambda x: x["end"])

	        while len(start_list) != 0 or len(end_list) != 0:
	            starting_value = ending_value
	            if len(start_list) > 0:
	                current_start_value = start_list[0]["start"]

	            else:
	                print 'Running this'
	                ending_value = end_list[0]["end"]
	                if ending_value > ending_timestamp:
	                    ending_value = ending_timestamp

	                    out.append({"start": starting_value, "end": ending_value, "effects": [x for x in effects if x["start"] < ending_value and x["end"] > starting_value]})
	                    break

	                else:
	                    current_start_value = ending_value

	            if len(end_list) > 0:
	                current_end_value = end_list[0]["end"]
	                print "Comparing values, end: {} and start: {}".format(current_end_value, current_start_value)
	                if current_end_value < current_start_value:
	                    ending_value = current_end_value
	                    out.append({"start": starting_value, "end": ending_value, "effects": [x for x in effects if x["start"] < ending_value and x["end"] > starting_value]})

	                else:
	                    ending_value = current_start_value
	                    out.append({"start": starting_value, "end": ending_value, "effects": [x for x in effects if x["start"] < ending_value and x["end"] > starting_value]})

	            else:
	                ending_value = start_list[0]["start"]
	                out.append({"start": starting_value, "end": ending_value, "effects": [x for x in effects if x["start"] < ending_value and x["end"] > starting_value]})

	            print "new ending value: {}".format(ending_value)
	            start_list = sorted([x for x in effects if x["start"] > ending_value], key=lambda x: x["start"])
	            end_list = sorted([x for x in effects if x["end"] > ending_value], key=lambda x: x["end"])

	            print "While loop new start and end list: {}, {}".format(start_list, end_list)

	    else:
	        out.append({"start": starting_timestamp, "end": ending_timestamp, "effects": []})

	    if out[-1]["end"] != ending_timestamp:
	        out.append({"start": out[-1]["end"], "end": ending_timestamp, "effects": []})

	    print "Output: {}".format(out)
	    return out

	def to_mp3(self):
		pass

	def fetch_s3(self, s3_uri):
		pass

	def upload_s3(self):
		pass