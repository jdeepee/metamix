from librosa import load
from pysndfx import AudioEffectsChain

def cut(data, sample_rate, start, end):
	"""Returns cut version of input data. Cut between start and end.

	sample rate: int
	start: float start of cut in seconds
	end: float end of cut in seconds
	"""
	return data[start*sample_rate:end*sample_rate]

def flanger():
	pass

def echo():
	pass

def phaser():
	pass

def reverb():
	pass

def loop():
	pass

def pitch():
	pass

def tempo():
	pass

def volume():
	pass


