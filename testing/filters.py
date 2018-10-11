from librosa import load
from pysndfx import AudioEffectsChain
import numpy as np

"""
TODO

Figure out why algorithms are not going to their target or upper/lower bound
Seem to be two increments away from target level - I suppose this is also happening on the EQ function
"""

#Upper and lowerbound in HZ
def high_pass_filter(data, sample_rate, strength_curve, target, upper_bound=15000, lower_bound=20, debug=True, start=None):
    """
    Will attenuate all frequencies > than target and pass all frequencies < target
    target can only be between upper and lower bounds

    strength curve will alter freq of filter between lower bound and target
    if start is specified strength curve will alter filter frequency between start -> target
    """
    if target < lower_bound or target > upper_bound:
        raise ValueError("Target must be between upper and lower bounds")

    if strength_curve == "continuous":
        fx = (
            AudioEffectsChain()
            .highpass(float(target))
        )
        out = fx(data)

    elif strength_curve == "linear":
        out = np.array([])
        length = float(len(data) / sample_rate) #Get length in seconds of input data
        if start != None:
            freq_change = target - start
            floor = start

        else:
            freq_change = target - lower_bound
            floor = lower_bound
        #Calculate number of increments possible over data timespan (change currently happens per second as 100ms introduced quality issues)
        increments = np.linspace(0, length, length*5)
        chunk_size = float(freq_change/float(len(increments)-2))

        if debug == True:
            print "Length of audio of given input: {}".format(length)
            print "Number of gain increment increases possible over time span: {}".format(len(increments))
            print "Timespan between each increment in seconds: {}".format(float(float(length) / float(len(increments))))
            print "Chunk size of gain increase/decrease: {}".format(chunk_size)  
            print "Going from: {} to: {}".format(floor, target)
            print "Calculated frequency change: {}".format(freq_change)

        for i, n in np.ndenumerate(increments):
            i = i[0]
            if i != len(increments) -1:
                current_freq = float(((i * chunk_size) + floor))
                data_frame = data[n*sample_rate:increments[i+1]*sample_rate]
                if debug == True:
                    print "Current n: {} and next: {}. Current frequency value: {}. Current data in: {} and out: {}".format(n, increments[i+1], current_freq, 
                                                                                                                            n*sample_rate, 
                                                                                                                            increments[i+1]*sample_rate)
                fx = (
                    AudioEffectsChain()
                    .highpass(current_freq)
                )

                frame_out = fx(data_frame)
                out = np.concatenate((out, frame_out))

    #Ensure no frames of data were lost or added during EQ
    assert len(out) == len(data)
    return out

#Upper and lower bound in HZ
def low_pass_filter(data, sample_rate, strength_curve, target, upper_bound=20, lower_bound=15000, debug=True, start=None):
    """
    Will attenuate all frequencies < than target and pass all frequencies > target
    target can only operate between upper and lower bounds 

    strength curve will alter freq of filter between lower bound and target 
    if start is specified strength curve will alter filter frequency between start -> target
    """
    if target > lower_bound or target < upper_bound:
        raise ValueError("Target must be between upper and lower bounds")

    if strength_curve == "continuous":
        fx = (
            AudioEffectsChain()
            .lowpass(float(target))
        )
        out = fx(data)

    elif strength_curve == "linear":
        out = np.array([])
        length = float(len(data) / sample_rate) #Get length in seconds of input data
        if start != None:
            freq_change = target - start
            floor = start

        else:
            freq_change = lower_bound - target
            floor = lower_bound

        #Calculate number of increments possible over data timespan (change currently happens per second as 100ms introduced quality issues)
        increments = np.linspace(0, length, length*5)
        chunk_size = float(freq_change/float(len(increments)-2))

        if debug == True:
            print "Length of audio of given input: {}".format(length)
            print "Number of gain increment increases possible over time span: {}".format(len(increments))
            print "Timespan between each increment in seconds: {}".format(float(float(length) / float(len(increments))))
            print "Chunk size of gain increase/decrease: {}".format(chunk_size)
            print "Going from: {} to: {}".format(floor, target)
            print "Calculated frequency change: {}".format(freq_change)

        for i, n in np.ndenumerate(increments):
            i = i[0]
            if i != len(increments) -1:
                current_freq = float((floor - (i  * chunk_size)))
                data_frame = data[n*sample_rate:increments[i+1]*sample_rate]
                if debug == True:
                    print "Current n: {} and next: {}. Current frequency value: {}. Current data in: {} and out: {}. Current index: {}".format(n, increments[i+1], current_freq, 
                                                                                                                            n*sample_rate, 
                                                                                                                            increments[i+1]*sample_rate, i)
                fx = (
                    AudioEffectsChain()
                    .lowpass(current_freq)
                )

                frame_out = fx(data_frame)
                out = np.concatenate((out, frame_out))

    #Ensure no frames of data were lost or added during EQ
    assert len(out) == len(data)
    return out
