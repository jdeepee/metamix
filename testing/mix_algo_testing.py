input_data = [
	[
		{'start': 0, 'end': 5.5, 'id': 1}, 
		{'start': 2, 'end': 2.5, 'id': 5, 'type': 'child_covered'}, 
		{'start': 3, 'end': 6, 'id': 2, 'type': 'child_partial'}
	], 
	[
		{'start': 5.5, 'end': 6, 'id': 2}
	], 
	[
		{'start': 6, 'end': 20, 'id': 3}, 
		{'start': 8, 'end': 10, 'id': 4, 'type': 'child_covered'}, 
		{'start': 8, 'end': 9, 'id': 6, 'type': 'child_covered'}
	]
]

def rtrn_out_simple(input_data):
	pass

def rtrn_out(input_data):
	for i, d in enumerate(input_data):
		input_data[i][0]["type"] = "parent"
		print d
	out = []

	print "\n"
	#Test method below on standard input data without grouping clips together and see if it works
	for i, data in enumerate(input_data):
		print "On segment: {}".format(data)
		parent_value = input_data[i][0]
		if len(input_data[i]) > 1:
			#First set of data pairs will always be 1st item start -> 2nd item start
			local_out = []
			starting_value = parent_value["start"]
			ending_value = input_data[i][1]["start"]
			final_end = parent_value["end"]
			next_value = 0
			local_out.append([starting_value, ending_value, [parent_value["id"]]])
			#Create two lists sorted by lowest start and lowest end
			print 'Current start and end values: {}, {}'.format(starting_value, ending_value)
			start_list = sorted([x for x in input_data[i] if x["start"] > ending_value and x["type"] != "parent"], key=lambda x: x["start"])
			end_list = sorted([x for x in input_data[i] if x["end"] > ending_value and x["type"] != "parent"], key=lambda x: x["end"])
			print "master iteration, next_start_list: {}, end list: {}".format(start_list, end_list)
			i2 = 0
			while len(start_list) != 0 or len(end_list) != 0:
				starting_value = ending_value
				if len(start_list) > 0:
					current_start_value = start_list[0]["start"]

				else:
					print 'Running this'
					ending_value = end_list[0]["end"]
					if ending_value > final_end:
						ending_value = final_end

						local_out.append([starting_value, ending_value, [x["id"] for x in input_data[i] if x["start"] < ending_value and x["end"] > starting_value]])
						break

					else:
						current_start_value = ending_value

				if len(end_list) > 0:
					current_end_value = end_list[0]["end"]
					print "Comparing values, end: {} and start: {}".format(current_end_value, current_start_value)
					if current_end_value < current_start_value:
						ending_value = current_end_value
						local_out.append([starting_value, ending_value, [x["id"] for x in input_data[i] if x["start"] < ending_value and x["end"] > starting_value]])

					else:
						ending_value = current_start_value
						local_out.append([starting_value, ending_value, [x["id"] for x in input_data[i] if x["start"] < ending_value and x["end"] > starting_value]])

				else:
					ending_value = start_list[0]["start"]
					local_out.append([starting_value, ending_value, [x["id"] for x in input_data[i] if x["start"] < ending_value and x["end"] > starting_value]])

				print "new ending value: {}".format(ending_value)
				start_list = sorted([x for x in input_data[i] if x["start"] > ending_value and x["type"] != "parent"], key=lambda x: x["start"])
				end_list = sorted([x for x in input_data[i] if x["end"] > ending_value and x["type"] != "parent"], key=lambda x: x["end"])

				print "While loop new start and end list: {}, {}".format(start_list, end_list)

			if local_out[-1][1] != final_end:
				local_out.append([local_out[-1][1], final_end, [x["id"] for x in input_data[i] if x["start"] < final_end and x["end"] > local_out[-1][1]]])

			local_out = sorted(local_out, key=lambda x: x[0])
			for v in local_out:
				out.append(v)

		else:
			out.append([parent_value["start"], parent_value["end"]])


		print "\n"

	print out
	print "\n"

rtrn_out(input_data)