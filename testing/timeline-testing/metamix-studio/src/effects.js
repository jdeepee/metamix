var Settings = require("./settings");
	utils = require("./utils");

function effectHandler(dataStore, renderItems, canvas, dpr, overwriteCursor, bounds){
	function makeCursorChange(type){
		switch (type){
			case "remove":
				canvas.style.cursor = "not-allowed";
				overwriteCursor = true;
		}
	}

	function effectClicker(type){
		htmlElement = document.getElementById("removeI");
		htmlElement.setAttribute("text-shadow", "5px 5px 5px #ccc");
		makeCursorChange(type);

		audioSelectCallback = function(e) {
			var time_scale = dataStore.getData("ui", "timeScale");
			var frame_start = dataStore.getData("ui", "scrollTime");
			currentX = ((e.clientX - bounds.left)/dpr + (frame_start * time_scale));
			currentY = (e.clientY - bounds.top)/dpr;
			hit = false;

			if (type != "cut"){
				for (var i=0; i<renderItems.length; i++){
					if (renderItems[i].contains(currentX, currentY, time_scale, frame_start)){
						renderItems[i].effectGlow();
						renderEffectView(type, renderItems[i]);
						hit = true;

						if (type != "remove"){
							canvas.removeEventListener('click', audioSelectCallback, false);
						}
					}
				}
				if (hit == false){
					canvas.removeEventListener('click', audioSelectCallback, false);
					canvas.style.cursor = "default";
					overwriteCursor = false;
				}

			} else {
				effectHandler.renderEffectView(type, null)
			}
		}
		canvas.addEventListener("click", audioSelectCallback, false);
	}

	function renderEffectView(type, audioItem){
		switch(type){
			case "cut":
				cutEffect(audioItem);

			case "eq":
				break;

			case "highPass":
				break;

			case "lowPass":
				break;

			case "pitch":
				break;

			case "tempo":
				break;

			case "remove":
				removeAudio(audioItem); 
		}

	}

	function eqEffect(){

	}

	function volumeEffect(){

	}

	function highPassEffect(){

	}

	function lowPassEffect(){

	}

	function pitchEffect(){

	}

	function tempoEffect(){

	}

	function cutEffect(){
		//this should render any modal -> instead it should change cursor to sisors and split the track at highlighted position -> creating two tracks
		//cursor should snap to bar markers inside tracks
	}

	function removeAudio(audio){
		console.log("Removing audio with ID", audio.id);
		dataStore.deleteData(audio.id);
		renderItems = utils.removeFromArrayById(renderItems, audio.id);
	}
	this.renderEffectView = renderEffectView;
	this.effectClicker = effectClicker;
}

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
	computeEffectsX: computeEffectsX,
	effectHandler: effectHandler
}