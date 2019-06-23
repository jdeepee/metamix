from pysndfx import AudioEffectsChain
from librosa import load
import numpy as np

source_song = "/Users/Josh/Music/sample_analysis_songs/1991 - Dun Kno.mp3"
outfile = "out3.ogg"

y, sr = load(source_song, sr=None)
print len(y)
print sr

#Section we want to change - start and end seconds
start = 60
end = 80

#change of tempo
target_change = 0.5 #Increase of 50%

#We want an increment every 0.1 seconds (100ms)
increments = np.linspace(start,end,((end-start)+1)*10)

y_start = y[0:start*sr]
y_end = y[end*sr:]

out = np.array([])

chunk_size = float(target_change/len(increments))
print "Chunk size: {}".format(chunk_size)

for n in range(len(increments)):
	if n == 0:
		chunk = 0.1
	chunk = n * chunk_size
	current_start = increments[n]
	current_end = increments[n+1]
	print "On second: {} to: {} with chunk size: {}".format(current_start, current_end, chunk)

	fx = (
	    AudioEffectsChain()
	    .tempo(chunk)
	
	)
	current_y = y[current_start*sr:current_end*sr]
	y_fx_out = fx(current_y)
	out = np.concatenate((out, y_fx_out))

#out = np.array(out)
print out.shape 
final_start = np.concatenate((y_start, out))
final_end = np.concatenate((final_start, y_end))

fx = (
    AudioEffectsChain()
)

# Apply the effects to a ndarray but store the resulting audio to disk.
fx(final_end, outfile)


"""Testing if we can split song up into chunks and then apply EQ/effect to these chunks and then concatenate results"""