import copy
from key_variables import modulation_algorithm_parameters
import numpy as np
import itertools

start, end = 10, 45
data = [n for n in range(10,46)]

effect_data = [
    {
        "id": 1,
        "start": 11,
        "end": 22,
        "type": "tempo",
        "params": {
            "strength_curve": "linear",
            "start": 1,
            "target": 5
        }
    },
    {
        "id": 2,
        "start": 15,
        "end": 20,
        "type": "eq",
        "params": {
            "strength_curve": "continuous",
            "target": 5
        }
    },
    {
        "id": 3,
        "start": 21,
        "end": 35,
        "type": "pitch",
        "params": {
            "strength_curve": "linear",
            "start": 2,
            "target": 6
        }
    },
    {
        "id": 4,
        "start": 25,
        "end": 40,
        "type": "pitch",
        "params": {
            "strength_curve": "linear",
            "start": 3,
            "target": 7
        }
    },
    {
        "id": 5,
        "start": 43,
        "end": 44,
        "type": "pitch",
        "params": {
            "strength_curve": "continuous",
            "start": 3,
            "target": 7
        }
    }
]

[{'start': 1, 'end': 12, 'id': 1, 'params': {'strength_curve': 'linear', 'target': 5, 'start': 1}, 'type': 'tempo'}, 
{'start': 5, 'end': 10, 'id': 2, 'params': {'strength_curve': 'continuous', 'target': 5}, 'type': 'eq'}, 
{'start': 11, 'end': 25, 'id': 3, 'params': {'strength_curve': 'linear', 'target': 6, 'start': 2}, 'type': 'pitch'}, 
{'start': 15, 'end': 30, 'id': 4, 'params': {'strength_curve': 'linear', 'target': 7, 'start': 3}, 'type': 'pitch'}]

[{'start': 1, 'end': 12, 'id': 1, 'params': {'strength_curve': 'linear', 'target': 5, 'start': 1}, 'type': 'tempo'}, 
{'end': 10, 'child_type': 'child_covered', 'start': 5, 'params': {'strength_curve': 'continuous', 'target': 5}, 'type': 'eq', 'id': 2}, 
{'end': 25, 'child_type': 'child_partial', 'start': 11, 'params': {'strength_curve': 'linear', 'original_start': 2, 'original_target': 6, 'target': 2.1632653061224492, 'start': 2.0}, 'type': 'pitch', 'id': 3}]

[{'end': 25, 'start': 12, 'params': {'strength_curve': 'linear', 'target': 6, 'start': 2.1632653061224492}, 'original_start': 11, 'type': 'pitch', 'id': 3}, 
{'end': 30, 'child_type': 'child_partial', 'start': 15, 'params': {'strength_curve': 'linear', 'original_start': 3, 'original_target': 7, 'target': 4.3559322033898304, 'start': 3.0}, 'type': 'pitch', 'id': 4}]

[{'end': 30, 'start': 25, 'params': {'strength_curve': 'linear', 'target': 7, 'start': 4.3559322033898304}, 'original_start': 15, 'type': 'pitch', 'id': 4}]

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

def decibal_incrementation(start_timestamp, end_timestamp, effect_start, effect_target, effect_type):
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
            change = decimal_target - decimal_start

        else:   
            change = decimal_start - decimal_target

    length = float(end_timestamp)
    increments = np.linspace(0, length, length*incrementation_factor) 
    chunk_size = float(change/float(len(increments)-2))

    return length, increments, chunk_size

