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
		// htmlElement = document.getElementById(type+"I");
		// htmlElement.setAttribute("text-shadow", "5px 5px 5px #ccc");
		// makeCursorChange(type);

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
						renderEffectView(type, renderItems[i], null);
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
				renderEffectView(type, null, null)
			}
		}
		canvas.addEventListener("click", audioSelectCallback, false);
	}

	function updateEqKnobs(value1, value2, value3, value21, value22, value23, id, audioId){
		$('#eqKnob1').val(value1);
		$('#eqKnob2').val(value2);
		$('#eqKnob3').val(value3);
		$('#eqKnob21').val(value21);
		$('#eqKnob22').val(value22);
		$('#eqKnob23').val(value23);
		knob = document.getElementById("eqKnob1");
		knob.effectId = id;
		knob.audioId = audioId;
		knob = document.getElementById("eqKnob2");
		knob.effectId = id;
		knob.audioId = audioId;
		knob = document.getElementById("eqKnob3");
		knob.effectId = id;
		knob.audioId = audioId;
		knob = document.getElementById("eqKnob21");
		knob.effectId = id;
		knob.audioId = audioId;
		knob = document.getElementById("eqKnob22");
		knob.effectId = id;
		knob.audioId = audioId;
		knob = document.getElementById("eqKnob23");
		knob.effectId = id;
		knob.audioId = audioId;
	}

	function renderEffectView(type, audioItem, effect){
		switch(type){
			case "cut":
				cutEffect();
				break;

			case "eq":
				modal = document.getElementById("eqModal");
				modal.style.display = "block";

				if (effect != null){
					//Set inputs to values of effect 
					updateEqKnobs(effect["high"]["start"], effect["mid"]["start"], effect["low"]["start"], 
								  effect["high"]["target"], effect["mid"]["target"], effect["low"]["target"], 
								  effect["id"], audioItem.id);

					sc = document.getElementById("strengthCurveEQ");
					sc.value = effect["strength_curve"];
					sc.effectId = effect["id"];
					sc.audioId = audioItem.id;

					start = document.getElementById("eqStart");
					start.value = effect['start'];
					start.effectId = effect["id"];
					start.audioId = audioItem.id;

					end = document.getElementById("eqEnd");
					end.value = effect['end'];
					end.effectId = effect["id"];
					end.audioId = audioItem.id;

				} else {
					//Refresh inputs - this is a fresh effect
					var id = utils.guid();
					updateEqKnobs(0, 0, 0, 0, 0, 0, id, audioItem.id);

					sc = document.getElementById("strengthCurveEQ");
					sc.value = "continous";
					sc.effectId = id;
					sc.audioId = audioItem.id;

					start = document.getElementById("eqStart");
					start.value = 0;
					start.effectId = id;
					start.audioId = audioItem.id;

					end = document.getElementById("eqEnd");
					end.value = 0;
					end.effectId = id;
					end.audioId = audioItem.id;
				}

				break;

			case "volume":
				modal = document.getElementById("volumeModal");
				modal.style.display = "block";
				break;

			case "highPass":
				modal = document.getElementById("highPassModal");
				modal.style.display = "block";
				break;

			case "lowPass":
				modal = document.getElementById("lowPassModal");
				modal.style.display = "block";
				break;

			case "pitch":
				modal = document.getElementById("pitchModal");
				modal.style.display = "block";
				break;

			case "tempo":
				modal = document.getElementById("tempoModal");
				modal.style.display = "block";
				break;

			case "remove":
				removeAudio(audioItem); 
				break;
		}

	}

	function updateEffectStart(audioId, effectId, start){
		console.log("Effect update start req", audioId, effectId, start);
	}

	function updateEffectEnd(audioId, effectId, end){
		console.log("Effect end req", audioId, effectId, end);

	}

	function updateStrengthCurve(audioId, effectId, strengthCurve){
		console.log("Effect strengthCurve req", audioId, effectId, strengthCurve);
	}

	function eqEffect(audioId, effectId, value, type){
		console.log("Effect Knob update", audioId, effectId, value, type);
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
	this.eqEffect = eqEffect;
	this.updateEffectStart = updateEffectStart;
	this.updateEffectEnd = updateEffectEnd;
	this.updateStrengthCurve = updateStrengthCurve;
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