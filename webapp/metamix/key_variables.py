"""File which contains all key variables which may need to be accessed globally by the application"""

#All parameters build on base parameters: [data, sample_rate, debug]
modulation_algorithm_parameters = [
	{
		"name": "echo",
		"parameters": ["strength_curve_decay", "strength_curve_delay", "decay_target", "delay_target", "start_decay", "start_delay"],
		"defaults": {},
		"increment_time_change": 0 #Number of increments per second of data
		#Delay = effect parameter 2: strength_curve_delay = strength_curve_2, delay_target = target_2, start_delay = start_2
	},
	{
		"name": "reverb",
		"parameters": ["strength_curve_reverberance", "strength_curve_size", "target_reverberance", "target_size", "start_reverberance", "start_size"],
		"defaults": {},
		"increment_time_change": 0
		#Size = effect parameter 2: strength_curve_size = strength_curve_2, target_size = target_2, start_size = start_2
	},
	{
		"name": "pitch",
		"parameters": ["strength_curve", "target", "start"],
		"defaults": {},
		"increment_time_change": 4
	},
	{
		"name": "tempo",
		"parameters": ["strength_curve", "target", "start"],
		"defaults": {},
		"increment_time_change": 2
	},
	{
		"name": "volume",
		"parameters": ["strength_curve", "target", "start"],
		"defaults": {},
		"increment_time_change": 10
	},
	{
		"name": "gain",
		"parameters": ["strength_curve", "target", "start"],
		"defaults": {},
		"increment_time_change": 0
	},
	{
		"name": "eq",
		"parameters": ["strength_curve", "target", "start", "frequency", "width_q"],
		"defaults": {"width_q": 1.0},
		"increment_time_change": 5
	},
	{
		"name": "high_pass_filter",
		"parameters": ["strength_curve", "target", "start", "upper_bound", "lower_bound"],
		"defaults": {"upper_bound": 15000, "lower_bound": 20},
		"increment_time_change": 5
	},
	{
		"name": "low_pass_filter",
		"parameters": ["strength_curve", "target", "start", "upper_bound", "lower_bound"],
		"defaults": {"upper_bound": 20, "lower_bound": 15000},
		"increment_time_change": 5
	}
]