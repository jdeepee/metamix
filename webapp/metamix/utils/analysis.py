from metamix.utils.upload import upload_s3
from flask import *
import essentia.standard
import subprocess
import uuid

def analyse_audio(audio):
	loader = essentia.standard.MonoLoader(filename=audio)
	audio = loader()
	rhythm_extractor = essentia.standard.RhythmExtractor2013(method="multifeature")
	key_extractor = essentia.standard.KeyExtractor()
	bpm, beats, beats_confidence, _, beats_intervals = rhythm_extractor(audio)
	key, scale, strength = key_extractor(audio)

	print "BPM: {}".format(bpm)
	print "Beat positions (sec.): {}".format(beats)
	print 'Key: {}'.format(key)
	print 'Scale: {}'.format(scale)
	print "Strength: {}".format(strength)

	return bpm, beats, key

def create_waveform(audio):
	key = str(uuid.uuid4())+".dat"
	out = current_app.config["METAMIX_TEMP_SAVE"] + key
	subprocess.call(["audiowaveform", "-i", audio, "-o", out, "-b", "8"])
	upload_s3(out, key, True, True)
	return key