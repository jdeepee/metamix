# -*- coding: utf-8 -*-
from metamix.blueprints import song
from metamix.models.song import Song
from metamix.extensions import db
from metamix.errors import MetaMixException
from metamix.serialization.song import SongSchema
from flask import current_app

@song.route("/meta/song", methods=["GET"])
def view_songs():
	"""GET all uploaded songs"""
	pass

@song.route("/meta/song/<id>", methods=["POST"])
def retrieve_song_mp3(id):
	"""Retrieves the MP3 of a song - effects/eq can also be specified in request"""
	song = Song.get_song(id)

	if song is None:
		raise MetaMixException(message="That song does not exist")

	song_schema = SongSchema(many=False)
	return song_schema.dump(song).data



