# -*- coding: utf-8 -*-
from metamix.blueprints import mix
from metamix.models.mix import Mix, MixAudio
from metamix.models.song import Song, Effect
from metamix.utils.upload import enqueue_mix
from metamix.errors import MetaMixException
from metamix.serialization.mix import MixSchema
from flask import current_app

@mix.route("/meta/mix", methods=["GET"])
def dashboard():
	"""GET all user created mix's"""
	pass

@mix.route("/meta/mix", methods=["POST"])
def create_mix():
	"""Create or update existing mix"""
	json_description = request.json["json_description"]
	if "id" in json_description:
		#Old mix - either re-compute mix if necassary or just return mix
		mix = Mix.get_mix(json_description["id"])
		if mix.json_description["clips"] == json_description["clips"] and mix.json_description["songs"] == json_description["songs"]:
			#Mix need no more computation - description has not changed
			mix.update_mix(json_description)
			return jsonify({"message": "Mix is up to date", "data": {"redirect": "/meta/mix/"+mix.id+"/download"}})

		else:
			#Mix description has changed - recomputation is needed
			mix.update_mix(json_description)
			enqueue_mix(mix.id)
			return jsonify({"message": "Mix is being processed"})

	else:
		#New mix
		name = json_description["name"]
		description = json_description["description"]
		genre = json_description["genre"]

		mix = Mix.insert_mix(name, description, genre, json_description)
		enqueue_mix(mix.id)

		return jsonify({"message": "New mix has been created"})

@mix.route("/meta/mix/<id>", methods=["GET"])
def get_mix(id):
	"""Get mix meta information"""
	mix = Mix.get_mix(id)
	schema = MixSchema(many=False)
	
	return jsonify(schema.dump(mix.json_description).data)

@mix.route("/meta/mix/<id>/download", methods=["GET"])
def download_mix(id):
	"""Download MP3/WAV of mix"""
	pass