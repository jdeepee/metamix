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
        temp_filename = current_app.config["METAMIX_TEMP_SAVE"] + str(uuid.uuid4()) + ".wav" #Create temporary file upload name
        key = str(uuid.uuid4()) + ".wav" #Create s3 key for file
        data, sr = librosa.load(temp_filepath, sr=44100) #Load audio as array data
        length = float(len(data)) / float(sr) #Get length of audio
        librosa.output.write_wav(temp_filename, data, sr) #Write audio as wav to outfile location

        upload_s3(temp_filename, key, delete)
        os.remove(temp_filepath)
        return key, length, temp_filename

def upload_s3(temp_filename, key, delete=True, public=False):
    """Uploads file to s3 bucket"""
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
    if public == False:
        k.set_acl('private')

    else:
        k.set_acl("public-read")
    print "Upload complete"

    if delete == True:
        os.remove(temp_filename)

