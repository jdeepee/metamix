from librosa import load
from pysndfx import AudioEffectsChain
import numpy as np
import math
import librosa
import subprocess
import re
import copy
import itertools
import os
import sys

"""NOTES

Possible that non continous strength curves will not be able to be applied to echo effect due to the nature of the effect
effect may extend past a given 100ms frame thus starting the echo again - might have to calculate the length of the echo
and then decide at which frame the next echo effect should be applied to ensure the echo's do not cut each other up

Tempo is the only effect which cannot be done using SOX - look into another way of doing this - cannot be done using sox as you cannot
increase tempo by any factor less than 10%

Volume should not go above 100% - just down to zero
Gain should be able to be increased + or - x on each side - x will have a decided default or can be specified by the user

-6db is half - can figure out the logarithmic scale to get input % eg 0.5 = 6 dB to decibal out
We may have to extract the levels for each song and then figure out where 0 would be so that we can see the end of the scale? 
Otherwise we might just have to go down to 1% and then apply a bunch of decibal reduction to ensure we reached 0 perceived loudness
looks like we cannot get the levels of each song? Havent tested but research into decibals to perceived loudness would indicate this
We dont need to worry about this lol we can just ommit the data in this range completely
need to ensure this okay - mix still needs to follow the correct time - if there is a section in the mix with no sound there should be a gap here
but how do we make a gap in the data but still have it have the correct length when saved as mp3

Same should also apply for gain 

Pitch seems to also be effected by the chopping sound
Possible this can be fixed by using the segment, search and overlap parameters
If it is not possible then we should use the continuous method applied in the EQ function
Pitch also currently does not go into the negative values - just goes from start to start + change - fix this

so turns out pitch and tempo modulation are two very difficult tasks - the algorithms on the internet are just not good enough for a full production setup
So going forward we use: ELASTIQUE PRO by Zplane
But for now we can just use the simple versions of the algorithms that we have - build the MVP and then see how we go

for using rubberband on tempo and pitch modulation - test the time difference between saving a wav of each frame and then computing on each frame vs
saving a wav of the whole data frame and then computing on this and then slicing the outputted result
"""

def return_overlaping_times(current, checks):
    """Returns two lists: children which fall completely inside current, children which fall partially inside current value"""
    #Lets turn this code into nice one line iterations and move type key/value pairs as they are most likley not useful at all
    complete_coverage = []
    partial_coverage = []

    for check in checks:
        if check["id"] != current["id"]:
            #print "Evaluating value: {} against: {}".format(check, current)

            if check["start"] >= current["start"] and check["end"] <= current["end"]:
                check["type"] = "child_covered"
                complete_coverage.append(check)

            elif check["start"] >= current["start"] and check["end"] > current["end"] and check["start"] < current["end"]:
                check["type"] = "child_partial"
                partial_coverage.append(check)   

    return complete_coverage, partial_coverage 

def mix_tracks(track1, track2, sample_rate):
    out = []

    for i, v in enumerate(track1):
        samplef1 = v / 32768.0
        samplef2 = track2[i] / 32768.0
        mixed = samplef1 + samplef2
        if mixed > 1.0:
            mixed = 1.0

        elif mixed < -1.0:
            mixed = -1.0

        out.append(mixed*32768.0)

    return out

def blockPrint():
    sys.stdout = open(os.devnull, 'w')

def enablePrint():
    sys.stdout = sys.__stdout__

