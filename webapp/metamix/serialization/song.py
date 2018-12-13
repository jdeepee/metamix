from marshmallow import Schema, fields

class SongSchema(Schema):
    id = fields.UUID()
    name = fields.Str()
    s3_key = fields.Str()
    length = fields.Int() #Mix length in seconds
    description = fields.Int()
    genre = fields.Str()
    bpm = fields.Float()
    beat_positions = fields.Raw() #This should be of type JSON of LIST - and then return data as json array when dumping
    pitch = fields.Str()
    processing_status = fields.Str()
