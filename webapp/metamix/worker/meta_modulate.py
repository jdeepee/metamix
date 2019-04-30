from metamix.key_variables import modulation_algorithm_parameters
from metamix.utils.analysis import create_waveform, compute_bar_markers
from metamix.utils.general import delete_s3
from pysndfx import AudioEffectsChain
from flask import *
import numpy as np
import math
import os
import librosa
import subprocess
import re
import copy
import itertools
import uuid

class MetaModulate():
    """
    Class for applying effects to a song in method decribed by effect object - returns song object with key: "data" containing newly modulated data
    """
    def __init__(self, song_object, debug_level, effect_data):
        self.effect_data = effect_data
        self.data = song_object["data"]
        self.bpm = song_object["bpm"]
        self.audio_object = song_object
        self.sample_rate = float(song_object["sample_rate"])
        self.audio_start = float(song_object["song_start"])
        self.audio_end = float(song_object["song_end"])
        self.debug_level = debug_level #Level of debug to output 0-3 where 0 is none, 1 is lowest amount of debugging (most important) and 3 is all 
        self.sample_rate = 44100

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
        self.order_effects()
        self.debug_print(3, "Modulating original data:\n {}".format(self.effect_data))

        for i, effect in enumerate(self.effect_data):
            self.effect_data[i]["start"] = float(float(self.effect_data[i]["start"]) - self.audio_start)
            self.effect_data[i]["end"] = float(float(self.effect_data[i]["end"]) - self.audio_start)

        end = self.audio_end - self.audio_start
        start = 0

        self.debug_print(3, "Adjusted start and end values {}, {}".format(start, end))

        out = []
        eval_data = [[x] for x in self.effect_data]
        eval_copy = copy.deepcopy(self.effect_data) #THis is our moving evaluation dataset where start/end times are updated as they are found by parent effects
        #Append first section of output - this will either be a section at start where no effect is playing or nothing if effect also starts at 0 - time songs starts
        out.append(self.data[start:int(round(self.effect_data[0]["start"]*self.sample_rate))])

        #Most likely need some code here which will take EQ effect (or other if needed) and split the three EQ values (high, mid, low) into three individual effects

        for i, effect in enumerate(self.effect_data):
            if effect["type"] == "tempo":
                recompute_barmarkers = True
                recompute_waveform = True

            elif effect["type"] == "pitch":
                update_key = True

            self.debug_print(2, "Iterating over effect: {}\n".format(effect))
            covered_children, partial_children = self.return_overlaping_times(effect, eval_copy) #Get children completely inside audio and partially inside audio 
            print "Covered children: {} and partial: {}".format(covered_children, partial_children)

            for cc in covered_children:
                eval_data[i].append(copy.deepcopy(cc)) #Add covered child to current eval data item
                eval_copy.remove(cc) #Remove from future evaluations - is completely inside this and thus does not need its own evaluation
                del cc["child_type"] #Delete type so we can access eval data object by value
                eval_data.remove([cc]) #Remove from output eval data object
                self.effect_data.remove(cc) #Remove from future evaluations - anything inside or partially inside this audio segment will be caught by current audio iteration

            for pc in partial_children:
                self.debug_print(2, "Working on PC: {}".format(pc))
                cpc = copy.deepcopy(pc)
                new_target = cpc["effectStart"]
                if cpc["strength_curve"] != "continuous": #Check that strength curve is not continuous
                    cpc["original_start"] = cpc["effectStart"] #Save original start to data object
                    cpc["original_target"] = cpc["effectTarget"] #Save original target to data object

                    new_start, new_target = self.calculate_start_target(cpc, cpc["start"], effect["end"]) #Calculate new start and target for partial child
                    cpc["effectStart"], cpc["effectTarget"] = new_start, new_target #New target needs to be calculated as child may only last x-2 of x total seconds and thus target parameters should be reflected across different data objects

                    self.debug_print(2, "New values for item: {}\n".format(cpc))

                eval_data[i].append(cpc) #Add partially covered child to current eval data item

                cpc = copy.deepcopy(pc) #Make copy so we can change starting time for future evaluations without changing value inside eval data object
                eval_copy[eval_copy.index(cpc)]["start"] = effect["end"] #Update starting time for evaluation dataset
                del cpc["child_type"] #Delete type so we access eval data object by value
                data_index_value = eval_data.index([cpc])
                eval_data[data_index_value][0]["effectStart"] = new_target #Update start of partial child in output dataset to be the target value reached within this effect iteration
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

        print "\n final data for evaluation: {}".format(eval_data)

        for effects in eval_data:
            self.debug_print(2, "Computing: {}\n".format(effects))
            parent_effect = effects[0]
            #Check that object is not filler
            if parent_effect["type"] != "filler":
                self.debug_print(2, 'Parent effect: {}'.format(parent_effect))
                parent_start = parent_effect["start"] #Get start/end values of current effect(s) chunk
                final_end = parent_effect["end"]
                effect_params, type = self.build_effect_parameters(parent_effect, parent_start, final_end, None, False)

                self.debug_print(3, "Length of parent data: {}".format(final_end-parent_start))
                self.debug_print(2, 'Starting/end values of parent (these are relative to song): {}, {}'.format(parent_start, final_end))

                #Params should contain all necassary items for effect function
                effect_data = getattr(self, type)(**effect_params) #Call effect function with effect parameters passed as arguments
                self.debug_print(2, 'Shape of parent effect out data: {}'.format(effect_data.shape))
                self.debug_print(2, "\n")

                for effect in effects[1:len(effects)]: #Iterate over remaining effects in effect(s) chunk - if no more chunks nothing will iterate
                    print self.debug_print(2, 'Computing child effect: {}'.format(effect))
                    effect_start = effect["start"] - parent_start #Get effect start relative to length of parent effect
                    effect_end = effect["end"]
                    if effect_end > final_end: #Check that current effect end is not greater than parent 
                        effect_end = final_end

                    effect_end = (effect_end - parent_start) #Get effect end relative to length of parent effect

                    effect_params, type = self.build_effect_parameters(effect, effect_start, effect_end, effect_data, True)

                    self.debug_print(2, "effect will run between: {} and {} (these are relative to result from parent effect)".format(effect_start, effect_end))

                    child_effect_data = getattr(self, type)(**effect_params)
                    self.debug_print(2, "Shape of child effect ouput data: {}".format(child_effect_data.shape))

                    effect_data_ = np.concatenate((effect_data[0:int(round(effect_start*self.sample_rate))], child_effect_data))
                    effect_data = np.concatenate((effect_data_, effect_data[int(round(effect_end*self.sample_rate)):int(round(final_end*self.sample_rate))]))
                    self.debug_print(2, "Effect concatenated data: {}".format(effect_data.shape))

            else:
                effect_data = self.data[int(round(parent_effect["start"]*self.sample_rate)): int(round(parent_effect["end"]*self.sample_rate))]

            #Add effect data of given effect object(s) to output data
            out.append(effect_data)
            self.debug_print(1, "\n")

        self.out = np.array(list(itertools.chain.from_iterable(out)))
        out_shape = self.out.shape[0]
        data_shape = self.data.shape[0]
        last_end = eval_data[-1][0]["end"]

        if len(self.out) != data_shape:
            self.out = np.concatenate((self.out, self.data[int(round(last_end*self.sample_rate)): data_shape]))

        out_shape = self.out.shape[0]
        self.debug_print(1, "Input data: {}".format(data_shape))
        self.debug_print(1, "Final computed data: {}".format(out_shape))
        self.out = {"data": self.out}
        self.handle_recompute()
        
        return self.out

    #Util methods
    def adjust_effect_bounds(self, length):
        for effect in self.audio_object["effects"]:
            if effect["end"] > length:
                effect["end"] = length

    def handle_recompute(self):
        """Handles the recomputation of bar markers and waveforms for new audio data post effect modulation"""
        for effect in self.effect_data:
            if effect["type"] == "tempo":
                full_temp_filename = current_app.config["METAMIX_TEMP_SAVE"] + str(uuid.uuid4()) + ".wav"
                librosa.output.write_wav(full_temp_filename, self.out["data"], self.sample_rate)

                if effect["start"] == self.audio_object["start"] and effect["end"] == self.audio_object["end"]:
                    #Recompute bar markers for entire song
                    bpm, beats, beats_confidence, _, beats_intervals = compute_bar_markers(full_temp_filename, loaded=False)
                    self.out["bpm"] = effect["effectStart"]
                    self.out["beat_positions"] = beats.tolist()

                else:
                    #Recompute bar markers for slice @ effect["start"] effect["end"]
                    partial_temp_filename = current_app.config["METAMIX_TEMP_SAVE"] + str(uuid.uuid4()) + ".wav"
                    librosa.output.write_wav(partial_temp_filename, self.out["data"][int(round(effect["start"]*self.sample_rate)): int(round(effect["end"]*self.sample_rate))], self.sample_rate)
                    bpm, beats, beats_confidence, _, beats_intervals = compute_bar_markers(partial_temp_filename, loaded=False)
                    np_bpos = np.array(self.audio_object["beat_positions"])
                    start_idx = (np.abs(np_bpos-effect["start"])).argmin()
                    end_idx = (np.abs(np_bpos-effect["end"])).argmin()
                    self.out["beat_positions"] = np_bpos[0:start_idx] + (beats + np_bpos[start_idx]) + np_bpos[end_idx: -1]
                    self.audio_object["beat_positions"] = self.out["beat_positions"].tolist()

                    os.remove(partial_temp_filename)

                self.out["length"] = self.out["data"].shape[0] / self.sample_rate
                self.out["song_end"] = self.out["length"]
                self.out["end"] = self.audio_object["start"] + self.out["length"]
                self.out["waveform"] = create_waveform(full_temp_filename)
                self.adjust_effect_bounds(self.out["length"])
                os.remove(full_temp_filename)

            elif effect["type"] == "pitch":
                pass
        
    def recompute_key(self):
        """Looks at pitch modulation that has happened on the song - if the duration of the pitch modulation is the length of the song then it will add a key key/value pair to the output data of the new key """
        pass
        
    def order_effects(self):
        """Ensures that effects are ordered from starting value of effect"""
        self.effect_data = sorted(self.effect_data, key=lambda x: x['start'], reverse=False) 

    def debug_print(self, debug_value, value):
        if self.debug_level != 0:
            if self.debug_level >= debug_value:
                print value

            else:
                pass

    def build_effect_parameters(self, effect, start, end, effect_data, effected_data=False):
        """Build parameters for each effect - should also be able to handle (secondary/advance) parameters such as width_q and second strength curves
            currently if/elif statements handle each type seperately - this is so if in the future secondary/advance parameters are implemented for effects they can be added here for each effect
            will also be good to check the paramters of the effects within this function - only effect start/target values that will work with effect(s) should be allowed to be sent to the effect
        """

        if effect["type"] == "eq":
            #In the future these parameters should also build for start/target decbel & width_q
            print "Effect start for eq: {} and end {}".format(effect["effectStart"], effect["effectTarget"])
            # effect["effectStart"] = effect["effectStart"] + 1
            # effect["effectTarget"] = effect["effectTarget"] + 1
            params = {"sample_rate": self.sample_rate, "start": effect["effectStart"], "target": effect["effectTarget"], "strength_curve": effect["strength_curve"], "frequency": effect["frequency"]}
            if effected_data == False:
                params["data"] = self.data[int(round(start*self.sample_rate)): int(round(end*self.sample_rate))]

            else:
                params["data"] = effect_data[int(round(start*self.sample_rate)): int(round(end*self.sample_rate))]

            type = "eq"

        elif effect["type"] == "volume":
            params = {"sample_rate": self.sample_rate, "start": effect["effectStart"], "target": effect["effectTarget"], "strength_curve": effect["strength_curve"]}
            if effected_data == False:
                params["data"] = self.data[int(round(start*self.sample_rate)): int(round(end*self.sample_rate))]

            else:
                params["data"] = effect_data[int(round(start*self.sample_rate)): int(round(end*self.sample_rate))]
                
            type = "volume"

        elif effect["type"] == "highPass":
            #In the future this should be able to handle upper bound and lower bound parameters?
            params = {"sample_rate": self.sample_rate, "start": effect["effectStart"], "target": effect["effectTarget"], "strength_curve": effect["strength_curve"]}
            if effected_data == False:
                params["data"] = self.data[int(round(start*self.sample_rate)): int(round(end*self.sample_rate))]

            else:
                params["data"] = effect_data[int(round(start*self.sample_rate)): int(round(end*self.sample_rate))]
                
            type = "high_pass_filter"

        elif effect["type"] == "lowPass":
            #In the future this should be able to handle upper bound and lower bound parameters?
            params = {"sample_rate": self.sample_rate, "start": effect["effectStart"], "target": effect["effectTarget"], "strength_curve": effect["strength_curve"]}
            if effected_data == False:
                params["data"] = self.data[int(round(start*self.sample_rate)): int(round(end*self.sample_rate))]

            else:
                params["data"] = effect_data[int(round(start*self.sample_rate)): int(round(end*self.sample_rate))]
                
            type = "low_pass_filter"

        elif effect["type"] == "pitch":
            params = {"sample_rate": self.sample_rate, "start": effect["effectStart"], "target": effect["effectTarget"], "strength_curve": effect["strength_curve"]}
            if effected_data == False:
                params["data"] = self.data[int(round(start*self.sample_rate)): int(round(end*self.sample_rate))]

            else:
                params["data"] = effect_data[int(round(start*self.sample_rate)): int(round(end*self.sample_rate))]
                
            type = "pitch"

        elif effect["type"] == "tempo":
            params = {"sample_rate": self.sample_rate, "start": effect["effectStart"], "target": effect["effectTarget"], "strength_curve": effect["strength_curve"]}
            if effected_data == False:
                params["data"] = self.data[int(round(start*self.sample_rate)): int(round(end*self.sample_rate))]

            else:
                params["data"] = effect_data[int(round(start*self.sample_rate)): int(round(end*self.sample_rate))]
                
            type = "tempo"

        else:
            raise NotImplementedError("effect type: {} not implemented or invalid effect type".format(effect["type"]))

        return params, type

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

            if effect_start == 0:
                raise Exception("Target and start should be different")

            decimal_start = 10 * math.log(effect_start, 2)
            change = decimal_target - decimal_start

        elif effect_start == 0:
            #Going from 0.0 to x
            decimal_start = 10 * math.log(0.01, 2)

            if effect_target == 0:
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
            return effect["effectStart"], effect["effectTarget"] #Start/end timestamp is the same as the original effect values - thus start/end will be the same 

        start_timestamp = start_timestamp - effect_time_start
        end_timestamp = end_timestamp - effect_time_start

        effect_type = effect["type"]
        effect_start = effect["effectStart"]
        effect_target = effect["effectTarget"]

        if effect_type in ["pitch"]:
            length, increments, chunk_size = MetaModulate.standard_incrementation(effect_time_start, effect_time_end, 
                                                                                  effect_start, effect_target, 
                                                                                  effect_type)

        elif effect_type in ["eq"] and effect_start != None and effect_target != None:
            length, increments, chunk_size = MetaModulate.decibel_incrementation(0, float(len(data) / sample_rate), 
                                                                        start_decibel, target_decibel, "eq")

        elif effect_type in ["eq"] and "effectStartDecibel" in effect and "effectTargetDecibel" in effect:
            effect_start = effect["effectStartDecibel"]
            effect_target = effect["effectTargetDecibel"]

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
        self.debug_print(1, "Running EQ function with values strength_curve: {}, frequency: {}, start: {}, target: {}, start_decibel: {}, target_decibel: {}, width_q: {}".format(strength_curve, frequency, start, target, target_decibel, start_decibel, width_q))

        if strength_curve == "continuous":
            #Apply EQ with same gain to entire spectrum of data
            if start == None:
                start = target_decibel

            elif start_decibel == None:
                start = 10 * math.log(start, 2)

            else:
                raise ValueError("Must either supply target decibel or target")

            self.debug_print(2, "Running continous EQ at decibal target: {}".format(start))
            fx = (
                AudioEffectsChain()
                .equalizer(frequency, width_q, start)
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

        if start < lower_bound or start > upper_bound:
            raise ValueError("Target must be between upper and lower bounds")

        if strength_curve == "continuous":
            fx = (
                AudioEffectsChain()
                .highpass(float(start))
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
        self.debug_print(1, "\n")
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
        if start > lower_bound or start < upper_bound:
            raise ValueError("Target must be between upper and lower bounds")

        if strength_curve == "continuous":
            fx = (
                AudioEffectsChain()
                .lowpass(float(start))
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

        if start < -12 or start > 12:
            raise ValueError("Target should be between -12 and 12 semitones")

        temp_changed = current_app.config["METAMIX_TEMP_SAVE"]+"changed.wav"
        temp_temp = current_app.config["METAMIX_TEMP_SAVE"]+"temp.wav"

        if strength_curve == "continuous":
            librosa.output.write_wav(temp_temp, data, sample_rate)
            subprocess.call(["rubberband","--pitch", str(start), temp_temp, temp_changed])
            out, sr = librosa.load(temp_changed, sr=None) 

        elif strength_curve == "linear":
            length, increments, chunk_size = MetaModulate.standard_incrementation(0, float(float(len(data)) / float(sample_rate)), 
                                                                     start, target, 
                                                                     "pitch")

            out = np.array([])
            librosa.output.write_wav(temp_temp, data, sample_rate)

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

                    subprocess.call(["rubberband","--pitch", str(current_change), temp_temp, temp_changed])
                    data_out, sr = librosa.load(temp_changed, sr=None) 
                    frame_out = data_out[n*sample_rate:increments[i+1]*sample_rate]
                    out = np.concatenate((out, frame_out))

        self.debug_print(1, "\n")
        assert len(out) == len(data)
        os.remove(temp_temp)
        os.remove(temp_changed)
        return out

    def tempo(self, data, sample_rate, strength_curve, target, start):
        self.debug_print(1, "Running tempo function")
        if strength_curve == "continuous":
            #Save data as WAV file to send to rubberband
            start = start / self.bpm
            librosa.output.write_wav(current_app.config["METAMIX_TEMP_SAVE"]+"temp.wav", data, sample_rate)

            subprocess.call(["rubberband","--tempo", str(start), current_app.config["METAMIX_TEMP_SAVE"]+"temp.wav", current_app.config["METAMIX_TEMP_SAVE"]+"changed.wav"])
            out, sr = librosa.load(current_app.config["METAMIX_TEMP_SAVE"]+"changed.wav", sr=None) 

        elif strength_curve == "linear":
            #This part of the algorithms is not working as when we change the temp of a frame we overlap into the next frame - this must be accounted for
            #when slicing the data from the output result
            #Try using the sox once the tempo change offset for slicing the data is computed - sox might be faster and provide just as good results
            assert target != 0
            start = start / self.bpm
            target = target / self.bpm
            length, increments, chunk_size = MetaModulate.standard_incrementation(0, float(float(len(data)) / float(sample_rate)), 
                                                                     start, target, 
                                                                     "tempo", True)

            out = np.array([])
            librosa.output.write_wav(current_app.config["METAMIX_TEMP_SAVE"]+"temp.wav", data, sample_rate)
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

                    p = subprocess.Popen(["rubberband","--tempo", str(current_change), current_app.config["METAMIX_TEMP_SAVE"]+"temp.wav", current_app.config["METAMIX_TEMP_SAVE"]+"changed.wav"], stderr=subprocess.PIPE)
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

                    data_out, sr = librosa.load(current_app.config["METAMIX_TEMP_SAVE"]+"changed.wav", sr=None) 
                    frame_out = data_out[int(round(start_slice)):int(round(end))]
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
        if strength_curve == "continuous":
            if start != 0:
                start = 10 * math.log(start, 2)

            else:
                start = -128
            self.debug_print(1, "Running volume function with parameters, strength_curve: {}, start: {}, target: {}".format(strength_curve, start, target))
            fx = (
                AudioEffectsChain()
                .vol(float(start), type="dB")
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