def filter_incrementation(start_timestamp, end_timestamp, effect_start, effect_target, effect_type):
    incrementation_factor = next((item for item in modulation_algorithm_parameters if item['type'] == effect_type), None)["increment_time_change"]
    freq_change = effect_target - effect_start
    length = float(end_timestamp)

    #Calculate number of increments possible over data timespan (change currently happens per second as 100ms introduced quality issues)
    increments = np.linspace(0, length, length*incrementation_factor)
    chunk_size = float(freq_change/float(len(increments)-2))

    return length, increments, chunk_size

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
    #VOLUME CODE = decibal incrementation
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

    if effect_type in ["eq", "pitch"]:
        length, increments, chunk_size = standard_incrementation(effect_time_start, effect_time_end, 
                                                                 effect_start, effect_target, 
                                                                 effect_type)

    elif effect_type in ["tempo"]:
        length, increments, chunk_size = standard_incrementation(effect_time_start, effect_time_end, 
                                                                 effect_start, effect_target, 
                                                                 effect_type, True)

    elif effect_type in ["volume"]:
        length, increments, chunk_size = decibal_incrementation(effect_time_start, effect_time_end, 
                                                                effect_start, effect_target, 
                                                                effect_type)

    elif effect_type in ["high_pass_filter", "low_pass_filter"]:
        length, increments, chunk_size = filter_incrementation(effect_time_start, effect_time_end, 
                                                                effect_start, effect_target, 
                                                                effect_type)


    start, target = (np.abs(increments - start_timestamp)).argmin(), (np.abs(increments - end_timestamp)).argmin()
    print "Input start/end timestamps: {}, {}".format(start_timestamp, end_timestamp)
    print "New start/target: {}, {}".format(start, target)
    print 'Computed values: {}, {}'.format((start*chunk_size) + effect_start, (target*chunk_size) + effect_start)

    return (start*chunk_size) + effect_start, (target*chunk_size) + effect_start

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

