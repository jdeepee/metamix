from librosa import load
from pysndfx import AudioEffectsChain
import numpy as np
from effects import pitch
import time

source_song = "/Users/Josh/Music/sample_analysis_songs/1991 - Dun Kno.mp3"
outfile = "./audio_out/pitch_test.ogg"

y, sr = load(source_song, sr=None)
print "Running with sample rate: {}".format(sr)
start = 45
end = 60
target = -2

y_start = y[0:start*sr]
data = y[start*sr:end*sr]
y_end = y[end*sr:]

data = pitch(data, sr, "linear", target, 0, True)

final_start = np.concatenate((y_start, data))
final_end = np.concatenate((final_start, y_end))

fx = (
    AudioEffectsChain()
)

# # Apply the effects to a ndarray but store the resulting audio to disk.
fx(final_end, outfile)