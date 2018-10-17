# -*- coding: utf-8 -*-
from metamix.blueprints import song
from metamix.models.mix import Mix, MixAudio
from metamix.models.song import Song, Effect
from metamix.extensions import db
from flask import current_app

@song.route("/meta/song", methods=["GET"])
def view_songs():
	"""GET all uploaded songs"""
	pass

@song.route("/meta/song/<id>", methods=["POST"])
def retrieve_song_mp3():
	"""Retrieves the MP3 of a song - effects/eq can also be specified in request"""
	pass