def apply_effects(effect_data, start, end, data, sample_rate, debug=False):
    """Applies effects described by effect_data to input data and returns output - input and output as timepoint floating series

    effect_data: effect_data object 
    start: start of audio segment in seconds
    end: end of audio segment in seconds
    data: data of audio clip sliced at start:end
    sample_rate: sample_rate working from
    debug: debug flag
    """
    #Data has been sliced at starting and ending values - thus this should be accounted for when interacting with the data
    for i, effect in enumerate(effect_data):
        effect_data[i]["start"] = effect_data[i]["start"] - start
        effect_data[i]["end"] = effect_data[i]["end"] - start

    end = end - start
    start = 0

    print "Adjusted start and end values {}, {}".format(start, end)
    print "New effect values: {}\n".format(effect_data)
    out = []
    eval_data = [[x] for x in effect_data]
    eval_copy = copy.deepcopy(effect_data) #THis is our moving evaluation dataset where start/end times are updated as they are found by parent effects
    #Append first section of output - this will either be a section at start where no effect is playing or nothing if effect also starts at 0 - time songs starts
    out.append(data[start:effect_data[0]["start"]])

    for i, effect in enumerate(effect_data):
        print "Iterating over effect: {}\n".format(effect)
        covered_children, partial_children = return_overlaping_times(effect, eval_copy) #Get children completely inside audio and partially inside audio 

        for cc in covered_children:
            eval_data[i].append(copy.deepcopy(cc)) #Add covered child to current eval data item
            eval_copy.remove(cc) #Remove from future evaluations - is completely inside this and thus does not need its own evaluation
            del cc["child_type"] #Delete type so we can access eval data object by value
            eval_data.remove([cc]) #Remove from output eval data object
            effect_data.remove(cc) #Remove from future evaluations - anything inside or partially inside this audio segment will be caught by current audio iteration

        for pc in partial_children:
            print "Working on PC: {}".format(pc)
            cpc = copy.deepcopy(pc)
            if cpc["params"]["strength_curve"] != "continuous": #Check that strength curve is not continuous
                cpc["params"]["original_start"] = cpc["params"]["start"] #Save original start to data object
                cpc["params"]["original_target"] = cpc["params"]["target"] #Save original target to data object

                new_start, new_target = calculate_start_target(cpc, cpc["start"], effect["end"]) #Calculate new start and target for partial child
                cpc["params"]["start"], cpc["params"]["target"] = new_start, new_target #New target needs to be calculated as child may only last x-2 of x total seconds and thus target parameters should be reflected across different data objects

                print "New values for item: {}\n".format(cpc)

            eval_data[i].append(cpc) #Add partially covered child to current eval data item

            cpc = copy.deepcopy(pc) #Make copy so we can change starting time for future evaluations without changing value inside eval data object
            eval_copy[eval_copy.index(cpc)]["start"] = effect["end"] #Update starting time for evaluation dataset
            del cpc["child_type"] #Delete type so we access eval data object by value
            data_index_value = eval_data.index([cpc])
            eval_data[data_index_value][0]["params"]["start"] = new_target #Update start of partial child in output dataset to be the target value reached within this effect iteration
            eval_data[data_index_value][0]["original_start"] = eval_data[data_index_value][0]["start"]
            eval_data[data_index_value][0]["start"] = effect["end"] #Update starting time for output dataset - the first segment of this audio will be contained within current output data value - thus the next stage of data creation will only need to happen from end of current output data value
        
    eval_out = []

    #Iterate over data and check that there are no gaps between effect start/end values - if there are gaps add filler object so we can catch this when iterating over results
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
        print "Computing: {}\n".format(effects)
        parent_effect = effects[0]
        #Check that object is not filler
        if parent_effect["type"] != "filler":
            print 'Parent effect: {}'.format(parent_effect)
            parent_start = parent_effect["start"] #Get start/end values of current effect(s) chunk
            final_end = parent_effect["end"] + 1
            effect_params = parent_effect["params"]

            #effect_params["data"] = data[start*sample_rate: final_end*sample_rate]
            effect_params["data"] = data[parent_start: final_end] #Add data and sample rate to effect params
            effect_params["sample_rate"] = sample_rate
            print "Length of parent data: {}".format(final_end-parent_start)
            print 'Starting/end values of parent (these are relative to song): {}, {}'.format(parent_start, final_end)

            #Params should contain all necassary items for effect function
            #effect_data = getattr(self, parent_effect["type"])(**effect_params) #Call effect function with effect parameters passed as arguments
            effect_data = [[x, parent_effect["id"]] for x in effect_params["data"]] #TESTING CODE
            print 'current effect data after parent: {}'.format(effect_data)

            for effect in effects[1:len(effects)]: #Iterate over remaining effects in effect(s) chunk - if no more chunks nothing will iterate
                print 'Computing child effect: {}'.format(effect)
                effect_start = effect["start"] - parent_start #Get effect start relative to length of parent effect
                effect_end = effect["end"]
                if effect_end > final_end: #Check that current effect end is not greater than parent 
                    effect_end = final_end

                effect_end = (effect_end - parent_start) + 1 #Get effect end relative to length of parent effect. Should +1 in production data?
                effect_params = effect["params"]
                effect_params["data"] = effect_data[effect_start: effect_end]
                effect_params["sample_rate"] = sample_rate

                print "effect will run between: {} and {} (these are relative to result from parent effect)".format(effect_start, effect_end)

                test_effect_slice = [] #TESTING CODE 

                for item in effect_data[effect_start:effect_end]: #Iterate over effect data where values are between start/end of current effect 
                    item.append(effect["id"]) #Apply ID of effect for reference when testing algorithm later
                    test_effect_slice.append(item)

                print 'Test effect slice: {}'.format(test_effect_slice)
                #child_effect_data = getattr(self, parent_effect["type"])(**effect_params)
                #effect_data = effect_data[0:effect_start] + child_effect_data + effect_data[effect_end:final_end]

                effect_data = effect_data[0:effect_start] + test_effect_slice + effect_data[effect_end:final_end]
                print 'Effect data: {}'.format(effect_data)

        else:
            #effect_data = data[parent_effect["start"]*sample_rate: parent_effect["end"]*sample_rate]
            effect_data = data[parent_effect["start"]: parent_effect["end"]]

        #Add effect data of given effect object(s) to output data
        out.append(effect_data)
        print "\n"

    #TESTING CODE USER FOR FORMATTING TO MAKE REFERENCE MORE READABLE
    offset = len(out) - 1
    out = list(itertools.chain.from_iterable(out))

    if len(out) - offset != len(data):
        for x in data[len(out) - offset: len(data)]:
            out.append(x)

    print "Input data: {}".format(data)
    print "Final computed data: {}".format(out)

apply_effects(effect_data, start, end, data, 44100)