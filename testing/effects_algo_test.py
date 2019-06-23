from librosa import load
from pysndfx import AudioEffectsChain
import numpy as np
from effects import gain, volume 
import time
import sox
#mport essentia

source_song = "/Users/Josh/Music/sample_analysis_songs/1991 - Dun Kno.mp3"
outfile_vol = "./audio_out/volume_test_0.7-0.1.ogg"

y, sr = load(source_song, sr=None)
start = 45
end = 60
target = 0.1

y_start = y[0:start*sr]
data = y[start*sr:end*sr]
y_end = y[end*sr:]

data = volume(data, sr, "linear", target, 0.7)

final_start = np.concatenate((y_start, data))
final_end = np.concatenate((final_start, y_end))

fx = (
    AudioEffectsChain()
)

# # Apply the effects to a ndarray but store the resulting audio to disk.
fx(final_end, outfile_vol)