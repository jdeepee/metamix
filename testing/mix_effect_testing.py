from librosa import load
from pysndfx import AudioEffectsChain
import numpy as np
from effects import mix
import time
import librosa

#Lets all make a test where we alter the volume of one track and then mix to check if the tracks volume is untouched 

# data_x = [0,1,2,3,4,5,6]
# data_z = [1,2,3,4,5,6,7,8]
# data_y = [2,3,4,5,6,7,8]
# data_t = [3,4,5,6,7,8,9]
# data_tx = [7,8,9,10,11,12]

# test_data = [{"start": 0, "end": 6, "id": "x", "data": data_x}, {"start": 1, "end": 8, "id": "z", "data": data_z},
# 			 {"start": 2, "end": 8, "id": "y", "data": data_y}, {"start": 3, "end": 9, "id": "t", "data": data_t},
# 			 {'start': 7, 'end': 12, 'id': 'tx', "data": data_tx}]
# sample_rate = 44100

song1 = "/Users/Josh/Music/sample_analysis_songs/A.M.C & Turno - Draw 4 That.mp3"
song2 = "/Users/Josh/Music/sample_analysis_songs/Dimension - Raver.mp3"

y, sr = load(song1, sr=None)
song1_start = 0 #Start wihin mix
song1_end = 60 #End within mix
song1_data = y[0:60*sr]

y, sr_2 = load(song2, sr=None)
song2_start = 44.2 #Start wihin mix
song2_end = 60 #End within mix
song2_data = y[44.2*sr:104.2*sr]

print "Shape song2: {}".format(song2_data.shape)

assert sr == sr_2

data = [{"start": song1_start, "end": song1_end, "id": 1, "data": song1_data}, {"start": song2_start, "end": song2_end, "id": 2, "data": song2_data}]

t0 = time.time()
mix_data = mix(data, sr, debug=True)
t1 = time.time()

print "Time taken for mix function: {}".format(t1-t0)
librosa.output.write_wav("./audio_out/mix.wav", mix_data, sr)

# song1 = "/Users/Josh/Music/sample_analysis_songs/1991 - Dun Kno.mp3"
# song2 = "/Users/Josh/Music/sample_analysis_songs/A.M.C & Turno - Draw 4 That.mp3"
# song3 = "/Users/Josh/Music/sample_analysis_songs/Agressor Bunx - Time Shift.mp3"
# song4 = "/Users/Josh/Music/sample_analysis_songs/Current Value - Eager Fight (A.M.C Remix).mp3"

# outfile_high = "./audio_out/mix_test.ogg"

# y, sr = load(song1, sr=None)
# song1_start = 0 #Start wihin mix
# song1_end = 5.5 #End within mix
# song1_data = y[10*sr:15.5*sr]

# y, sr_2 = load(song2, sr=None)
# song2_start = 3
# song2_end = 6
# song2_data = y[0*sr:3*sr]

# y, sr_3 = load(song3, sr=None)
# song3_start = 6
# song3_end = 20
# song3_data = y[22*sr:36*sr]

# y, sr_4 = load(song4, sr=None)
# song4_start = 8
# song4_end = 10
# song4_data = y[44*sr:46*sr]

# song5_start = 2
# song5_end = 2.5
# song5_data = y[44*sr:46*sr]

# song6_start = 8
# song6_end = 9
# song6_data = y[44*sr:46*sr]


# assert (sr == sr_2 and sr == sr_3 and sr == sr_4)

# data = [{"start": song1_start, "end": song1_end, "id": 1, "data": song1_data}, {"start": song2_start, "end": song2_end, "id": 2, "data": song2_data}, 
# 		{"start": song3_start, "end": song3_end, "id": 3, "data": song3_data}, {"start": song4_start, "end": song4_end, "id": 4, "data": song4_data}, 
# 		{"start": song5_start, "end": song5_end, "id": 5, "data": song5_data}, {"start": song6_start, "end": song6_end, "id": 6, "data": song6_data}]

# [{'start': 0, 'end': 5.5, 'id': 1}, {'start': 2, 'end': 2.5, 'id': 5}, 
# {'start': 3, 'end': 6, 'id': 2}, {'start': 6, 'end': 20, 'id': 3}, 
# {'start': 8, 'end': 10, 'id': 4}, {'start': 8, 'end': 9, 'id': 6}]

# goal = [[0,2, [1,5]], [2,2.5, [1,5]], [2.5,3, [1]], [3,5.5, [1,2]], [5.5,6, [2]], [6,8, [3]], [8,9, [3,4,6]], [9,10, [3,4]], [10,20, [3]]]

# # y, sr = load(song1, sr=None)
# # song1_start = 0 #Start wihin mix
# # song1_end = 10 #End within mix
# # song1_data = y[0*sr:10*sr]

# # y, sr_2 = load(song2, sr=None)
# # song2_start = 6
# # song2_end = 10
# # song2_data = y[0*sr:4*sr]

# # data = [{"start": song1_start, "end": song1_end, "id": 1, "data": song1_data}, {"start": song2_start, "end": song2_end, "id": 2, "data": song2_data}]

# t0 = time.time()
# mix_data = mix(data, sr)
# t1 = time.time()

# print "Time taken for mix function: {}".format(t1-t0)
# librosa.output.write_wav("./audio_out/mix.wav", mix_data, sr)