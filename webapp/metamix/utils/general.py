from metamix.errors import MetaMixException
from metamix.key_variables import modulation_algorithm_parameters
from functools import wraps
from flask import current_app, request
from uuid import UUID
import jwt
import boto3

def jwt_required(f):
    """Check if user is a pro user"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            if not request.headers.get("JWT-Auth"): #Check for token
                raise MetaMixException(message="Missing auth token", status_code=401)
            else:
                token = request.headers.get("JWT-Auth")
                payload = jwt.decode(str(token), current_app.config["JWT_SECRET"], algorithms=['HS256']) #Decoding token
                user_id = payload['user_id']
                return f(user_id, *args, **kwargs) #Returning function

        except jwt.DecodeError: #If JWT token doesnt decode ie isnt created with same secret 
            raise MetaMixException(message="Token invalid", status_code=401)

        except jwt.ExpiredSignature: #If JWT token has expired
            raise MetaMixException(message="Token has expired, please sign in again", status_code=401)

        return f(*args, **kwargs)
    return wrapper

def delete_s3(key):
    """Deletes s3 object at parameter key"""
    session = boto3.Session(region_name='eu-west-1',
                aws_access_key_id=current_app.config["AWS_ACCESS_KEY_ID"],
                aws_secret_access_key=current_app.config["AWS_SECRET_ACCESS_KEY"])
    s3 = session.resource('s3', config=boto3.session.Config(signature_version='s3v4'))
    obj = s3.Object(current_app.config["S3_BUCKET"], key)
    obj.delete()

def is_valid_uuid(uuid_to_test, version=4):
    """
    Check if uuid_to_test is a valid UUID.

    Parameters
    ----------
    uuid_to_test : str
    version : {1, 2, 3, 4}

    Returns
    -------
    `True` if uuid_to_test is a valid UUID, otherwise `False`.
    """
    try:
        uuid_obj = UUID(uuid_to_test, version=version)
    except:
        return False

    return str(uuid_obj) == uuid_to_test