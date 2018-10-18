from metamix.worker.mix import Mix
from redis import Redis
from flask import *
import librosa
import uuid
import boto3

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

def upload_s3(temp_filepath, return_length=False):
    temp_filename = current_app.config["METAMIX_TEMP_SAVE"] + str(uuid.uuid4()) + ".wav"
    key = str(uuid.uuid4()) + ".wav"

    data, sr = librosa.load(temp_filepath, sr=44100)
    librosa.output.write_wav(temp_filename, data, sr)

    session = boto3.session.Session(region_name='eu-west-1')
    s3 = session.client('s3', config=boto3.session.Config(signature_version='s3v4'))
    s3.upload_file(temp_filename, current_app.config["S3_BUCKET"], key)
    os.remove(temp_filename)
    os.remove(temp_filepath)

    if return_length == False:
        return key

    else:
        return key, float(len(data)) / float(sample_rate)