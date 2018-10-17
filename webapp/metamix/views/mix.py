# -*- coding: utf-8 -*-
from metamix.blueprints import mix
from metamix.models.mix import Mix, MixAudio
from metamix.models.song import Song, Effect
from metamix.extensions import db
from flask import current_app

@mix.route("/meta/mix", methods=["GET"])
def dashboard():
	"""GET all user created mix's"""
	pass

@mix.route("/meta/mix", methods=["POST"])
def create_mix():
	"""Create or update existing mix"""
	pass

@mix.route("/meta/mix/<id>", methods=["GET"])
def get_mix(id):
	"""Get mix meta information"""
	pass

@mix.route("/meta/mix/<id>/download", methods=["GET"])
def download_mix(id):
	"""Download MP3 of mix"""
	pass