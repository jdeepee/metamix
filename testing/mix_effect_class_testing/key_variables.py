"""File which contains all key variables which may need to be accessed globally by the application"""

#All parameters build on base parameters: [data, sample_rate, debug]
modulation_algorithm_parameters = [
	{
		"type": "echo",
		"parameters": ["strength_curve_decay", "strength_curve_delay", "decay_target", "delay_target", "start_decay", "start_delay"],
		"increment_time_change": 0 #Number of increments per second of data
		#Delay = effect parameter 2: strength_curve_delay = strength_curve_2, delay_target = target_2, start_delay = start_2
	},
	{
		"type": "reverb",
		"parameters": ["strength_curve_reverberance", "strength_curve_size", "target_reverberance", "target_size", "start_reverberance", "start_size"],
		"increment_time_change": 0
		#Size = effect parameter 2: strength_curve_size = strength_curve_2, target_size = target_2, start_size = start_2
	},
	{
		"type": "pitch",
		"parameters": ["strength_curve", "target", "start"],
		"increment_time_change": 4
	},
	{
		"type": "tempo",
		"parameters": ["strength_curve", "target", "start"],
		"increment_time_change": 2
	},
	{
		"type": "volume",
		"parameters": ["strength_curve", "target", "start"],
		"increment_time_change": 10
	},
	{
		"type": "gain",
		"parameters": ["strength_curve", "target", "start"],
		"increment_time_change": 0
	},
	{
		"type": "eq",
		"parameters": ["strength_curve", "target", "start", "frequency", "width_q", "target_decibel", "start_decibel"],
		"increment_time_change": 5
	},
	{
		"type": "high_pass_filter",
		"parameters": ["strength_curve", "target", "start", "upper_bound", "lower_bound"],
		"increment_time_change": 5
	},
	{
		"type": "low_pass_filter",
		"parameters": ["strength_curve", "target", "start", "upper_bound", "lower_bound"],
		"increment_time_change": 5
	}
]