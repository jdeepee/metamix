from flask import *
import essentia.standard
import subprocess
import uuid

def analyse_audio(audio):
	loader = essentia.standard.MonoLoader(filename=audio)
	audio = loader()
	bpm, beats, beats_confidence, _, beats_intervals = compute_bar_markers(audio)
	key_extractor = essentia.standard.KeyExtractor()
	key, scale, strength = key_extractor(audio)

	print "BPM: {}".format(bpm)
	print "Beat positions (sec.): {}".format(beats)
	print "Beat intervals: {}".format(beats_intervals)
	print 'Key: {}'.format(key)
	print 'Scale: {}'.format(scale)
	print "Strength: {}".format(strength)

	return bpm, beats, key

def compute_bar_markers(audio, loaded=True):
	if loaded == False:
		loader = essentia.standard.MonoLoader(filename=audio)
		audio = loader()

	rhythm_extractor = essentia.standard.RhythmExtractor2013(method="multifeature")
	return rhythm_extractor(audio)

def create_waveform(audio):
	"""Creates waveform binary for input audio and uploads to s3. Key of s3 object returned"""
	from metamix.utils.upload import upload_s3
	key = str(uuid.uuid4())+".dat"
	out = current_app.config["METAMIX_TEMP_SAVE"] + key
	subprocess.call(["audiowaveform", "-i", audio, "-o", out, "-b", "8"])
	upload_s3(out, key, True, True)
	return key