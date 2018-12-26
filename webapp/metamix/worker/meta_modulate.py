from metamix.key_variables import modulation_algorithm_parameters
from pysndfx import AudioEffectsChain
import numpy as np
import math
import os
import librosa
import subprocess
import re
import copy
import itertools

class MetaModulate():
    """
    Class for applying effects to a song in method decribed by effect object - returns song object with key: "data" containing newly modulated data
    """
    def __init__(self, song_object, debug_level):
        self.effect_data = song_object['effects']
        self.data = song_object["data"]
        self.sample_rate = float(song_object["sample_rate"])
        self.audio_start = float(song_object["song_start"])
        self.audio_end = float(song_object["song_end"])
        self.debug_level = debug_level #Level of debug to output 0-3 where 0 is none, 1 is lowest amount of debugging (most important) and 3 is all 

    def modulate(self):
        """Applies effects described by effect_data to input data and returns output - input and output as timepoint floating series

        effect_data: effect_data object 
        start: start of audio segment in seconds
        end: end of audio segment in seconds
        data: data of audio clip sliced at start:end
        sample_rate: sample_rate working from
        debug: debug flag
        """
        #Data has been sliced at starting and ending values - thus this should be accounted for when interacting with the data
        self.debug_print(1, 'Running modulate functon')
        self.debug_print(1, "Modulating data: {}".format(self.effect_data))
        for i, effect in enumerate(self.effect_data):
            self.effect_data[i]["start"] = float(float(self.effect_data[i]["start"]) - self.audio_start)
            self.effect_data[i]["end"] = float(float(self.effect_data[i]["end"]) - self.audio_start)

        end = self.audio_end - self.audio_start
        start = 0

        self.debug_print(3, "Adjusted start and end values {}, {}".format(start, end))
        self.debug_print(3, "New effect values: {}\n".format(self.effect_data))

        out = []
        eval_data = [[x] for x in self.effect_data]
        eval_copy = copy.deepcopy(self.effect_data) #THis is our moving evaluation dataset where start/end times are updated as they are found by parent effects
        #Append first section of output - this will either be a section at start where no effect is playing or nothing if effect also starts at 0 - time songs starts
        out.append(self.data[start:self.effect_data[0]["start"]*self.sample_rate])

        #Most likely need some code here which will take EQ effect (or other if needed) and split the three EQ values (high, mid, low) into three individual effects

        for i, effect in enumerate(self.effect_data):
            self.debug_print(2, "Iterating over effect: {}\n".format(effect))
            covered_children, partial_children = MetaModulate.return_overlaping_times(effect, eval_copy) #Get children completely inside audio and partially inside audio 

            for cc in covered_children:
                eval_data[i].append(copy.deepcopy(cc)) #Add covered child to current eval data item
                eval_copy.remove(cc) #Remove from future evaluations - is completely inside this and thus does not need its own evaluation
                del cc["child_type"] #Delete type so we can access eval data object by value
                eval_data.remove([cc]) #Remove from output eval data object
                self.effect_data.remove(cc) #Remove from future evaluations - anything inside or partially inside this audio segment will be caught by current audio iteration

            for pc in partial_children:
                self.debug_print(2, "Working on PC: {}".format(pc))
                cpc = copy.deepcopy(pc)
                if cpc["params"]["strength_curve"] != "continuous": #Check that strength curve is not continuous
                    cpc["params"]["original_start"] = cpc["params"]["start"] #Save original start to data object
                    cpc["params"]["original_target"] = cpc["params"]["target"] #Save original target to data object

                    new_start, new_target = MetaModulate.calculate_start_target(cpc, cpc["start"], effect["end"]) #Calculate new start and target for partial child
                    cpc["params"]["start"], cpc["params"]["target"] = new_start, new_target #New target needs to be calculated as child may only last x-2 of x total seconds and thus target parameters should be reflected across different data objects

                    self.debug_print(2, "New values for item: {}\n".format(cpc))

                eval_data[i].append(cpc) #Add partially covered child to current eval data item

                cpc = copy.deepcopy(pc) #Make copy so we can change starting time for future evaluations without changing value inside eval data object
                eval_copy[eval_copy.index(cpc)]["start"] = effect["end"] #Update starting time for evaluation dataset
                del cpc["child_type"] #Delete type so we access eval data object by value
                data_index_value = eval_data.index([cpc])
                eval_data[data_index_value][0]["params"]["start"] = new_target #Update start of partial child in output dataset to be the target value reached within this effect iteration
                eval_data[data_index_value][0]["original_start"] = eval_data[data_index_value][0]["start"]
                eval_data[data_index_value][0]["start"] = effect["end"] #Update starting time for output dataset - the first segment of this audio will be contained within current output data value - thus the next stage of data creation will only need to happen from end of current output data value
            
        eval_out = []

        #Iterate over data and check that there are no gaps between effect start/end values BETWEEN parent effect lists - if there are gaps add filler object so we can catch this when iterating over results
        #We can then append raw data with no effects applied between start/end bounds specified by the filler object
        for i, item in enumerate(eval_data):
            eval_out.append(item)
            if i + 1 != len(eval_data):
                current_end = item[0]["end"]
                next_start = eval_data[i+1][0]["start"]

                if current_end != next_start:
                    eval_out.append([{"type": "filler", "start": current_end, "end": next_start}])

        eval_data = eval_out

        for effects in eval_data:
            self.debug_print(2, "Computing: {}\n".format(effects))
            parent_effect = effects[0]
            #Check that object is not filler
            if parent_effect["type"] != "filler":
                self.debug_print(2, 'Parent effect: {}'.format(parent_effect))
                parent_start = parent_effect["start"] #Get start/end values of current effect(s) chunk
                final_end = parent_effect["end"]
                effect_params = parent_effect["params"]

                effect_params["data"] = self.data[parent_start*self.sample_rate: final_end*self.sample_rate]
                self.debug_print(2, 'Shape of data: {}'.format(effect_params["data"].shape))
                effect_params["sample_rate"] = self.sample_rate
                self.debug_print(3, "Length of parent data: {}".format(final_end-parent_start))
                self.debug_print(2, 'Starting/end values of parent (these are relative to song): {}, {}'.format(parent_start, final_end))

                #Params should contain all necassary items for effect function
                effect_data = getattr(self, parent_effect["type"])(**effect_params) #Call effect function with effect parameters passed as arguments
                self.debug_print(2, 'Shape of parent effect out data: {}'.format(effect_data.shape))
                self.debug_print(2, "\n")

                for effect in effects[1:len(effects)]: #Iterate over remaining effects in effect(s) chunk - if no more chunks nothing will iterate
                    print self.debug_print(2, 'Computing child effect: {}'.format(effect))
                    effect_start = effect["start"] - parent_start #Get effect start relative to length of parent effect
                    effect_end = effect["end"]
                    if effect_end > final_end: #Check that current effect end is not greater than parent 
                        effect_end = final_end

                    effect_end = (effect_end - parent_start) #Get effect end relative to length of parent effect
                    effect_params = effect["params"]
                    effect_params["data"] = effect_data[effect_start*self.sample_rate: effect_end*self.sample_rate]
                    self.debug_print(2, 'Shape of sliced child data: {}'.format(effect_params["data"].shape))
                    effect_params["sample_rate"] = self.sample_rate

                    self.debug_print(2, "effect will run between: {} and {} (these are relative to result from parent effect)".format(effect_start, effect_end))

                    child_effect_data = getattr(self, effect["type"])(**effect_params)
                    self.debug_print(2, "Shape of child effect ouput data: {}".format(child_effect_data.shape))

                    effect_data_ = np.concatenate((effect_data[0:effect_start*self.sample_rate], child_effect_data))
                    effect_data = np.concatenate((effect_data_, effect_data[effect_end*self.sample_rate:final_end*self.sample_rate]))
                    self.debug_print(2, "Effect concatenated data: {}".format(effect_data.shape))

            else:
                effect_data = self.data[parent_effect["start"]*self.sample_rate: parent_effect["end"]*self.sample_rate]

            #Add effect data of given effect object(s) to output data
            out.append(effect_data)
            self.debug_print(1, "\n")

        out = np.array(list(itertools.chain.from_iterable(out)))
        out_shape = out.shape[0]
        data_shape = self.data.shape[0]

        if len(out) != data_shape:
            out = np.concatenate((out, self.data[out_shape: data_shape]))

        out_shape = out.shape[0]
        self.debug_print(1, "Input data: {}".format(data_shape))
        self.debug_print(1, "Final computed data: {}".format(out_shape))

        return out

    #Util methods
    def debug_print(self, debug_value, value):
        if self.debug_level != 0:
            if self.debug_level >= debug_value:
                print value

            else:
                pass

    @staticmethod
    def return_overlaping_times(current, checks):
        """Returns two lists: children which fall completely inside current, children which fall partially inside current value"""
        #Lets turn this code into nice one line iterations and move type key/value pairs as they are most likley not useful at all
        complete_coverage = []
        partial_coverage = []

        for check in checks:
            if check["id"] != current["id"]:
                #print "Evaluating value: {} against: {}".format(check, current)

                if check["start"] >= current["start"] and check["end"] <= current["end"]:
                    check["child_type"] = "child_covered"
                    complete_coverage.append(check)

                elif check["start"] >= current["start"] and check["end"] > current["end"] and check["start"] < current["end"]:
                    check["child_type"] = "child_partial"
                    partial_coverage.append(check)   

        return complete_coverage, partial_coverage 

    @staticmethod
    def standard_incrementation(start_timestamp, end_timestamp, effect_start, effect_target, effect_type, non_zero=False):
        incrementation_factor = next((item for item in modulation_algorithm_parameters if item['type'] == effect_type), None)["increment_time_change"]
        if non_zero == True:
            if effect_target == 0:
                effect_target = 0.01

            elif effect_target == 0:
                effect_target = 0.01

        if effect_start > effect_target:
            change = effect_start - effect_target

        else:
            change = effect_target - effect_start

        if effect_target < 0:
            change = -change

        #Apply EQ to data with linear increase in gain until target is reached
        length = float(end_timestamp) #Get length in seconds of input data
        #Calculate number of increments possible over data timespan (change currently happens per second as 100ms introduced quality issues)
        increments = np.linspace(0, length, length*incrementation_factor)
        chunk_size = float(change/float(len(increments)-2))

        return length, increments, chunk_size

    @staticmethod
    def decibel_incrementation(start_timestamp, end_timestamp, effect_start, effect_target, effect_type, return_decimal_start_end=False):
        incrementation_factor = next((item for item in modulation_algorithm_parameters if item['type'] == effect_type), None)["increment_time_change"]
        if effect_target == 0:
            #Going from 0.x to 0.0
            decimal_target = 10 * math.log(0.01, 2)

            if start == 0:
                raise Exception("Target and start should be different")

            decimal_start = 10 * math.log(effect_start, 2)
            change = decimal_target - decimal_start

        elif effect_start == 0:
            #Going from 0.0 to x
            decimal_start = 10 * math.log(0.01, 2)

            if target == 0:
                raise Exception("Target and start should be different")

            decimal_target = 10 * math.log(effect_target, 2)
            change = decimal_target - decimal_start

        else:
            decimal_start = 10 * math.log(effect_start, 2)
            decimal_target = 10 * math.log(effect_target, 2)

            if decimal_start > decimal_target:
                change = decimal_start - decimal_target

            else:   
                change = decimal_target - decimal_start

            if decimal_target < 0:
                change = -change

        print "Calculate decibel change: {}".format(change)
        length = float(end_timestamp)
        increments = np.linspace(0, length, length*incrementation_factor) 
        chunk_size = float(change/float(len(increments)-2))

        if return_decimal_start_end == True:
            return length, increments, chunk_size, decimal_start, decimal_target

        else:
            return length, increments, chunk_size

    @staticmethod
    def filter_incrementation(start_timestamp, end_timestamp, effect_start, effect_target, effect_type):
        incrementation_factor = next((item for item in modulation_algorithm_parameters if item['type'] == effect_type), None)["increment_time_change"]
        freq_change = effect_target - effect_start
        length = float(end_timestamp)

        #Calculate number of increments possible over data timespan (change currently happens per second as 100ms introduced quality issues)
        increments = np.linspace(0, length, length*incrementation_factor)
        chunk_size = float(freq_change/float(len(increments)-2))

        return length, increments, chunk_size

    @staticmethod
    def calculate_start_target(effect, start_timestamp, end_timestamp):
        """Calculates start/target values for effects (w/strength_curve != continuous) given effect object - also accepts start_timestamp/end_timestamp 
        these paraters will slice the increments and figure out the start/target values for given timestamps

        Function can be used to figure out start/target values for partially covered effects

        Will have to ensure effects which work on entire data segment and then slice results still work correctly
        Input:
            effect: effect object
            start_timestamp: starting timestamp of effect start/target computation - timestamps are used for getting start/target values of partials of effect data
            end_timestamp: ending timestamp of effect start/target computation  - for standard start/target generation use start/end timestamps of effect
        """
        #EQ & PITCH CODE = standard incrementation generation
        #TEMPO CODE = standard incrementation generation w/non zero change
        #VOLUME CODE = decibel incrementation
        #FILTER CODE = filter incrementation
        #Likely more changes to incrementation functions and code below will have to be made as we add more algorithms with multiple possible params (start,target,curve)
        effect_time_start = effect["start"]
        effect_time_end = effect["end"]    

        if start_timestamp == effect_time_start and end_timestamp == effect_time_end:
            return effect["params"]["start"], effect["params"]["target"] #Start/end timestamp is the same as the original effect values - thus start/end will be the same 

        start_timestamp = start_timestamp - effect_time_start
        end_timestamp = end_timestamp - effect_time_start

        effect_type = effect["type"]
        effect_start = effect["params"]["start"]
        effect_target = effect["params"]["target"]

        if effect_type in ["pitch"]:
            length, increments, chunk_size = MetaModulate.standard_incrementation(effect_time_start, effect_time_end, 
                                                                                  effect_start, effect_target, 
                                                                                  effect_type)

        elif effect_type in ["eq"] and effect_start != None and effect_target != None:
            length, increments, chunk_size = MetaModulate.decibel_incrementation(0, float(len(data) / sample_rate), 
                                                                        start_decibel, target_decibel, "eq")

        elif effect_type in ["eq"] and "start_decibel" in effect["params"] and "target_decibel" in effect["params"]:
            effect_start = effect["params"]["start_decibel"]
            effect_target = effect["params"]["target_decibel"]

            length, increments, chunk_size = MetaModulate.standard_incrementation(effect_time_start, effect_time_end, 
                                                                                  effect_start, effect_target, 
                                                                                  effect_type) 

        elif effect_type in ["tempo"]:
            length, increments, chunk_size = MetaModulate.standard_incrementation(effect_time_start, effect_time_end, 
                                                                                  effect_start, effect_target, 
                                                                                  effect_type, True)

        elif effect_type in ["volume"]:
            length, increments, chunk_size = MetaModulate.decibel_incrementation(effect_time_start, effect_time_end, 
                                                                                 effect_start, effect_target, 
                                                                                 effect_type)

        elif effect_type in ["high_pass_filter", "low_pass_filter"]:
            length, increments, chunk_size = MetaModulate.filter_incrementation(effect_time_start, effect_time_end, 
                                                                                effect_start, effect_target, 
                                                                                effect_type)


        start, target = (np.abs(increments - start_timestamp)).argmin(), (np.abs(increments - end_timestamp)).argmin()

        return (start*chunk_size) + effect_start, (target*chunk_size) + effect_start

    #Effect methods
    def eq(self, data, sample_rate, strength_curve, frequency, target=None, start=None, target_decibel=None, start_decibel=None, width_q=1.0):
        """Adds EQ to input data. 
        From frequency to width_q, with gain of target, strength curve can also be applied to manipulate onset of gain until target reach
        
        sample_rate: int
        strength_curve: continuous, linear, quater, half, exponential (str)
        start: ratio of EQ to be applied to song: 0 -> 2
        target: ratio of EQ to abblied to song: 0 -> 2
        start_decibel: starting value of eq in decibels
        target_decibel: target value of eq in decibels
        frequency: frequency in HZ of center of eq (int)
        width_q: width of eq band (float)

        Returns: numpy array of time float point series with given EQ applied (np.array)
        """
        self.debug_print(1, "Running EQ function")

        if strength_curve == "continuous":
            #Apply EQ with same gain to entire spectrum of data
            if target == None:
                target = target_decibel

            elif target_decibel == None:
                target = 10 * math.log(target, 2)

            else:
                raise ValueError("Must either supply target decibel or target")

            self.debug_print(2, "Running continous EQ at decibal target: {}".format(target))
            fx = (
                AudioEffectsChain()
                .equalizer(frequency, width_q, target)
            )
            out = fx(data)

        elif strength_curve == "linear":
            if target != None and start != None:
                self.debug_print(1, "Running decibal incrementation")
                length, increments, chunk_size, start, target = MetaModulate.decibel_incrementation(0, float(len(data)) / float(sample_rate), 
                                                                                        start, target, "eq", 
                                                                                        return_decimal_start_end=True)


            elif target_decibel != None and start_decibel != None:
                self.debug_print(1, "Running decibal incrementation")
                length, increments, chunk_size = MetaModulate.standard_incrementation(0, float(len(data)) / float(sample_rate), 
                                             start_decibel, target_decibel, 
                                             "eq")
            else:
                raise ValueError("Must either supply decibel start/target or normal start/target")

            #Apply EQ to data with linear increase in gain until target is reached
            out = np.array([])

            if self.debug_level == 2:
                print "Length of audio of given input: {}".format(length)
                print "Number of gain increment increases possible over time span: {}".format(len(increments))
                print "Timespan between each increment in seconds: {}".format(float(float(length) / float(len(increments))))
                print "Chunk size of gain increase/decrease: {}".format(chunk_size)
                print "Going between {} and {}".format(start, target)

            for i, n in np.ndenumerate(increments):
                i = i[0]
                if i != len(increments) -1:
                    chunk = (i * chunk_size) + start
                    fx = (
                        AudioEffectsChain()
                        .equalizer(frequency, width_q, chunk)
                    )

                    frame_out = fx(data)
                    frame_out = frame_out[n*sample_rate:increments[i+1]*sample_rate]
                    out = np.concatenate((out, frame_out))

        self.debug_print(1, "\n")
        #Ensure no frames of data were lost or added during EQ
        assert len(out) == len(data)
        return out

    #Upper and lowerbound in HZ
    def high_pass_filter(self, data, sample_rate, strength_curve, target, start, upper_bound=15000, lower_bound=20):
        """
        Will attenuate all frequencies > than target and pass all frequencies < target
        target can only be between upper and lower bounds

        strength curve will alter freq of filter between lower bound and target
        if start is specified strength curve will alter filter frequency between start -> target
        """
        self.debug_print(1, "Running high pass filter")

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
            length, increments, chunk_size = MetaModulate.filter_incrementation(0, float(len(data)) / float(sample_rate), 
                                                        start, target, 
                                                        "high_pass_filter")

            if self.debug_level == 2:
                print "Length of audio of given input: {}".format(length)
                print "Number of gain increment increases possible over time span: {}".format(len(increments))
                print "Timespan between each increment in seconds: {}".format(float(float(length) / float(len(increments))))
                print "Chunk size of gain increase/decrease: {}".format(chunk_size)  
                print "Going from: {} to: {}".format(floor, target)
                print "Calculated frequency change: {}".format(freq_change)

            for i, n in np.ndenumerate(increments):
                i = i[0]
                if i != len(increments) -1:
                    current_freq = float(((i * chunk_size) + start))
                    data_frame = data[n*sample_rate:increments[i+1]*sample_rate]
                    fx = (
                        AudioEffectsChain()
                        .highpass(current_freq)
                    )

                    frame_out = fx(data_frame)
                    out = np.concatenate((out, frame_out))

        #Ensure no frames of data were lost or added during EQ
        self.debug_level(1, "\n")
        assert len(out) == len(data)
        return out

    #Upper and lower bound in HZ
    def low_pass_filter(self, data, sample_rate, strength_curve, target, start, upper_bound=20, lower_bound=15000):
        """
        Will attenuate all frequencies < than target and pass all frequencies > target
        target can only operate between upper and lower bounds 

        strength curve will alter freq of filter between lower bound and target 
        if start is specified strength curve will alter filter frequency between start -> target
        """
        self.debug_print(1, "Running low pass filter")
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
            length, increments, chunk_size = MetaModulate.filter_incrementation(0, float(float(len(data)) / float(sample_rate)), 
                                                        start, target, 
                                                        "low_pass_filter")


            if self.debug_level == 2:
                print "Length of audio of given input: {}".format(length)
                print "Number of gain increment increases possible over time span: {}".format(len(increments))
                print "Timespan between each increment in seconds: {}".format(float(float(length) / float(len(increments))))
                print "Chunk size of gain increase/decrease: {}".format(chunk_size)
                print "Going from: {} to: {}".format(floor, target)
                print "Calculated frequency change: {}".format(freq_change)

            for i, n in np.ndenumerate(increments):
                i = i[0]
                if i != len(increments) -1:
                    current_freq = float((start - (i  * chunk_size)))
                    data_frame = data[n*sample_rate:increments[i+1]*sample_rate]

                    fx = (
                        AudioEffectsChain()
                        .lowpass(current_freq)
                    )

                    frame_out = fx(data_frame)
                    out = np.concatenate((out, frame_out))

        #Ensure no frames of data were lost or added during EQ
        self.debug_print(1, "\n")
        assert len(out) == len(data)
        return out

    def loop(self, data, n):
        """Returns input data looped n amount of times
        """
        self.debug_print(1, "Running loop function")
        out = np.array([])

        for _ in range(n):
            out = np.concatenate((out, data))

        self.debug(1, "\n")
        return out

    def pitch(self, data, sample_rate, strength_curve, target, start):
        """
        start: start pitch value in semitones
        target: target pitch value in semitones
        currently linear pitch shift is very slow - seems to work almost perfectly just very inefficient
        """
        self.debug_print(1, "Running pitch function")

        if target < -12 or target > 12:
            raise ValueError("Target should be between -12 and 12 semitones")

        if strength_curve == "continuous":
            librosa.output.write_wav("./temp.wav", data, sample_rate)

            subprocess.call(["./rubberband","--pitch", str(target), "./temp.wav", "./changed.wav"])
            out, sr = librosa.load("./changed.wav", sr=None) 

        elif strength_curve == "linear":
            length, increments, chunk_size = MetaModulate.standard_incrementation(0, float(float(len(data)) / float(sample_rate)), 
                                                                     start, target, 
                                                                     "pitch")

            out = np.array([])
            librosa.output.write_wav("./temp.wav", data, sample_rate)

            if self.debug_level == 2:
                print "Length of audio of given input: {}".format(length)
                print "Number of pitch change increment increases possible over time span: {}".format(len(increments))
                print "Timespan between each increment in seconds: {}".format(float(float(length) / float(len(increments))))
                print "Chunk size of pitch change increment: {}".format(chunk_size)  
                print "Going from: {} to: {}".format(start, target)
                print "Calculated pitch change: {}".format(change)
                print "Length of input data array: {}".format(len(data))

            for i, n in np.ndenumerate(increments):
                i = i[0]
                if i != len(increments) -1:
                    current_change = (i * chunk_size) + start

                    subprocess.call(["./rubberband","--pitch", str(current_change), "./temp.wav", "./changed.wav"])
                    data_out, sr = librosa.load("./changed.wav", sr=None) 
                    frame_out = data_out[n*sample_rate:increments[i+1]*sample_rate]
                    out = np.concatenate((out, frame_out))

        self.debug_print(1, "\n")
        assert len(out) == len(data)
        return out

    def tempo(self, data, sample_rate, strength_curve, target, start):
        self.debug_print(1, "Running tempo function")
        if strength_curve == "continuous":
            #Save data as WAV file to send to rubberband
            librosa.output.write_wav("./temp.wav", data, sample_rate)

            subprocess.call(["./rubberband","--tempo", str(target), "./temp.wav", "./changed.wav"])
            out, sr = librosa.load("./changed.wav", sr=None) 

        elif strength_curve == "linear":
            #This part of the algorithms is not working as when we change the temp of a frame we overlap into the next frame - this must be accounted for
            #when slicing the data from the output result
            #Try using the sox once the tempo change offset for slicing the data is computed - sox might be faster and provide just as good results
            length, increments, chunk_size = MetaModulate.standard_incrementation(0, float(float(len(data)) / float(sample_rate)), 
                                                                     start, target, 
                                                                     "tempo", True)

            out = np.array([])
            librosa.output.write_wav("./temp.wav", data, sample_rate)
            last = 0

            if self.debug_level == 2:
                print "Length of audio of given input: {}".format(length)
                print "Number of db increment increases possible over time span: {}".format(len(increments))
                print "Chunk size of tempo increase/decrease: {}".format(chunk_size)  
                print "Going from: {} to: {}".format(start, target)
                print "Calculated tempo change: {}".format(change)

            for i, n in np.ndenumerate(increments):
                i = i[0]
                if i != len(increments) -1:
                    current_change = float((i * chunk_size)) + start

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

                    data_out, sr = librosa.load("./changed.wav", sr=None) 
                    frame_out = data_out[int(start_slice):int(end)]
                    out = np.concatenate((out, frame_out))
            
        #assert len(out) == len(data)
        self.debug_print(1, "\n")
        print "Length of output data: {}".format(len(out))
        return out

    def volume(self, data, sample_rate, strength_curve, target, start):
        """Returns np.array of data with volume reduction applied
        
        data: input_array: np.array
        sample_rate: sample rate of input data: int
        strength_curve: strength curve of volume decrease/increase
        target: target volume ratio to reach (between 0 and 1 where 0.5 is half volume, 0.1 10% volume etc)
        start: starting volume ratio from where strength curve should begin operation - only applicable if strength curve is not continuous
        """
        self.debug_print(1, "Running volume function")
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
            length, increments, chunk_size, decimal_start, decimal_target = MetaModulate.decibel_incrementation(0, float(float(len(data)) / float(sample_rate)), 
                                                                                                                start, target, "volume", 
                                                                                                                return_decimal_start_end=True)

            out = np.array([])

            if self.debug_level == 2:
                print "Length of audio of given input: {}".format(length)
                print "Number of db increment increases possible over time span: {}".format(len(increments))
                print "Chunk size of db increase/decrease: {}".format(chunk_size)  
                print "Going from: {} to: {}".format(decimal_start, decimal_target)
                print "Calculated db change: {}".format(decimal_target - decimal_start)

            for i, n in np.ndenumerate(increments):
                i = i[0]
                if i != len(increments) -1:
                    current_freq = float(((i * chunk_size) + decimal_start))
                    data_frame = data[n*sample_rate:increments[i+1]*sample_rate]

                    fx = (
                        AudioEffectsChain()
                        .vol(float(current_freq), type="dB")
                    )

                    frame_out = fx(data_frame)
                    out = np.concatenate((out, frame_out))
        
        self.debug_print(1, "\n")
        assert len(out) == len(data)
        return out

    def gain(self):
        raise NotImplementedError

    def flanger(self):
        raise NotImplementedError

    def echo(self, data, sample_rate, strength_curve, strength_curve_2, target, target_2, start, start_2):
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
        strength_curve_decay = strength_curve
        strength_curve_delay = strength_curve_2
        decay_target = target
        delay_target = target_2
        start_decay = start
        start_delay = start_2
        raise NotImplementedError

    def phaser(self):
        raise NotImplementedError

    def reverb(self, data, sample_rate, strength_curve, strength_curve_2, target, target_2, start, start_2): 
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
        strength_curve_reverberance = strength_curve
        strength_curve_size = strength_curve_2
        target_reverberance = target
        target_size = target_2
        start_reverberance = start
        start_size
        raise NotImplementedError