# -*- coding: utf-8 -*-
from metamix.blueprints import mix
from metamix.models.user import User
from metamix.models.mix import Mix, MixAudio
from metamix.models.clip import Clip
from metamix.models.song import Song, Effect
from metamix.utils.upload import enqueue_mix
from metamix.errors import MetaMixException
from metamix.serialization.mix import MixSchema
from metamix.utils.general import jwt_required
from metamix.worker.mix import MixWorker
from metamix.worker.meta_modulate import MetaModulate
from flask import *
import json
import copy

@mix.route("/meta/mix", methods=["GET"])
@jwt_required
def dashboard(user_id):
	"""GET all user created mix's"""
	user = User.get_user(user_id)
	mixes = user.get_mixes()
	mix_schema = MixSchema(many=True)
	return jsonify({"data": mix_schema.dump(mixes).data}), 200

@mix.route("/meta/mix", methods=["POST"])
@jwt_required
def create_mix(user_id):
	"""Create or update existing mix"""
	json_description = request.json["mix_description"]
	print "Processing Audio: {}\n".format(json_description["audio"])
	if "id" in json_description:
		#Old mix - either re-compute mix if necassary or just return mix
		mix = Mix.get_mix(json_description["id"])
		print "Mix: {}".format(type(mix.json_description))
		if mix is not None:
			#Uploaded mix description must be changed - audio is not split into songs and clips just in the audio key - correct this formatting
			#Do mix auth checking
			if (type(mix.json_description) == unicode):
				mix.json_description = json.loads(mix.json_description)

			# if mix.json_description["audio"] == json_description["audio"]:
			# 	#Mix need no more computation - audio has not changed just description of mix
			# 	mix.update_mix_data(json_description)
			# 	return jsonify({"message": "Mix is up to date", "data": {"redirect": "/meta/mix/"+str(mix.id)+"/download"}})

			# else:
			# 	#Mix description has changed - recomputation is needed
			mix.update_mix_data(json_description)
			if len(mix.json_description["audio"]) > 0:
				enqueue_mix(mix.id, True, 3)
			return jsonify({"message": "Mix is being processed"})

		else:
			raise MetaMixException(message="Mix with given ID does not exist")

	else:
		#New mix
		name = json_description["name"]
		description = json_description["description"]
		genre = json_description["genre"]
		mix = Mix.insert_mix(name, description, genre, user_id, json_description)

		return jsonify({"message": "New mix has been created", "data": {"id": str(mix.id)}})

@mix.route("/meta/mix/<id>", methods=["GET"])
def get_mix(id):
	"""Get mix meta information"""
	mix = Mix.get_mix(id)
	if mix is not None:
		schema = MixSchema(many=False)
		
		return jsonify(schema.dump(mix).data)

	else:
		raise MetaMixException(message='That mix does not exist')

@mix.route("/meta/mix/<id>/download", methods=["GET"])
def download_mix(id):
	"""Download MP3/WAV of mix"""
	pass

@mix.route("/meta/mix/<mix_id>/audio/recompute", methods=["POST"])
@jwt_required
def recompute_song(user_id, mix_id, audio_id):
	"""Recomputes the waveform and beat markers of a song after a BPM/pitch modulation change"""
	#get original song mp3 and run all effects which are present in this song - saves the worker having to run them later this can just be done now and then the result grabbed later
	#Save to s3
	#save mix song to database and return object
	#Should then delete or edit current mix song object for this data? This probably isnt necassary if metamodule worker also updated mix song
	audio = request.json["audio"] #All pitch/tempo modulating effects that require song recomputation to be made from
	mix = Mix.get_mix(mix_id)
	if mix is None:
		raise MetaMixException(message="Mix with ID {} does not exist".format(mix_id), status_code=404)

	if audio["type"] == "song":
		audio_obj = Song.get_song(audio["id"])

		if audio_obj is None:
			raise MetaMixException(message="Song with ID {} does not exist".format(audio["id"]), status_code=404)

	elif audio["type"] == "clip":
		audio_obj = Clip.get_clip(audio["id"])

		if audio_obj is None:
			raise MetaMixException(message="Clip with ID {} does not exist".format(audio["id"]), status_code=404)
	effects = MixWorker.normalize_eq_effect(copy.deepcopy(audio["effects"]))

	data, sample_rate = MixWorker.fetch_s3(audio_obj.s3_key)
	audio["data"] = data[int(round(audio["song_start"]*sample_rate)):int(round(audio["song_end"]*sample_rate))]
	audio["sample_rate"] = sample_rate

	effect_creator = MetaModulate(audio, 3, effects)
	data = effect_creator.modulate()

	#Save audio with effects applied into database for retrieval later on future computations
	data_key = MixWorker.upload_s3(data["data"], sample_rate)
	del audio["data"]
	audio["s3_key"] = data_key
	MixAudio.save_audio(mix_id, audio)