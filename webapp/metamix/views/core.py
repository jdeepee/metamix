# -*- coding: utf-8 -*-
from metamix.blueprints import core
from metamix.models.mix import Mix, MixAudio
from metamix.models.song import Song, Effect
from metamix.models.clip import Clip
from metamix.extensions import db
from metamix.errors import MetaMixException
from metamix.utils.upload import upload_s3, allowed_file
from metamix.utils.analysis import analyse_audio
from metamix.key_variables import modulation_algorithm_parameters
from flask import *
import uuid

@core.route("/", methods=["GET"])
def landing_page():
    """Landing page"""
    pass

@core.route("/meta/upload", methods=["POST"])
def upload_song():
    """Upload song(s) to service"""
    files = request.files.getlist("files")
    if "type" not in request.args:
        raise MetaMixException(message="Type must be specified as request argument", status_code=400)

    type = request.args.get("type")

    #Uploading songs seems to take a while - these should be threaded and use multipart uploads - threading should also include audio analysis
    if type == "song":
        for file in files:
            if allowed_file(file.filename):
                temp_filepath = current_app.config["METAMIX_TEMP_SAVE"] + str(uuid.uuid4()) + "." + file.filename.split(".")[-1]
                file.save(temp_filepath)
                s3_key, length, wav_file = upload_s3(temp_filepath, return_length=True, delete=False)
                bpm, beat_positions, key = analyse_audio(wav_file)

                Song.insert_song({"name": file.filename, "s3_key": s3_key, "length": length, "bpm": bpm, "beat_positions": beat_positions,
                                  "key": key})

    elif type == "clip":
        for file in files:
            if allowed_file(file.filename):
                temp_filepath = current_app.config["METAMIX_TEMP_SAVE"] + str(uuid.uuid4()) + "." + file.filename.split(".")[-1]
                file.save(temp_filepath)
                s3_key, length, wav_file = upload_s3(temp_filepath, return_length=True, delete=False)
                bpm, beat_positions, key = analyse_audio(wav_file)

                Clip.insert_clip({"name": file.filename, "s3_key": s3_key, "length": length, "bpm": bpm, "beat_positions": beat_positions,
                                  "key": key})

    else:
        raise MetaMixException(message="Invalid type argument", status_code=400)

    return jsonify({"message": "Clip(s) have been uploaded"}), 200 

@core.route("/meta/effects", methods=["GET"])
def get_effects():
    """Gets all effects currently available on the service and their associated parameters"""
    out = []

    for effect in modulation_algorithm_parameters:
        del effect["increment_time_change"]
        out.append(effect)

    return jsonify(out)