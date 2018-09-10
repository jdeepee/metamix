# -*- coding: utf-8 -*-
from metamix.blueprints import core
from metamix.models.mix import Mix, MixSongs
from metamix.models.song import Song, SongEffects
from metamix.extensions import db
from flask import current_app

@core.route("/", methods=["GET"])
def landing_page():
	"""Landing page"""
	pass

@core.route("/meta/upload", methods=["POST"])
def upload_song():
	"""Upload song(s) to service"""
	pass

@core.route("/meta/effects", methods=["GET"])
def get_effects():
	"""Gets all effects currently available on the service and their associated ID's"""
	pass