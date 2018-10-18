# -*- coding: utf-8 -*-
from metamix.blueprints import core
from metamix.models.mix import Mix, MixAudio
from metamix.models.song import Song, Effect
from metamix.models.clip import Clip
from metamix.extensions import db
from metamix.errors import MetaMixException
from metamix.utils.upload import upload_s3, allowed_file
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

    if type == "song":
        for file in files:
            if allowed_file(file.filename):
                temp_filepath = current_app.config["METAMIX_TEMP_SAVE"] + str(uuid.uuid4()) + "." + file.filename.split(".")[-1]
                file.save(temp_filepath)
                s3_key, length = upload_s3(temp_filepath, return_length=True)

                Song.insert_song({"name": file.filename, "s3_key": s3_key, "length": length})

    elif type == "clip":
        for file in files:
            if allowed_file(file.filename):
                temp_filepath = current_app.config["METAMIX_TEMP_SAVE"] + str(uuid.uuid4()) + "." + file.filename.split(".")[-1]
                file.save(temp_filepath)
                s3_key, length = upload_s3(temp_filepath, return_length=True)

                Clip.insert_clip({"name": file.filename, "s3_key": s3_key, "length": length})

    else:
        raise MetaMixException(message="Invalid type argument", status_code=400)

    return jsonify({"message": "Clip(s) have been uploaded"}), 200 

@core.route("/meta/effects", methods=["GET"])
def get_effects():
    """Gets all effects currently available on the service and their associated ID's"""
    pass