# -*- coding: utf-8 -*-
from metamix.blueprints import user
from metamix.models.user import User
from metamix.serialization.user import UserSchema
from metamix.key_variables import modulation_algorithm_parameters
from metamix.errors import MetaMixException
from metamix.utils.general import jwt_required
from marshmallow import ValidationError
from flask import *
import jwt

@user.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    try:
        loaded = UserSchema(many=False).load(data)
    except ValidationError as err:
        raise MetaMixException(message=err.messages, status_code=400)

    if data["email"] not in current_app.config["BETA_EMAILS"]:
        raise MetaMixException(message="You are not in the MetaMix beta", status_code=400)

    if User.get_user(data["email"]) != None:
        raise MetaMixException(message="User with given email already exists", status_code=400)

    iuser = User.add_user(data)
    token = jwt.encode({'user_id': str(iuser.id)}, current_app.config["JWT_SECRET"], algorithm='HS256')
    return jsonify({"message": "You have been signed up", "token": token}), 200

@user.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if "email" not in data:
        raise MetaMixException(message="Email has not been supplied", status_code=400)

    if "password" not in data:
        raise MetaMixException(message="Password has not been supplied", status_code=400)

    target_user = User.get_user(data["email"])

    if target_user == None:
        raise MetaMixException(message="User with given email does not exist", status_code=400)

    if User.check_password(data["password"], target_user.password) == False:
        raise MetaMixException(message="Invalid password", status_code=400)

    token = jwt.encode({'user_id': str(target_user.id)}, current_app.config["JWT_SECRET"], algorithm='HS256')
    return jsonify({"message": "Login success", "token": token}), 200

@user.route("/api/globals", methods=["GET"])
@jwt_required
def api_globals(user_id): 
    data = {
        "base_url": current_app.config["BASE_URL"],
        "modulation_algorithm_parameters": []
    }

    for effect in modulation_algorithm_parameters:
        del effect["increment_time_change"]
        data["modulation_algorithm_parameters"].append(effect)

    return jsonify(data), 200