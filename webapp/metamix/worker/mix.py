from metamix.models.mix import Mix, MixAudio
from metamix.models.song import Song, SongEffects
from metamix.models.user import User
from metamix.models.clip import Clip
from metamix.worker.meta_modulate import MetaModulate
import json
import boto3
import uuid
import librosa
import os
import copy

class Mix():
    """
    Class to be used by Flask-RQ worker for creating a MP3 of a mix given its ID - fetches JSON representation of mix
    """
    def __init__(self, id, testing, debug_level):
        self.mix_id = id
        self.testing = testing
        self.debug_level = debug_level

    @classmethod
    def mix(cls, id, testing, debug_level):
        '''method intended to be called on the class, not an instance'''
        return cls(id, testing, debug_level)

    #Core mix methods
    def create_mix_data(self):
        """Iterate over mix schema - figure out which song sections in mix have already been processed - fetch parts of mixed already processed
        - call apply_effects with relevant effect schema on parts of the mix that need to be computed 
        - call mix_songs with relevant mix schema and full mix data (in order and effects computed)
        - then call to_mp3 to get mp3 of mix data"""
        self.mix_object = Mix.get_mix(self.mix_id)
        self.json_decription = json.loads(self.mix_object.json_decription)
        out = []

        for song in self.json_decription["songs"]:
            print 'Currently computing song: {}'.format(song)
            song_id = song["id"]
            mix_start = song["mix_start"]
            mix_end = song["mix_end"]
            song_start = song["song_start"]
            song_end = song["song_end"]
            effects = song["effects"]

            if len(effects) > 0:
                #Here we are only searching for an exact match - in the future should also look for matches which we can shape/slice into the correct format as
                #Defined by the effects i.e if continuous effects are applied on song between timestamps greater than timestamps specified here - then we can
                #just grab previous data and then slice down to the right size
                prev_processed = MixAudio.get_mix_song(song_id, song_start, song_end, effects)
                print "Previously processed value: {}".format(prev_processed)

                if prev_processed != None:
                    print "Previously processed clip found - appending to output data"
                    #Get prev processed value and use this as output
                    data, sample_rate = fetch_s3(prev_processed.s3_key)
                    out.append({"id": song_id, "start": mix_start, "end": mix_end, "data": data})

                else:
                    #Make computation, save data - then add data to output
                    print "No previous processed clip found - running clip effect computation"
                    song_obj = Song.get_song(song_id)
                    data, sample_rate = fetch_s3(song_obj.s3_key)
                    song["data"] = data[song_start*sample_rate:song_end*sample_rate]
                    song["sample_rate"] = sample_rate

                    effect_creator = MetaModulate(song, 1)
                    data = effect_creator.modulate()
                    out.append({"id": song_id, "start": mix_start, "end": mix_end, "data": data})

                    #Save audio with effects applied into database for retrieval later on future computations
                    self.upload_s3(data, sample_rate)
                    MixAudio.save_audio(self.mix_id, song_obj.name, song_obj.s3_key, song_start, song_end, mix_start, mix_end, song_id, "song", effects)

            else:
                #No effects applied on this song - just grab song and slice accordingly - then append data to out
                print "No effects applied on this song - fetching slicing and appending to output"
                song = Song.get_song(song_id)
                data, sample_rate = fetch_s3(song.s3_key)

                out.append({"id": song_id, "start": mix_start, "end": mix_end, "data": data[song_start*sample_rate:song_end*sample_rate]})

        for clip in self.json_decription['clips']:
            print 'Currently computing clip: {}'.format(clip)
            clip_id = clip["id"]
            mix_start = clip["mix_start"]
            mix_end = clip["mix_end"]
            clip_start = clip["start"]
            clip_end = clip["end"]
            effects = clip["effects"]

            if len(effects) > 0:
                prev_processed = MixAudio.get_mix_clip(clip_id, clip_start, clip_end, effects)
                print "Previously processed value: {}".format(prev_processed)

                if prev_processed != None:
                    print "Previously processed clip found - appending to output data"
                    #Get prev processed value and use this as output
                    data, sample_rate = fetch_s3(prev_processed.s3_key)
                    out.append({"id": clip_id, "start": mix_start, "end": mix_end, "data": data})

                else:
                    #Make computation, save data - then add data to output
                    print "No previous processed clip found - running clip effect computation"
                    clip_obj = Clip.get_clip(clip_id)
                    data, sample_rate = fetch_s3(clip_obj.s3_key)

                    clip["data"] = data[clip_start*sample_rate:clip_end*sample_rate]
                    clip["sample_rate"] = sample_rate

                    effect_creator = MetaModulate(clip, 1)
                    data = effect_creator.modulate()
                    out.append({"id": clip_id, "start": mix_start, "end": mix_end, "data": data})

                    self.upload_s3(data, sample_rate)
                    MixAudio.save_audio(self.mix_id, clip_obj.name, clip_obj.s3_key, clip_start, clip_end, mix_start, mix_end, clip_id, "clip", effects)

            else:
                print "No effects applied on this clip - fetching slicing and appending to output"
                clip = Clip.get_clip(clip_id)
                data, sample_rate = fetch_s3(clip.s3_key)

                out.append({"id": clip_id, "start": mix_start, "end": mix_end, "data": data[clip_start*sample_rate:clip_end*sample_rate]})

        self.modulated_objects = out
        mix_data = self.make_mix()
        self.upload_s3(mix_data, sample_rate)

    def make_mix(self):
        """Returns mixed version of input data - where songs are mixed according to time-stamps
        sample rate of all data in songs should be the same - otherwise it will sound fucked
        
        data: list of dictionaries containing following keys: data, start, end and id where data is numpy array of data as timepoint floating series
        returns: array containing floating timepoint series of all input data mixed together
        """
        out = []
        data_id = {} #Map audio id to data - so we dont have to copy and move data around in operations below
        for audio in self.modulated_audio_objects:
            data_id[audio["id"]] = audio["data"]
            del audio["data"]

        data = sorted(self.modulated_audio_objects, key=lambda x: x["start"]) #Sort data by starting value low->high
        time_copy = copy.deepcopy(data)
        eval_data = [[x] for x in data] #Create eval_data structure
        eval_copy = copy.deepcopy(data) #Copy for evaluation
        sample_rate = 44100

        for i, audio in enumerate(data):
            print "Iterating over audio: {}\n".format(audio)
            covered_children, partial_children = Mix.return_overlaping_times(audio, eval_copy) #Get children completely inside audio and partially inside audio 

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

            #Figure out issue with slicing where slicing with same length between values produces array of different size
            for track in tracks:
                print 'Computing slices for track: {}'.format(track)
                track_start = (item["start"] for item in time_copy if item["id"] == track).next()
                track_start_slice = float((start - track_start)) * sample_rate
                track_end_slice = float((end - track_start)) * sample_rate
                print 'Mix section start value: {}, end: {}'.format(start, end)
                print "Starting slice: {} and ending slice: {}, total: {}".format(track_start_slice, track_end_slice, track_end_slice-track_start_slice)
                print "In seconds, start: {} and end: {}".format(track_start_slice/sample_rate, track_end_slice/sample_rate)
                sd = data_id[track][int(track_start_slice):int(track_end_slice)]
                if sd.shape[0] != track_end_slice-track_start_slice:
                    sd = data_id[track][int(track_start_slice):int(track_end_slice)+1]
                    
                print "Length of section data: {}\n".format(sd.shape)
                mix_section_data.append(sd)

            print "Computed mix section length: {}\n".format(len(mix_section_data))
            if len(mix_section_data) > 1:
                i = 1

                while i != len(mix_section_data):
                    mixed = Mix.mix_audio(mix_section_data[i-1], mix_section_data[i], sample_rate)
                    print "Length of mixed tracks: {}, {}\n".format(float(len(mixed)), float(len(mixed))/sample_rate)
                    out.append(mixed)
                    i += 1

            else:
                print 'Length of solo track: {}, {}\n'.format(len(mix_section_data[0]), len(mix_section_data[0])/sample_rate)
                out.append(mix_section_data[0])

        out = np.array(list(itertools.chain.from_iterable(out)))
        print "Shape of output data: {}, length: {}".format(out.shape, float(out.shape[0])/sample_rate)
        return out

    #UTIL METHODS
    @staticmethod
    def mix_audio(track1, track2, sample_rate):
        out = []

        assert track2.shape == track1.shape
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

    def fetch_s3(self, s3_key):
        temp_filename = os.environ.get("METAMIX_TEMP_SAVE") + str(uuid.uuid4()) + ".wav"

        session = boto3.session.Session(region_name='eu-west-1')
        s3 = session.client('s3', config=boto3.session.Config(signature_version='s3v4'))
        s3.download_file(os.environ.get("S3_BUCKET"), s3_key, temp_filename)
        data, sr = librosa.load(temp_filename, sr=None) 

        return data, sr

    def upload_s3(self, data, sample_rate):
        key = str(uuid.uuid4()) + ".wav"
        temp_filename = os.environ.get("METAMIX_TEMP_SAVE") + str(uuid.uuid4()) + ".wav"

        librosa.output.write_wav(temp_filename, data, sample_rate)
        session = boto3.session.Session(region_name='eu-west-1')
        s3 = session.client('s3', config=boto3.session.Config(signature_version='s3v4'))
        s3.upload_file(temp_filename, os.environ.get("S3_BUCKET"), key)
        os.remove(temp_filename)

        return key