def mix(data, sample_rate, debug=False):
    """Returns mixed version of input data - where songs are mixed according to time-stamps
    sample rate of all data in songs should be the same - otherwise it will sound fucked
    
    data: list of dictionaries containing following keys: data, start, end where data is numpy array of data as timepoint floating series
    returns: array containing floating timepoint series of all input data mixed together
    """
    out = []
    data_id = {} #Map audio id to data - so we dont have to copy and move data around in operations below
    for audio in data:
        data_id[audio["id"]] = audio["data"]
        del audio["data"]

    if debug != True:
        blockPrint()

    data = sorted(data, key=lambda x: x["start"]) #Sort data by starting value low->high

    print "Input data: {}\n".format(data)
    time_copy = copy.deepcopy(data)
    eval_data = [[x] for x in data] #Create eval_data structure
    eval_copy = copy.deepcopy(data) #Copy for evaluation
    print "Eval Input data: {}\n".format(data)

    for i, audio in enumerate(data):
        print "Iterating over audio: {}\n".format(audio)
        covered_children, partial_children = return_overlaping_times(audio, eval_copy) #Get children completely inside audio and partially inside audio 

        print "covered_children: {}\n".format(covered_children)
        print "Partial children: {}\n".format(partial_children)
        print 'Eval copy: {}\n'.format(eval_copy)
        print 'Eval data: {}\n'.format(eval_data)
        print "Normal data: {}\n".format(data)

        for cc in covered_children:
            eval_data[i].append(copy.deepcopy(cc)) #Add covered child to current eval data item
            eval_copy.remove(cc) #Remove from future evaluations - is completely inside this and thus does not need its own evaluation
            del cc["type"] #Delete type so we can access eval data object by value
            eval_data.remove([cc]) #Remove from output eval data object
            data.remove(cc) #Remove from future evaluations - anything inside or partially inside this audio segment will be caught by current audio iteration
            #time_copy.remove(cc)

        for pc in partial_children:
            eval_data[i].append(copy.deepcopy(pc)) #Add partially covered childto current eval data item
            cpc = copy.deepcopy(pc) #Make copy so we can change starting time for future evaluations without changing value inside eval data object
            eval_copy[eval_copy.index(cpc)]["start"] = audio["end"] #Update starting time for evaluation dataset
            del cpc["type"] #Delete type so we access eval data object by value
            eval_data[eval_data.index([cpc])][0]["start"] = audio["end"] #Update starting time for output dataset - the first segment of this audio will be contained within current output data value - thus the next stage of data creation will only need to happen from end of current output data value
        
        print 'Eval copy: {}\n'.format(eval_copy)
        print 'Eval data: {}\n'.format(eval_data)
        print "Normal data: {}\n".format(data)
        print "####\n"

    for item in eval_data:
        print item
        print "\n"

    master_clip_index = []

    for i, d in enumerate(eval_data):
        eval_data[i][0]["type"] = "parent"

    #Test method below on standard input data without grouping clips together and see if it works
    for i, data in enumerate(eval_data):
        print "On segment: {}".format(data)
        parent_value = eval_data[i][0]
        if len(eval_data[i]) > 1:
            #First set of data pairs will always be 1st item start -> 2nd item start
            local_out = []
            starting_value = parent_value["start"]
            ending_value = eval_data[i][1]["start"]
            final_end = parent_value["end"]
            next_value = 0
            local_out.append([starting_value, ending_value, [parent_value["id"]]])
            #Create two lists sorted by lowest start and lowest end
            print 'Current start and end values: {}, {}'.format(starting_value, ending_value)
            start_list = sorted([x for x in eval_data[i] if x["start"] > ending_value and x["type"] != "parent"], key=lambda x: x["start"])
            end_list = sorted([x for x in eval_data[i] if x["end"] > ending_value and x["type"] != "parent"], key=lambda x: x["end"])
            print "master iteration, next_start_list: {}, end list: {}".format(start_list, end_list)
            i2 = 0
            while len(start_list) != 0 or len(end_list) != 0:
                starting_value = ending_value
                if len(start_list) > 0:
                    current_start_value = start_list[0]["start"]

                else:
                    print 'Running this'
                    ending_value = end_list[0]["end"]
                    if ending_value > final_end:
                        ending_value = final_end

                        local_out.append([starting_value, ending_value, [x["id"] for x in eval_data[i] if x["start"] < ending_value and x["end"] > starting_value]])
                        break

                    else:
                        current_start_value = ending_value

                if len(end_list) > 0:
                    current_end_value = end_list[0]["end"]
                    print "Comparing values, end: {} and start: {}".format(current_end_value, current_start_value)
                    if current_end_value < current_start_value:
                        ending_value = current_end_value
                        local_out.append([starting_value, ending_value, [x["id"] for x in eval_data[i] if x["start"] < ending_value and x["end"] > starting_value]])

                    else:
                        ending_value = current_start_value
                        local_out.append([starting_value, ending_value, [x["id"] for x in eval_data[i] if x["start"] < ending_value and x["end"] > starting_value]])

                else:
                    ending_value = start_list[0]["start"]
                    local_out.append([starting_value, ending_value, [x["id"] for x in eval_data[i] if x["start"] < ending_value and x["end"] > starting_value]])

                print "new ending value: {}".format(ending_value)
                start_list = sorted([x for x in eval_data[i] if x["start"] > ending_value and x["type"] != "parent"], key=lambda x: x["start"])
                end_list = sorted([x for x in eval_data[i] if x["end"] > ending_value and x["type"] != "parent"], key=lambda x: x["end"])

                print "While loop new start and end list: {}, {}".format(start_list, end_list)

            if local_out[-1][1] != final_end:
                local_out.append([local_out[-1][1], final_end, [x["id"] for x in eval_data[i] if x["start"] < final_end and x["end"] > local_out[-1][1]]])

            local_out = sorted(local_out, key=lambda x: x[0])
            for v in local_out:
                master_clip_index.append(v)

        else:
            master_clip_index.append([parent_value["start"], parent_value["end"], [parent_value["id"]]])


    print "\n\n\n"
    print "Input data: {}\n".format(time_copy)
    print "Eval data working from: {}\n".format(eval_data)
    print "Output series for mixing : {}".format(master_clip_index)

    for mix_section in master_clip_index:
        print "Computing mix section: {}".format(mix_section)
        mix_section_data = []
        start = mix_section[0]
        end = mix_section[1]
        tracks = mix_section[2]

        for track in tracks:
            print 'Computing slices for track: {}'.format(track)
            track_start = (item["start"] for item in time_copy if item["id"] == track).next()
            track_start_slice = (start - track_start) * sample_rate
            track_end_slice = (end - track_start) * sample_rate
            print 'Mix section start value: {}, end: {}'.format(start, end)
            print "Track starting value: {}".format(track_start)
            print "Starting slice: {} and ending slice: {}".format(track_start_slice, track_end_slice)
            print "In seconds, start: {} and end: {}\n".format(track_start_slice/sample_rate, track_end_slice/sample_rate)

            mix_section_data.append(data_id[track][track_start_slice:track_end_slice])

        print "Computed mix section length: {}\n".format(len(mix_section_data))
        if len(mix_section_data) > 1:
            i = 1

            while i != len(mix_section_data):
                mixed = mix_tracks(mix_section_data[i-1], mix_section_data[i], sample_rate)
                print "Length of mixed tracks: {}, {}\n".format(len(mixed), len(mixed)/sample_rate)
                out.append(mixed)
                i += 1

        else:
            print 'Length of solo track: {}, {}\n'.format(len(mix_section_data[0]), len(mix_section_data[0])/sample_rate)
            out.append(mix_section_data[0])

    out = np.array(list(itertools.chain.from_iterable(out)))
    print "Shape of output data: {}".format(out.shape)
    enablePrint()
    return out

