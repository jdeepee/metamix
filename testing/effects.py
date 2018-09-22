from librosa import load
from pysndfx import AudioEffectsChain
import numpy as np
import math

#import essentia

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
"""

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

def pitch():
    pass

def tempo():
    pass

def volume(data, sample_rate, strength_curve, target, start, debug=True):
    """Returns np.array of data with volume reduction applied
    
    data: input_array: np.array
    sample_rate: sample rate of input data: int
    strength_curve: strength curve of volume decrease/increase
    target: target volume ratio to reach (between 0 and 1 where 0.5 is half volume, 0.1 10% volume etc)
    start: starting volume ratio from where strength curve should begin operation - only applicable if strength curve is not continuous
    """
    if target > 1 or target < 0:
        raise Exception("Target should be between 0 and 1")

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


