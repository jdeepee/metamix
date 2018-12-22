from marshmallow import Schema, fields
import json

class MixSchema(Schema):
    id = fields.UUID()
    name = fields.Str()
    s3_key = fields.Str()
    length = fields.Int() #Mix length in seconds
    description = fields.Int()
    genre = fields.Str()
    processing_status = fields.Str()
    json_description = fields.Raw()
    #fields.Function(lambda obj: json.dumps(obj.json_description))
    #fields.Function(lambda obj: json.dumps(obj.json_description))
