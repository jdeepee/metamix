from marshmallow import Schema, fields

class UserSchema(Schema):
    email = fields.Email(required=True)
    first_name = fields.Str(required=True)
    last_name = fields.Str(required=True)
    password = fields.Str(required=True)