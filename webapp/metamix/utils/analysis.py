import essentia

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