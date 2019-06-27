# -*- coding: utf-8 -*-
import os

class Config(object):
    """Base config object"""
    AWS_ACCESS_KEY_ID = "AKIAJ33WTJMARBGTUXZA"
    AWS_SECRET_ACCESS_KEY = "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"
    S3_BUCKET = "metamix-development"
    S3_URL = "s3.eu-west-1.amazonaws.com"
    REDIS_IP = os.environ.get("REDIS_IP")
    REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD")
    ALLOWED_EXTENSIONS = set(["mp3", "MP3", "flac", "FLAC", "wav", "WAV"])
    METAMIX_TEMP_SAVE = "/var/tmp/metamix/"
    BETA_EMAILS = ["joshuadparkin@gmail.com", "test@test.com"]
    DEFAULT_SAMPLE_RATE = 44100

class Production(Config):
    """Production config expands on base config"""
    SQLALCHEMY_DATABASE_URI = "postgres://"+ os.environ.get("DB_USER") + ":" + os.environ.get("DB_PWD") + "@" + os.environ.get("DB_IP") + "/" +os.environ.get("DB_NAME")
    PRESERVE_CONTEXT_ON_EXCEPTION = True
    DEBUG = False
    RQ_REDIS_URL = 'redis://:'+ os.environ.get("REDIS_PASSWORD") + '@'+os.environ.get("REDIS_IP") + ':6379'
    BASE_URL = 'http://127.0.0.1:5000'
    DEVELOPMENT = False

class Development(Config):
    """Development config expands on base config"""
    SQLALCHEMY_DATABASE_URI = "postgres://metamix:metamix@localhost/metamix"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    PRESERVE_CONTEXT_ON_EXCEPTION = True
    DEBUG = True
    BASE_URL = 'http://localhost:5000'
    ADMIN = True
    REDIS_IP = "127.0.0.1"
    REDIS_PASSWORD = ""
    RQ_REDIS_URL = 'redis://127.0.0.1:6379'
    S3_URL = "s3.eu-west-1.amazonaws.com"
    JWT_SECRET = "SUPERSECRETSECRET"
    DEVELOPMENT = True
    LOCAL_SAVE = False

class Test(Config):
    """Test config expands on base config"""
    SQLALCHEMY_DATABASE_URI = "postgres://test:" + os.environ.get("DB_PWD") + "@localhost/big_legal_test"
    DEBUG = True
    BASE_URL = "http://127.0.0.1:5000"
    PRESERVE_CONTEXT_ON_EXCEPTION = True
    TESTING = True
    ADMIN = True
    WTF_CSRF_ENABLED = False
