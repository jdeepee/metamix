from librosa import load
from pysndfx import AudioEffectsChain
import numpy as np
from eq import equalizer, equalizer_cm
import time

source_song = "/Users/Josh/Music/sample_analysis_songs/1991 - Dun Kno.mp3"
outfile_high = "./audio_out/eq_low_test.ogg"
outfile_high_c = "./audio_out/eq_low_test_c.ogg"
outfile_high_lcm = "./audio_out/eq_low_test_lcm.ogg"

y, sr = load(source_song, sr=None)
start = 45
end = 60
target_change = -40.0  #Increase of 10db

y_start = y[0:start*sr]
data = y[start*sr:end*sr]
y_end = y[end*sr:]

start = time.time()
datal = equalizer(data, sr, "linear", target_change, 200, debug=False)
end = time.time()

print 'Time taken for linear EQ: {}'.format(end-start)

start = time.time()
datalcm = equalizer_cm(data, sr, "linear", target_change, 200, debug=False)
end = time.time()

print 'Time taken for linear EQ CM: {}'.format(end-start)

start = time.time()
datac = equalizer(data, sr, "continuous", target_change, 200, debug=False)
end = time.time()

print 'Time taken for continuous EQ: {}'.format(end-start)

final_start_l = np.concatenate((y_start, datal))
final_end_l = np.concatenate((final_start_l, y_end))

final_start_lcm = np.concatenate((y_start, datalcm))
final_end_lcm = np.concatenate((final_start_lcm, y_end))

final_start_c = np.concatenate((y_start, datac))
final_end_c = np.concatenate((final_start_c, y_end))

fx = (
    AudioEffectsChain()
)

# Apply the effects to a ndarray but store the resulting audio to disk.
fx(final_end_l, outfile_high)
fx(final_end_c, outfile_high_c)
fx(final_end_lcm, outfile_high_lcm)