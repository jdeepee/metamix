from flask import Blueprint

#User contains all route related to user functions (profile edits, signup, login etc)
user = Blueprint("user", "metamix.views.user", "metamix.templates")
#Mix contains all routes related to interactions with a mix (getting mix, downloading, editing etc)
mix = Blueprint("mix", "metamix.views.mix", "metamix.templates")
#Song contains all routes which involve getting the result of an edit to song or information of a song
song = Blueprint("song", "metamix.views.song", "metamix.templates")

all_blueprints = (user, mix, song)
