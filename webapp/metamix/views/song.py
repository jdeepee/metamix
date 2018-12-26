# -*- coding: utf-8 -*-
#This file and blueprint should be changed to song from clip
from metamix.blueprints import song
from metamix.models.song import Song, Effect
from metamix.models.clip import Clip
from metamix.models.user import User
from metamix.extensions import db
from metamix.errors import MetaMixException
from metamix.serialization.song import SongSchema
from metamix.utils.general import jwt_required
from metamix.utils.analysis import analyse_audio, create_waveform
from metamix.utils.upload import persist_file, allowed_file
from flask import *
import uuid
import json

@song.route("/meta/song", methods=["GET"])
@jwt_required
def get_songs(user_id):
	"""GET all uploaded songs"""
	user = User.get_user(user_id)
	songs = user.get_songs()
	song_schema = SongSchema(many=True)
	return jsonify(song_schema.dump(songs).data), 200

@song.route("/meta/clip", methods=["GET"])
@jwt_required
def get_clips(user_id):
    pass

@song.route("/meta/song/upload", methods=["POST"])
@jwt_required
def upload_song(user_id):
    """Upload song(s) to service"""
    files = request.files.getlist("files")
    if "type" not in request.args:
        raise MetaMixException(message="Type must be specified as request argument", status_code=400)

    type = request.args.get("type")

    #Uploading songs seems to take a while - these should be threaded and use multipart uploads - threading should also include audio analysis
    if type == "song":
        for file in files:
            print file.filename
            if allowed_file(file.filename):
                temp_filepath = current_app.config["METAMIX_TEMP_SAVE"] + str(uuid.uuid4()) + "." + file.filename.split(".")[-1]
                file.save(temp_filepath)
                s3_key, length, wav_file = persist_file(temp_filepath, return_length=True, delete=False)
                bpm, beat_positions, key = analyse_audio(wav_file)
                waveform_key = create_waveform(wav_file)

                Song.insert_song({"name": file.filename, "s3_key": s3_key, "length": length, "bpm": bpm, "beat_positions": json.dumps(beat_positions.tolist()),
                                  "key": key, "owner_id": user_id, "waveform": waveform_key})

    elif type == "clip":
        for file in files:
            if allowed_file(file.filename):
                temp_filepath = current_app.config["METAMIX_TEMP_SAVE"] + str(uuid.uuid4()) + "." + file.filename.split(".")[-1]
                file.save(temp_filepath)
                s3_key, length, wav_file = persist_file(temp_filepath, return_length=True, delete=False)
                bpm, beat_positions, key = analyse_audio(wav_file)
                waveform_key = create_waveform(wav_file)
                Clip.insert_clip({"name": file.filename, "s3_key": s3_key, "length": length, "bpm": bpm, "beat_positions": beat_positions,
                                  "key": key, "owner_id": user_id, "waveform": waveform_key})

    else:
        raise MetaMixException(message="Invalid type argument", status_code=400)

    return jsonify({"message": "Clip(s) have been uploaded"}), 200 


@song.route("/meta/song/<id>", methods=["POST"])
def retrieve_song_mp3(id):
	"""Retrieves the MP3 of a song - effects/eq can also be specified in request"""
	song = Song.get_song(id)

	if song is None:
		raise MetaMixException(message="That song does not exist")

	song_schema = SongSchema(many=False)
	return song_schema.dump(song).data