def cut(data, sample_rate, start, end):
    """Returns cut version of input data. Cut between start and end.

    sample rate: int
    start: float start of cut in seconds
    end: float end of cut in seconds
    """
    return data[start*sample_rate:end*sample_rate]

def flanger():
    pass

def echo(data, sample_rate, strength_curve_decay, strength_curve_delay, decay_target, delay_target, 
            start_decay=None, start_delay=None, debug=True):
    """Returns np.array of data with echo effect applied

    data: input data array: np.array
    sample_rate: sample rate of input data: int
    strength_curve_decay: strength_curve of decay of effect 
    strength_curve_delay: strength_curve of delay of effect 
    decay_target: target value for decay
    delay_target: target value for delay
    start_decay: start value for decay factor for strength_curve_decay to start from
    start_delay: start value for delay factor for strength_curve_delay to start from

    If strength_curve is continous for either effect then targets for each effect will be used as parameters for effect
    If strength curve is supplied then parameters will vary between start and target with gradient of strength curve
    """
    pass

def phaser():
    pass

def reverb(data, sample_rate, strength_curve_reverberance, strength_curve_size, target_reverberance, target_strength, 
            start_reverberance=None, start_size=None, debug=True):
    """Returns np.array of data with reverberance effect applied

    data: input data array: np.array
    sample_rate:: sample rate of input data: int
    strength_curve_reverberance: strength_curve of reverberance of effect 
    strength_curve_size: strength_curve of size of effect (room scale)
    target_reverberance: target value for reverberance
    target_strength: target value for strength of effect (room scale)
    start_reverberance: start value for reverberance factor for strength_curve_reverberance to start from
    start_size: start value for strength factor for strength_curve_size to start from

    If strength_curve is continous for either effect then targets for each effect will be used as parameters for effect
    If strength curve is supplied then parameters will vary between start and target with gradient of strength curve
    """
    pass

def loop(data, n):
    """Returns input data looped n amount of times
    """
    out = np.array([])

    for _ in range(n):
        out = np.concatenate((out, data))

    return out

