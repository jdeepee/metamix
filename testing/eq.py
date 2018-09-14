from librosa import load
from pysndfx import AudioEffectsChain
import numpy as np

"""
Notes:
No idea what Q does in result - default is 1 - lets see how this effects things

EQ low freq: 200
EQ mid: 1700
EQ high: 6500

Currently I do not know how gain relates to volume and taking something to 0 or to max gain with out "clipping"?

for linear algorithms after target has been reached it the rest of the data must then mantain the reached value until changed otherwise
"""

#For this function rather than splitting data into individual miliseconds and then running EQ computation on each chunk
#We run the EQ computation on the whole piece of data and then slice from resulting data the milisecond we care about
#Append all results to array and then we have our section of gradual increase
"""
We can perhaps increase the effeciency of this by using the same methods as the first linear algo function but instead of classifying for 100ms
or for the whole data segment - we can add 5 seconds of padding data around the section we care about and then extract the section we want from
the result of this segment
"""
def equalizer_cm(data, sample_rate, strength_curve, target, frequency, width_q=1.0, debug=True):
    """Adds EQ to input data. 
    From frequency to width_q, with gain of target, strength curve can also be applied to manipulate onset of gain until target reach
    
    sample_rate: int
    strength_curve: continuous, linear, quater, half, exponential (str)
    target: decibal value of target gain to reach (float) 
    frequency: frequency in HZ of center of eq (int)
    width_q: width of eq band (float)

    Returns: numpy array of time float point series with given EQ applied (np.array)
    """
    assert type(sample_rate) == int
    assert type(data) == np.ndarray
    assert type(strength_curve) == str 
    assert type(target) == float
    assert type(frequency) == int
    assert type(width_q) == float

    if strength_curve == "continuous":
        #Apply EQ with same gain to entire spectrum of data
        fx = (
            AudioEffectsChain()
            .equalizer(frequency, width_q, target)
        )
        out = fx(data)

    elif strength_curve == "linear":
        #Apply EQ to data with linear increase in gain until target is reached
        out = np.array([])
        length = float(len(data) / sample_rate) #Get length in seconds of input data
        #Calculate number of increments possible over data timespan (change currently happens per second as 100ms introduced quality issues)
        increments = np.linspace(0, length, length*5)
        chunk_size = float(target/float(len(increments)))

        if debug == True:
            print "Length of audio of given input: {}".format(length)
            print "Number of gain increment increases possible over time span: {}".format(len(increments))
            print "Chunk size of gain increase/decrease: {}".format(chunk_size)

        for i, n in np.ndenumerate(increments):
            i = i[0]
            if i != len(increments) -1:
                chunk = i * chunk_size
                print "Current n: {} and next: {}. Current EQ gain size: {}".format(n, increments[i+1], chunk)
                #data_frame = data[n*sample_rate:increments[i+1]*sample_rate]

                fx = (
                    AudioEffectsChain()
                    .equalizer(frequency, width_q, chunk)
                )

                frame_out = fx(data)
                frame_out = frame_out[n*sample_rate:increments[i+1]*sample_rate]
                out = np.concatenate((out, frame_out))

    #Ensure no frames of data were lost or added during EQ
    assert len(out) == len(data)
    return out


def equalizer(data, sample_rate, strength_curve, target, frequency, width_q=1.0, debug=True):
    """Adds EQ to input data. 
    From frequency to width_q, with gain of target, strength curve can also be applied to manipulate onset of gain until target reach
    
    sample_rate: int
    strength_curve: continuous, linear, quater, half, exponential (str)
    target: decibal value of target gain to reach (float) 
    frequency: frequency in HZ of center of eq (int)
    width_q: width of eq band (float)

    Returns: numpy array of time float point series with given EQ applied (np.array)
    """
    assert type(sample_rate) == int
    assert type(data) == np.ndarray
    assert type(strength_curve) == str 
    assert type(target) == float
    assert type(frequency) == int
    assert type(width_q) == float

    if strength_curve == "continuous":
        #Apply EQ with same gain to entire spectrum of data
        fx = (
            AudioEffectsChain()
            .equalizer(frequency, width_q, target)
        )
        out = fx(data)

    elif strength_curve == "linear":
        #Apply EQ to data with linear increase in gain until target is reached
        out = np.array([])
        length = float(len(data) / sample_rate) #Get length in seconds of input data
        #Calculate number of increments possible over data timespan (change currently happens per second as 100ms introduced quality issues)
        increments = np.linspace(0, length, length)
        chunk_size = float(target/float(len(increments)))

        if debug == True:
            print "Length of audio of given input: {}".format(length)
            print "Number of gain increment increases possible over time span: {}".format(len(increments))
            print "Chunk size of gain increase/decrease: {}".format(chunk_size)

        for i, n in np.ndenumerate(increments):
            i = i[0]
            if i != len(increments) -1:
                chunk = i * chunk_size
                data_frame = data[n*sample_rate:increments[i+1]*sample_rate]
                print "Current n: {} and next: {}. Current EQ gain size: {}. Current data in: {} and out: {}".format(n, increments[i+1], chunk, 
                                                                                                                        n*sample_rate, 
                                                                                                                        increments[i+1]*sample_rate)

                fx = (
                    AudioEffectsChain()
                    .equalizer(frequency, width_q, chunk)
                )

                frame_out = fx(data_frame)
                out = np.concatenate((out, frame_out))

    #Ensure no frames of data were lost or added during EQ
    assert len(out) == len(data)
    return out
