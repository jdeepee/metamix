# -*- coding: utf-8 -*-
import os

class Config(object):
    """Base config object"""
    AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")
    S3_BUCKET = os.environ.get("S3_BUCKET")
    S3_URL = "s3.eu-west-2.amazonaws.com"
    REDIS_IP = os.environ.get("REDIS_IP")
    REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD")

class Production(Config):
    """Production config expands on base config"""
    SQLALCHEMY_DATABASE_URI = "postgres://"+ os.environ.get("DB_USER") + ":" + os.environ.get("DB_PWD") + "@" + os.environ.get("DB_IP") + "/" +os.environ.get("DB_NAME")
    PRESERVE_CONTEXT_ON_EXCEPTION = True
    DEBUG = False
    RQ_REDIS_URL = 'redis://:'+ os.environ.get("REDIS_PASSWORD") + '@'+os.environ.get("REDIS_IP") + ':6379'
    BASE_URL = 'http://127.0.0.1:5000'

class Development(Config):
    """Development config expands on base config"""
    SQLALCHEMY_DATABASE_URI = "postgres://Josh:@localhost/metamix"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    PRESERVE_CONTEXT_ON_EXCEPTION = True
    DEBUG = True
    BASE_URL = 'http://127.0.0.1:5000'
    ADMIN = True
    REDIS_IP = ""
    REDIS_PASSWORD = ""
    RQ_REDIS_URL = 'redis://:0c2fbe953260497603907b8f20a6d4f255fe57d1e4eba5ce47e169e670fcb22c@52.16.190.51:6379'
    S3_URL = "s3.eu-west-2.amazonaws.com"

class Test(Config):
    """Test config expands on base config"""
    SQLALCHEMY_DATABASE_URI = "postgres://test:" + os.environ.get("DB_PWD") + "@localhost/big_legal_test"
    DEBUG = True
    BASE_URL = "http://127.0.0.1:5000"
    PRESERVE_CONTEXT_ON_EXCEPTION = True
    TESTING = True
    ADMIN = True
    WTF_CSRF_ENABLED = False
