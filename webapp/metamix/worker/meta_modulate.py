from metamix.models.mix import Mix, MixSongs
from metamix.models.song import Song, SongEffects
from metamix.models.user import User

class MetaModulate():
	"""
	Class for applying effects to a song - returns numpy array of effect modulated data
	"""
	def __init__(self, id, effect_schema):
		self.song_id = id
		self.effect_schema = effect_schema

	@classmethod
    def modulate(cls, id, effect_schema):
        '''method intended to be called on the class, not an instance'''
        return cls(id, effect_schema)

   	#Class methods