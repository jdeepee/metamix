from metamix.errors import MetaMixException
from metamix.key_variables import modulation_algorithm_parameters
from functools import wraps
from flask import current_app, request
import jwt

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