def pitch_shifter(chunk, shift):
    """ Pitch-Shift the given chunk by shift semi-tones. """
    freq = np.fft.rfft(chunk)
    #print "Freq: {}".format(freq)

    N = len(freq)
    shifted_freq = np.zeros(N, freq.dtype)

    S = np.round(shift if shift > 0 else N + shift, 0)
    print "S within pitch shift function: {}".format(S)
    s = N - S
    print "final s: {}".format(s)

    shifted_freq[:S] = freq[s:]
    shifted_freq[S:] = freq[:s]

    shifted_chunk = np.fft.irfft(shifted_freq)

    return shifted_chunk.astype(chunk.dtype)

def pitch(data, sample_rate, strength_curve, target, start, debug=True):
    """
    start: start pitch value in semitones
    target: target pitch value in semitones
    currently linear pitch shift is very slow - seems to work almost perfectly just very inefficient
    """
    if target < -12 or target > 12:
        raise ValueError("Target should be between -12 and 12 semitones")

    if strength_curve == "continuous":
        librosa.output.write_wav("./temp.wav", data, sample_rate)

        subprocess.call(["./rubberband","--pitch", str(target), "./temp.wav", "./changed.wav"])
        out, sr = librosa.load("./changed.wav", sr=None) 

    elif strength_curve == "linear":
        if start > target:
            change = start - target

        else:
            change = target - start

        if target < 0:
            change = -change

        out = np.array([])
        length = float(len(data) / sample_rate)
        increments = np.linspace(0, length, length*4) #Going in increments of one second seems to help with clipping sound
        chunk_size = float(change/float(len(increments)-2))
        librosa.output.write_wav("./temp.wav", data, sample_rate)

        if debug == True:
            print "Length of audio of given input: {}".format(length)
            print "Number of pitch change increment increases possible over time span: {}".format(len(increments))
            print "Timespan between each increment in seconds: {}".format(float(float(length) / float(len(increments))))
            print "Chunk size of pitch change increment: {}".format(chunk_size)  
            print "Going from: {} to: {}".format(start, target)
            print "Calculated pitch change: {}".format(change)
            print "Increments: {}".format(increments)
            print "Length of input data array: {}".format(len(data))

        test = np.array([])

        for i, n in np.ndenumerate(increments):
            i = i[0]
            if i != len(increments) -1:
                current_change = (i * chunk_size) + start
                if debug == True:
                    print "Current n: {} and next: {}. Current pitch change value: {}. Current data in: {} and out: {}".format(n, increments[i+1], current_change, 
                                                                                                                            n*sample_rate, 
                                                                                                                            increments[i+1]*sample_rate)
                subprocess.call(["./rubberband","--pitch", str(current_change), "./temp.wav", "./changed.wav"])
                data_out, sr = librosa.load("./changed.wav", sr=None) 
                frame_out = data_out[n*sample_rate:increments[i+1]*sample_rate]
                out = np.concatenate((out, frame_out))

    assert len(out) == len(data)
    return out

def tempo(data, sample_rate, strength_curve, target, start, debug=True):
    if strength_curve == "continuous":
        #Save data as WAV file to send to rubberband
        librosa.output.write_wav("./temp.wav", data, sample_rate)

        subprocess.call(["./rubberband","--tempo", str(target), "./temp.wav", "./changed.wav"])
        out, sr = librosa.load("./changed.wav", sr=None) 

    elif strength_curve == "linear":
        #This part of the algorithms is not working as when we change the temp of a frame we overlap into the next frame - this must be accounted for
        #when slicing the data from the output result
        #Try using the sox once the tempo change offset for slicing the data is computed - sox might be faster and provide just as good results
        if target == 0:
            target = 0.01

        elif start == 0:
            start = 0.01

        if start > target:
            change = start - target

        else:
            change = target - start

        out = np.array([])
        length = float(len(data) / sample_rate)
        increments = np.linspace(0, length, length*2) #Going in increments of 100ms - 50ms was too choppy - might even want to increase increments again
        chunk_size = float(change/float(len(increments)-2))
        librosa.output.write_wav("./temp.wav", data, sample_rate)
        last = 0

        if debug == True:
            print "Length of audio of given input: {}".format(length)
            print "Number of db increment increases possible over time span: {}".format(len(increments))
            print "Chunk size of tempo increase/decrease: {}".format(chunk_size)  
            print "Going from: {} to: {}".format(start, target)
            print "Calculated tempo change: {}".format(change)
            print "Increments: {}".format(increments)

        for i, n in np.ndenumerate(increments):
            i = i[0]
            if i != len(increments) -1:
                current_change = float((i * chunk_size)) + start
                if debug == True:
                    print "Current n: {} and next: {}. Current tempo change value: {}. Current data in: {} and out: {}".format(n, increments[i+1], current_change, 
                                                                                                                            n*sample_rate, 
                                                                                                                            increments[i+1]*sample_rate)

                p = subprocess.Popen(["./rubberband","--tempo", str(current_change), "./temp.wav", "./changed.wav"], stderr=subprocess.PIPE)
                command_out = p.stderr.readlines()[1]
                computed_time_change = float(re.search(r"[-+]?\d*\.\d+|\d+", command_out).group(0))

                current = n*sample_rate
                next = increments[i+1]*sample_rate

                if last == 0:
                    start_slice = n*sample_rate

                else:
                    start_slice = last

                end = last + ((increments[i+1]*sample_rate)-(n*sample_rate))*computed_time_change
                last = end

                if debug == True:
                    slice_length = end - start_slice
                    print "Current starting slice: {} and ending slice index: {} and last: {}, length of slice: {} target length: {} and computed time change: {}".format(int(start_slice), int(end), 
                                                                                                                            int(last), slice_length,
                                                                                                                            ((increments[i+1]*sample_rate)-(n*sample_rate))*computed_time_change,
                                                                                                                            computed_time_change)
                print "Out: {}".format(command_out)
                data_out, sr = librosa.load("./changed.wav", sr=None) 
                frame_out = data_out[int(start_slice):int(end)]
                out = np.concatenate((out, frame_out))
        
    #assert len(out) == len(data)
    print "Length of output data: {}".format(len(out))
    return out

