"""File which contains all key variables which may need to be accessed globally by the application"""

#All parameters build on base parameters: [data, sample_rate, debug]
modulation_algorithm_parameters = [
	{
		"name": "echo",
		"parameters": ["strength_curve_decay", "strength_curve_delay", "decay_target", "delay_target", "start_decay", "start_delay"]
	},
	{
		"name": "reverb",
		"parameters": ["strength_curve_reverberance", "strength_curve_size", "target_reverberance", "target_strength", "start_reverberance", "start_size"]
	},
	{
		"name": "pitch",
		"parameters": ["strength_curve", "target", "start"]
	},
	{
		"name": "tempo",
		"parameters": ["strength_curve", "target", "start"]
	},
	{
		"name": "volume",
		"parameters": ["strength_curve", "target", "start"]
	},
	{
		"name": "gain",
		"parameters": ["strength_curve", "target", "start"]
	},
	{
		"name": "equalizer",
		"parameters": ["strength_curve", "target", "start", "frequency", "width_q"]
	},
	{
		"name": "high_pass_filter",
		"parameters": ["strength_curve", "target", "start", "upper_bound", "lower_bound"]
	},
	{
		"name": "low_pass_filter",
		"parameters": ["strength_curve", "target", "start", "upper_bound", "lower_bound"]
	}
]