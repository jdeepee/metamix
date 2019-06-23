from librosa import load
from pysndfx import AudioEffectsChain
import numpy as np
from filters import high_pass_filter, low_pass_filter
import time

source_song = "/Users/Josh/Music/sample_analysis_songs/1991 - Dun Kno.mp3"
outfile_highpass = "./audio_out/outfile_highpass_test.ogg"
outfile_lowpass = "./audio_out/outfile_lowpass_test.ogg"
outfile_highpass_cont = "./audio_out/outfile_highpass_cont_test.ogg"
outfile_lowpass_cont = "./audio_out/outfile_lowpass_cont_test.ogg"

y, sr = load(source_song, sr=None)
start = 45
end = 60

target_high = 5000
target_low = 4000

y_start = y[0:start*sr]
data = y[start*sr:end*sr]
y_end = y[end*sr:]

#HIGH PASS FILTER LINEAR
start = time.time()
data_high = high_pass_filter(data, sr, "linear", target_high, debug=True)
end = time.time()

print 'Time taken for high pass filter: {}'.format(end-start)
print "\n"

#LOW PASS FILTER LINEAR
start = time.time()
data_low = low_pass_filter(data, sr, "linear", target_low, debug=True)
end = time.time()

print 'Time taken for low pass filter: {}'.format(end-start)
print "\n"

#HIGH PASS FILTER CONT
start = time.time()
data_high_cont = high_pass_filter(data, sr, "continuous", target_high, debug=False)
end = time.time()

print 'Time taken for cont high pass filter: {}'.format(end-start)
print "\n"

#LOW PASS FILTER CONT
start = time.time()
data_low_cont = low_pass_filter(data, sr, "continuous", target_low, debug=False)
end = time.time()

print 'Time taken for cont low pass filter: {}'.format(end-start)
print "\n"
########################

final_start_high = np.concatenate((y_start, data_high))
final_end_high = np.concatenate((final_start_high, y_end))

final_start_low = np.concatenate((y_start, data_low))
final_end_low = np.concatenate((final_start_low, y_end))

final_start_high_cont = np.concatenate((y_start, data_high_cont))
final_end_high_cont = np.concatenate((final_start_high_cont, y_end))

final_start_low_cont = np.concatenate((y_start, data_low_cont))
final_end_low_cont = np.concatenate((final_start_low_cont, y_end))

fx = (
    AudioEffectsChain()
)

# Apply the effects to a ndarray but store the resulting audio to disk.
fx(final_end_high, outfile_highpass)
fx(final_end_low, outfile_lowpass)
fx(final_end_high_cont, outfile_highpass_cont)
fx(final_end_low_cont, outfile_lowpass_cont)