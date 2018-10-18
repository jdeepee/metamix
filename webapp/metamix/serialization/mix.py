from marshmallow import Schema, fields

#MIX DESCRIPTION JSON SERILIZER OBJECTS
class ParamSchema(Schema):
	strength_curve = fields.Str(),
	start = fields.Str(),
	target = fields.Str(),
	strength_curve_2 = fields.Str(),
	start_2 = fields.Str(),
	target_2 = fields.Str()

class EffectSchema(Schema):
	start = fields.Float(),
	end = fields.Float(),
	type = fields.Str(),

	params = fields.Nested(
		"ParamSchema",
		many=True)

class AudioSchema(Schema):
	id = fields.UUID(),
	start = fields.Float(),
	end = fields.Float(),
	mix_start = fields.Float(),
	mix_end = fields.Float(),

	effects = fields.Nested(
		"EffectSchema",
		many=True)

class MixDescriptionSchema(Schema):
	id = fields.UUID(),
	name = fields.Str(),
	description = fields.Str(),
	length = fields.Float(),
	genre = fields.Str(),

	songs = fields.Nested(
        "AudioSchema",
        many=True)
	clips = fields.Nested(
        "AudioSchema",
        many=True)

class MixSchema(Schema):
    id = fields.UUID()
    name = fields.Str()
    s3_key = fields.Str()
    length = fields.Int() #Mix length in seconds
    description = fields.Int()
    genre = fields.Str()
    processing_status = fields.Str()

   	json_description = fields.Nested(
        "MixDescriptionSchema",
        many=False)
