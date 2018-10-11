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
    	#Create song and clips lists for storing relevant data in future
    	songs = [[] for song in self.json_decription["songs"]]
    	clips = [[] for clip in self.json_decription["clips"]]

    	for song in self.json_decription["songs"]:
    		song_id = song["id"]
    		song_start = song["song_start"]
    		song_end = song["song_end"]
    		mix_start = song["mix_start"]
    		mix_end = song["mix_end"]
    		effects = song["effects"]

    	for clip in self.json_decription['clips']:
    		pass

    	pass

	def apply_effects(self):
		""""""
		pass

	def mix_songs(self):
		pass

	#Util methods
	def to_mp3(self):
		pass

	def fetch_s3(self, s3_uri):
		pass

	def upload_s3(self):
		pass