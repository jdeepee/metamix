var Settings = require("./settings");

function computeHighLow(start, end, type){
	//Computes high/low ratio (0-100) of where the start/target of the effects are compared to possible min/max
	//get min/max of start/end of given effect type
	//normalize min/max so -> min = 0 , max = max + offset of min to get to 0
	//then ratio will be max / (start/end) + offset of min to get to 0
	offset = 0;
	bounds = Settings.effectBounds[type];
	if (bounds["startMin"] <= 0){
		offset = +bounds["startMin"]
	} else {
		offset = -bounds["startMin"]
	}

	max = bounds["startMax"] + offset
	startOff = start + offset;
	endOffset = end + offset;

	if (startOff == 0){
		return [0, (endOffset / max)*100]

	} else if (endOffset == 0){
		return [(startOff / max)*100, 0]

	} else {
		return [(startOff / max)*100, (endOffset / max)*100]
	}
}

function computeEffectsX(effects, startX, time_scale, frame_start){
	for (var i=0; i<effects.length; i++){
		effects[i]["startX"] = startX + effects[i]["start"] * time_scale;
		effects[i]["endX"] = startX + effects[i]["end"] * time_scale;
	}
	return effects;
}

module.exports = {
	computeHighLow: computeHighLow,
	computeEffectsX: computeEffectsX
}