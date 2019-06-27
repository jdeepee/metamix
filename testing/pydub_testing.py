# -*- coding: utf-8 -*-
import pydub

from librosa import load

source_song = "/Users/Josh/Music/sample_analysis_songs/1991 - Dun Kno.mp3"
y, sr = load(source_song, sr=None)
print y.shape

# song = AudioSegment.from_mp3(source_song)

"""All effects should be able to accept a curve value and a start/end value

Possible curve values:
	Continuous
	quarter of a sine wave
	h for half a sine wave 
	t for linear (‘triangular’) slope

Effects supported by SOX:
	Flanger
	Echo
	Phaser
	Reverb

Effects I can create
	Loop out
	Loop roll - 
	Cut - must be at same tempo as song
"""


def volume_adjust():
	#AudioSegment(…).apply_gain(gain)
	pass
	
def volume_fade():
	#AudioSegment(…).fade()
	pass

def manual_volume_fade():
	#AudioSegment(…).apply_gain(gain)
	#Will have to split up song in area where manual volume fade is occuring
	#Split up by every 100 miliseconds and then apply volume change on this section
	#At end concatenate results
	pass

def audio_track_concatenate():
	#AudioSegment(…).overlay()
	pass

def filter_high():
	#audio_segment.high_pass_filter()
	#Will have to use the same method as the manual volume fade of splitting up the audio and applying filter to each segment 
	pass

def filter_low():
	#audio_segment.low_pass_filter()
	#Will have to use the same method as the manual volume fade of splitting up the audio and applying filter to each segment 
	pass

def filter_band():
	#audio_segment.band_pass_filter()
	#Will have to use the same method as the manual volume fade of splitting up the audio and applying filter to each segment 
	pass

def crossfade():
	#Basic linear crossfade between two tracks
	#AudioSegment(…).append(, crossfade=x)
	pass