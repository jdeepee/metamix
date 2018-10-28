"""File which contains all key variables which may need to be accessed globally by the application"""

#All parameters build on base parameters: [data, sample_rate, debug]
modulation_algorithm_parameters = [
	{
		"name": "echo",
		"parameters": ["strength_curve_decay", "strength_curve_delay", "decay_target", "delay_target", "start_decay", "start_delay"],
		"database_defaults": {"strength_curve_decay": "strength_curve", "strength_curve_delay": "strength_curve_2", 
							  "decay_target": "effect_target", "delay_target": "effect_target_2", 
							  "start_decay": "effect_start", "start_delay": "effect_start_2"}, #Describes the effect paramter -> database names
		"defaults": {}, #Decribes the default values for certain parameters
		"increment_time_change": 0 #Number of increments per second of data (used in calculating effect value increments for non continuous strength curves)
		#Delay = effect parameter 2: strength_curve_delay = strength_curve_2, delay_target = target_2, start_delay = start_2
		#Database defaults = parameter value -> database column values
	},
	{
		"name": "reverb",
		"parameters": ["strength_curve_reverberance", "strength_curve_size", "target_reverberance", "target_size", "start_reverberance", "start_size"],
		"database_defaults": {"strength_curve_reverberance": "strength_curve", "strength_curve_size": "strength_curve_2", 
							  "target_reverberance": "effect_target", "target_size": "effect_target_2", 
							  "start_reverberance": "effect_start", "start_size": "effect_start_2"},
		"defaults": {},
		"increment_time_change": 0
		#Size = effect parameter 2: strength_curve_size = strength_curve_2, target_size = target_2, start_size = start_2
	},
	{
		"name": "pitch",
		"parameters": ["strength_curve", "target", "start"],
		"database_defaults": {"strength_curve": "strength_curve", "target": "target", "start": "start"},
		"increment_time_change": 4
	},
	{
		"name": "tempo",
		"parameters": ["strength_curve", "target", "start"],
		"database_defaults": {"strength_curve": "strength_curve", "target": "target", "start": "start"},
		"increment_time_change": 2
	},
	{
		"name": "volume",
		"parameters": ["strength_curve", "target", "start"],
		"database_defaults": {"strength_curve": "strength_curve", "target": "target", "start": "start"},
		"increment_time_change": 10
	},
	{
		"name": "gain",
		"parameters": ["strength_curve", "target", "start"],
		"database_defaults": {"strength_curve": "strength_curve", "target": "target", "start": "start"},
		"increment_time_change": 0
	},
	{
		"name": "eq",
		"parameters": ["strength_curve", "target", "start", "frequency", "width_q", "target_decibel", "start_decibel"],
		"database_defaults": {"strength_curve": "strength_curve", "target": "target", "start": "start", "frequency": "frequency",
							  "width_q": "width_q", "target_decibel": "effect_target", "start_decibel": "effect_start"},
		"defaults": {"width_q": 1.0},
		"increment_time_change": 5
	},
	{
		"name": "high_pass_filter",
		"parameters": ["strength_curve", "target", "start", "upper_bound", "lower_bound"],
		"database_defaults": {"upper_bound": "upper_bound", "lower_bound": "lower_bound", "strength_curve": "strength_curve", "target": "target", "start": "start"},
		"defaults": {"upper_bound": 15000, "lower_bound": 20},
		"increment_time_change": 5
	},
	{
		"name": "low_pass_filter",
		"parameters": ["strength_curve", "target", "start", "upper_bound", "lower_bound"],
		"database_defaults": {"upper_bound": "upper_bound", "lower_bound": "lower_bound", "strength_curve": "strength_curve", "target": "target", "start": "start"},
		"defaults": {"upper_bound": 20, "lower_bound": 15000},
		"increment_time_change": 5
	}
]