# -*- coding: utf-8 -*-
from metamix.blueprints import mix
from metamix.models.user import User
from metamix.models.mix import Mix, MixAudio
from metamix.models.song import Song, Effect
from metamix.utils.upload import enqueue_mix
from metamix.errors import MetaMixException
from metamix.serialization.mix import MixSchema
from metamix.utils.general import jwt_required
from flask import *
import json

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

			if mix.json_description["audio"] == json_description["audio"]:
				#Mix need no more computation - audio has not changed just description of mix
				mix.update_mix_data(json_description)
				return jsonify({"message": "Mix is up to date", "data": {"redirect": "/meta/mix/"+str(mix.id)+"/download"}})

			else:
				#Mix description has changed - recomputation is needed
				mix.update_mix_data(json_description)
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

@mix.route("/meta/mix/<mix_id>/song/<song_id>", methods=["POST"])
@jwt_required
def get_mix_song(user_id, mix_id, song_id):
	#Get song data within mix context - this will be used after applying tempo/pitch modulating effects to get the new BPM/key/beat pos/waveform data
    pass

