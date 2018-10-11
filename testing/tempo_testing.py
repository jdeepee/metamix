from librosa import load
from pysndfx import AudioEffectsChain
import numpy as np
from effects import tempo
import time

source_song = "/Users/Josh/Music/sample_analysis_songs/1991 - Dun Kno.mp3"
outfile = "./audio_out/tempo_test.ogg"

y, sr = load(source_song, sr=None)
print "Running with sample rate: {}".format(sr)
start = 45
end = 60
target = 0.812

y_start = y[0:start*sr]
data = y[start*sr:end*sr]
y_end = y[end*sr:]

t0 = time.time()

data = tempo(data, sr, "linear", target, 0.5, True)

t1 = time.time()

print "Time taken: {}".format(t1-t0)

final_start = np.concatenate((y_start, data))
final_end = np.concatenate((final_start, y_end))

fx = (
    AudioEffectsChain()
)

# # Apply the effects to a ndarray but store the resulting audio to disk.
fx(final_end, outfile)