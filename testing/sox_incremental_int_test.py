from pysndfx import AudioEffectsChain
from librosa import load
import numpy as np

source_song = "/Users/Josh/Music/sample_analysis_songs/1991 - Dun Kno.mp3"
outfile = "gain_test.ogg"

y, sr = load(source_song, sr=None)

fx = (
    AudioEffectsChain()
    .gain(-10)

)
fx(y, outfile)

# #Section we want to change - start and end seconds
# start = 60
# end = 80

# #change of tempo
# target_change = 0.5 #Increase of 50%

# #We want an increment every 0.1 seconds (100ms)
# increments = np.linspace(start,end,((end-start)+1)*10)