require("jquery-knob");

function renderEqView(start, end, value1, value2, value3, value21, value22, value23, wrapper, effectHandler, dataStore){
	inputContainer = document.createElement("div");
	inputContainer.id = "eqInputContainer";
	inputContainer.classList.add("input-container");

	knobContainer = document.createElement("div");
	knobContainer.id = "knobsContainer";
	knobContainer.classList.add("knobs-container");

	eqContainer = document.createElement("div");
	eqContainer.id = "eqContainer1";
	eqContainer.classList.add("knob-container");

	eqContainer2 = document.createElement("div");
	eqContainer2.id = "eqContainer2";
	eqContainer2.classList.add("knob-container-hidden");
	knobContainer.appendChild(eqContainer);
	knobContainer.appendChild(eqContainer2);

	startInput = document.createElement("input");
	startInput.id = "eqStart";
	startInput.innerHTML = "<br>";
	startInput.value = start;
	startInput.oninput = function(){
		effectHandler.updateEffectStart(this.audioId, this.effectId, this.value);
		dataStore.updateUi("lastStart", this.value);
	}
	inputContainer.appendChild(startInput);

	endInput = document.createElement("input");
	endInput.id = "eqEnd";
	endInput.value = end;
	endInput.oninput = function(){
		effectHandler.updateEffectEnd(this.audioId, this.effectId, this.value);
		dataStore.updateUi("lastEnd", this.value);
	}
	inputContainer.appendChild(endInput);
	wrapper.appendChild(inputContainer);

	heading = document.createElement('h4');
	heading.innerHTML = "Highs";

	knob1 = document.createElement("input");
	knob1.id = "eqKnob1";
	knob1.setAttribute("data-cursor", true);
	knob1.setAttribute("value", value1);
	knob1.setAttribute("data-thickness", 0.25);
	// knob1.setAttribute("data-font", "Advanced LED Board-7")
	eqContainer.append(heading);
	eqContainer.appendChild(knob1);

	heading = document.createElement('h4');
	heading.innerHTML = "Mids";
	knob2 = document.createElement("input");
	knob2.id = "eqKnob2";
	knob2.setAttribute("data-cursor", true);
	knob2.setAttribute("value", value2);
	knob2.setAttribute("data-thickness", 0.25);
	eqContainer.appendChild(heading);
	eqContainer.appendChild(knob2);

	heading = document.createElement('h4');
	heading.innerHTML = "Lows";
	knob3 = document.createElement("input");
	knob3.id = "eqKnob3";
	knob3.setAttribute("data-cursor", true);
	knob3.setAttribute("value", value3);
	knob3.setAttribute("data-thickness", 0.25);
	eqContainer.appendChild(heading);
	eqContainer.appendChild(knob3);

	heading = document.createElement('h4');
	heading.innerHTML = "Highs";
	knob1 = document.createElement("input");
	knob1.id = "eqKnob21";
	knob1.setAttribute("data-cursor", true);
	knob1.setAttribute("value", value21);
	knob1.setAttribute("data-thickness", 0.25);
	eqContainer2.append(heading);
	eqContainer2.appendChild(knob1);

	heading = document.createElement('h4');
	heading.innerHTML = "Mids";
	knob2 = document.createElement("input");
	knob2.id = "eqKnob22";
	knob2.setAttribute("data-cursor", true);
	knob2.setAttribute("value", value22);
	knob2.setAttribute("data-thickness", 0.25);
	eqContainer2.appendChild(heading);
	eqContainer2.appendChild(knob2);

	heading = document.createElement('h4');
	heading.innerHTML = "Lows";
	knob3 = document.createElement("input");
	knob3.id = "eqKnob23";
	knob3.setAttribute("data-cursor", true);
	knob3.setAttribute("value", value23);
	knob3.setAttribute("data-thickness", 0.25);
	eqContainer2.appendChild(heading);
	eqContainer2.appendChild(knob3);
	wrapper.appendChild(knobContainer);

	knobParams = {
		'min':-2,
		'max':2,
		'step': 0.01,
		'angleArc': 250,
		'angleOffset': -125,
		'width': "300%",
		'height': "300%",
		'bgColor': "black",
		'fgColor': '#4286f4',
		'release' : function (v) { effectHandler.eqEffect(this.$.context.audioId, this.$.context.effectId, v, "highs")}
	}

	$("#eqKnob1").knob(knobParams);
	delete knobParams["release"];
	knobParams['release'] = function(v){ effectHandler.eqEffect(this.$.context.audioId, this.$.context.effectId, v, "mids")};
	$("#eqKnob2").knob(knobParams);
	delete knobParams["release"];
	knobParams['release'] = function(v){ effectHandler.eqEffect(this.$.context.audioId, this.$.context.effectId, v, "lows")};
	$("#eqKnob3").knob(knobParams);
	delete knobParams['release'];
	knobParams['release'] = function(v){ effectHandler.eqEffect(this.$.context.audioId, this.$.context.effectId, v, "highsTarget")};
	$("#eqKnob21").knob(knobParams);
	delete knobParams['release'];
	knobParams['release'] = function(v){ effectHandler.eqEffect(this.$.context.audioId, this.$.context.effectId, v, "midsTarget")};
	$("#eqKnob22").knob(knobParams);
	delete knobParams['release']
	knobParams['release'] = function(v){ effectHandler.eqEffect(this.$.context.audioId, this.$.context.effectId, v, "lowsTarget")};
	$("#eqKnob23").knob(knobParams);
}

module.exports = {
	renderEqView: renderEqView
}