def volume(data, sample_rate, strength_curve, target, start, debug=True):
    """Returns np.array of data with volume reduction applied
    
    data: input_array: np.array
    sample_rate: sample rate of input data: int
    strength_curve: strength curve of volume decrease/increase
    target: target volume ratio to reach (between 0 and 1 where 0.5 is half volume, 0.1 10% volume etc)
    start: starting volume ratio from where strength curve should begin operation - only applicable if strength curve is not continuous
    """
    if target > 1 or target < 0:
        raise ValueError("Target should be between 0 and 1")

    if strength_curve == "continuous":
        if target != 0:
            target = 10 * math.log(target, 2)

        else:
            target = -128

        fx = (
            AudioEffectsChain()
            .vol(float(target), type="dB")
        )
        out = fx(data)

    elif strength_curve == "linear":  
        #When going approaching zero we should use max level of song - im not sure exactly how this works, but if we could figure out where 0
        #Theoretical sound would be produced then rather than going from 0.01 or reaching 0.01 we will be able to reach a consistent 0 for all songs
        if target == 0:
            #Going from 0.x to 0.0
            decimal_target = 10 * math.log(0.01, 2)

            if start == 0:
                raise Exception("Target and start should be different")

            decimal_start = 10 * math.log(start, 2)
            change = decimal_target - decimal_start

        elif start == 0:
            #Going from 0.0 to x
            decimal_start = 10 * math.log(0.01, 2)

            if target == 0:
                raise Exception("Target and start should be different")

            decimal_target = 10 * math.log(target, 2)
            change = decimal_target - decimal_start

        else:
            decimal_start = 10 * math.log(start, 2)
            decimal_target = 10 * math.log(target, 2)

            if decimal_start > decimal_target:
                change = decimal_target - decimal_start

            else:   
                change = decimal_start - decimal_target

        out = np.array([])
        length = float(len(data) / sample_rate)
        increments = np.linspace(0, length, length*10) #Going in increments of 100ms - 50ms was too choppy - might even want to increase increments again
        chunk_size = float(change/float(len(increments)-2))

        if debug == True:
            print "Length of audio of given input: {}".format(length)
            print "Number of db increment increases possible over time span: {}".format(len(increments))
            print "Chunk size of db increase/decrease: {}".format(chunk_size)  
            print "Going from: {} to: {}".format(decimal_start, decimal_target)
            print "Calculated db change: {}".format(change)
            print "Increments: {}".format(increments)

        for i, n in np.ndenumerate(increments):
            i = i[0]
            if i != len(increments) -1:
                current_freq = float(((i * chunk_size) + decimal_start))
                data_frame = data[n*sample_rate:increments[i+1]*sample_rate]
                if debug == True:
                    print "Current n: {} and next: {}. Current decibal value: {}. Current data in: {} and out: {}".format(n, increments[i+1], current_freq, 
                                                                                                                            n*sample_rate, 
                                                                                                                            increments[i+1]*sample_rate)
                fx = (
                    AudioEffectsChain()
                    .vol(float(current_freq), type="dB")
                )

                frame_out = fx(data_frame)
                out = np.concatenate((out, frame_out))
        
    assert len(out) == len(data)
    return out

def gain():
    pass




