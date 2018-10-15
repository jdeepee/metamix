from metamix.models.mix import Mix, MixSongs
from metamix.models.song import Song, SongEffects
from metamix.models.user import User

class MetaModulate():
    """
    Class for applying effects to a song in method decribed by effect object - returns song object with key: "data" containing newly modulated data
    """
    def __init__(self, song_object, debug):
        self.effects = song_object['effects']
        self.data = song_object["data"]
        self.sample_rate = song_object["sample_rate"]
        self.song_start = song_object["song_start"]
        self.song_end = song_object["song_end"]
        self.debug = debug

    def modulate(self):
        """Run song effect modulations - returns output of array with input data applied in method described in self.effects"""
        pass

    #Util methods
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

    #Effect methods
    @classmethod
    def eq(data, sample_rate, strength_curve, target, start, frequency, width_q=1.0, debug=True):
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
            if start > target:
                change = start - target

            else:
                change = target - start

            if target < 0:
                change = -change

            #Apply EQ to data with linear increase in gain until target is reached
            out = np.array([])
            length = float(len(data) / sample_rate) #Get length in seconds of input data
            #Calculate number of increments possible over data timespan (change currently happens per second as 100ms introduced quality issues)
            increments = np.linspace(0, length, length*5)
            chunk_size = float(change/float(len(increments)-2))

            if debug == True:
                print "Length of audio of given input: {}".format(length)
                print "Number of gain increment increases possible over time span: {}".format(len(increments))
                print "Timespan between each increment in seconds: {}".format(float(float(length) / float(len(increments))))
                print "Chunk size of gain increase/decrease: {}".format(chunk_size)

            for i, n in np.ndenumerate(increments):
                i = i[0]
                if i != len(increments) -1:
                    chunk = (i * chunk_size) + start
                    if debug == True:
                        print "Current n: {} and next: {}. Current EQ gain size: {}".format(n, increments[i+1], chunk)

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

    #Upper and lowerbound in HZ
    @classmethod
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
    @classmethod
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

    @classmethod
    def loop(data, n):
        """Returns input data looped n amount of times
        """
        out = np.array([])

        for _ in range(n):
            out = np.concatenate((out, data))

        return out

    @classmethod
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

    @classmethod
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

    @classmethod
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

    @classmethod
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

    @classmethod
    def gain():
        raise NotImplementedError

    @classmethod
    def flanger():
        raise NotImplementedError

    @classmethod
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
        raise NotImplementedError

    @classmethod
    def phaser():
        raise NotImplementedError

    @classmethods
    def reverb(data, sample_rate, strength_curve_reverberance, strength_curve_size, target_reverberance, target_size, 
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
        raise NotImplementedError

    #Class methods