from metamix.worker.mix import Mix
from redis import Redis
from flask import *
import librosa
import uuid
import boto3
import boto
import os

def enqueue_mix(mix_id, testing, debug_level):
    """Uploads mix to redis queue for effect modulation and audio mixing"""
    redis_conn = Redis(
        current_app.config["REDIS_IP"],
        6379,
        password=current_app.config["REDIS_PASSWORD"],
        socket_timeout=100000)
    q = Queue('mix', connection=redis_conn)
    mix = Mix.mix
    q.enqueue(mix, mix_id, testing, debug_level, ttl=500, timeout=500)

def allowed_file(filename):
    """Checks if file is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in current_app.config["ALLOWED_EXTENSIONS"]

def persist_file(temp_filepath, return_length=False, delete=True):
    if current_app.config["DEVELOPMENT"] == True:
        #Save to local storage\
        temp_filename = current_app.config["METAMIX_TEMP_SAVE"] + str(uuid.uuid4()) + ".wav"

        data, sr = librosa.load(temp_filepath, sr=44100)
        librosa.output.write_wav(temp_filename, data, sr)

        os.remove(temp_filepath)

        if return_length == False:
            return None, temp_filename

        else:
            return None, float(len(data)) / float(sr), temp_filename

    else:
        #Upload to s3
        s3_key, length, wav_file = upload_s3(temp_filepath, return_length, delete)
        return s3_key, length, wav_file

def upload_s3(temp_filepath, return_length=False, delete=True):
    temp_filename = current_app.config["METAMIX_TEMP_SAVE"] + str(uuid.uuid4()) + ".wav"
    key = str(uuid.uuid4()) + ".wav"

    data, sr = librosa.load(temp_filepath, sr=44100)
    librosa.output.write_wav(temp_filename, data, sr)

    """Uploads text document to s3 bucket"""
    os.environ['S3_USE_SIGV4'] = 'True'

    connect = boto.connect_s3(
        current_app.config["AWS_ACCESS_KEY_ID"],
        current_app.config["AWS_SECRET_ACCESS_KEY"],
        host=current_app.config["S3_URL"])
    b = connect.get_bucket(current_app.config["S3_BUCKET"])

    k = b.new_key(b)
    k.key = key
    # file contents to be added
    k.set_contents_from_filename(temp_filename)
    k.set_acl('private')
    print "Upload complete"

    if delete == True:
        os.remove(temp_filename)

    os.remove(temp_filepath)

    if return_length == False:
        return key, None, temp_filename

    else:
        return key, float(len(data)) / float(sr), temp_filename


