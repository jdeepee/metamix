require("jquery-knob");

function renderEqView(start, end, value1, value2, value3, value21, value22, value23, wrapper, effectHandler, dataStore){
	columnInputContainer = document.createElement("div");
	columnInputContainer.id = "eqColumnInputContainer";
	columnInputContainer.classList.add("column-input-container");

	barInputContainer = document.createElement("div");
	barInputContainer.id = "eqBarInputContainer";
	barInputContainer.classList.add("input-container");

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

	barDownStart = document.createElement("button");
	barDownStart.innerHTML = "&#8595;"
	barDownStart.counter = 0;
	barDownStart.barMarkers = [];
	barDownStart.id = "barDownStart";

	barUpStart = document.createElement("button");
	barUpStart.innerHTML = "&#8593;";
	barUpStart.id = "barUpStart";
	barUpStart.counter = 0;
	barUpStart.barMarkers = [];

	counter = document.createElement("p");
	counter.id = "barStartCounter";
	counter.innerHTML = 0;

	barDownStart.onclick = function(){
		barIndex = this.counter - 1;
		barValue = this.barMarkers[barIndex];
		if (barValue != undefined){
			this.counter = barIndex;
			barUpStart.counter = barIndex;

			counter.innerHTML = barIndex;
			startInput.value = barValue;
			startInput.oninput();
		}
	}

	barUpStart.onclick = function(){
		barIndex = this.counter + 1;
		barValue = this.barMarkers[barIndex-1];
		if (barValue != undefined){
			this.counter = barIndex;
			barDownStart.counter = barIndex;

			counter.innerHTML = barIndex;
			startInput.value = barValue;
			startInput.oninput();
		}
	}

	barDownEnd = document.createElement("button");
	barDownEnd.innerHTML = "&#8595;"
	barDownEnd.counter = 0;
	barDownEnd.barMarkers = [];
	barDownEnd.id = "barDownEnd";

	barUpEnd = document.createElement("button");
	barUpEnd.innerHTML = "&#8593;";
	barUpEnd.counter = 0;
	barUpEnd.barMarkers = [];
	barUpEnd.id = "barUpEnd";

	counter2 = document.createElement("p");
	counter2.id = "barEndCounter";
	counter2.innerHTML = 0;

	barDownEnd.onclick = function(){
		barIndex = this.counter - 1;
		barValue = this.barMarkers[barIndex];
		if (barValue != undefined){
			this.counter = barIndex;
			barUpEnd.counter = barIndex;

			counter2.innerHTML = barIndex;
			endInput.value = barValue;
			endInput.oninput();
		}
	}

	barUpEnd.onclick = function(){
		barIndex = this.counter + 1;
		barValue = this.barMarkers[barIndex-1];
		if (barValue != undefined){
			this.counter = barIndex;
			barDownEnd.counter = barIndex;

			counter2.innerHTML = barIndex;
			endInput.value = barValue;
			endInput.oninput();
		}
	}

	barInputContainer.appendChild(barDownStart);
	barInputContainer.appendChild(counter);
	barInputContainer.appendChild(barUpStart);
	barInputContainer.appendChild(barDownEnd);
	barInputContainer.appendChild(counter2);
	barInputContainer.appendChild(barUpEnd);
	columnInputContainer.appendChild(barInputContainer);
	columnInputContainer.appendChild(inputContainer);

	wrapper.appendChild(columnInputContainer);

	heading = document.createElement('h4');
	heading.innerHTML = "Highs";

	knob1 = document.createElement("input");
	knob1.id = "eqKnob1";
	knob1.setAttribute("data-cursor", "10");
	knob1.setAttribute("value", value1);
	knob1.setAttribute("data-thickness", 0.25);
	knob1.setAttribute("data-font", "Advanced LED Board-7")
	eqContainer.append(heading);
	eqContainer.appendChild(knob1);

	heading = document.createElement('h4');
	heading.innerHTML = "Mids";
	knob2 = document.createElement("input");
	knob2.id = "eqKnob2";
	knob2.setAttribute("data-cursor", "10");
	knob2.setAttribute("value", value2);
	knob2.setAttribute("data-thickness", 0.25);
	eqContainer.appendChild(heading);
	eqContainer.appendChild(knob2);

	heading = document.createElement('h4');
	heading.innerHTML = "Lows";
	knob3 = document.createElement("input");
	knob3.id = "eqKnob3";
	knob3.setAttribute("data-cursor", "10");
	knob3.setAttribute("value", value3);
	knob3.setAttribute("data-thickness", 0.25);
	eqContainer.appendChild(heading);
	eqContainer.appendChild(knob3);

	heading = document.createElement('h4');
	heading.innerHTML = "Highs";
	knob1 = document.createElement("input");
	knob1.id = "eqKnob21";
	knob1.setAttribute("data-cursor", "10");
	knob1.setAttribute("value", value21);
	knob1.setAttribute("data-thickness", 0.25);
	eqContainer2.append(heading);
	eqContainer2.appendChild(knob1);

	heading = document.createElement('h4');
	heading.innerHTML = "Mids";
	knob2 = document.createElement("input");
	knob2.id = "eqKnob22";
	knob2.setAttribute("data-cursor", "10");
	knob2.setAttribute("value", value22);
	knob2.setAttribute("data-thickness", 0.25);
	eqContainer2.appendChild(heading);
	eqContainer2.appendChild(knob2);

	heading = document.createElement('h4');
	heading.innerHTML = "Lows";
	knob3 = document.createElement("input");
	knob3.id = "eqKnob23";
	knob3.setAttribute("data-cursor", "10");
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
		'dynamicDraw': true,   
		'release' : function (v) { effectHandler.eqEffect(this.$.context.audioId, this.$.context.effectId, v, "high", "start")}
	}

	$("#eqKnob1").knob(knobParams);
	delete knobParams["release"];
	knobParams['release'] = function(v){ effectHandler.eqEffect(this.$.context.audioId, this.$.context.effectId, v, "mid", "start")};
	$("#eqKnob2").knob(knobParams);
	delete knobParams["release"];
	knobParams['release'] = function(v){ effectHandler.eqEffect(this.$.context.audioId, this.$.context.effectId, v, "low", "start")};
	$("#eqKnob3").knob(knobParams);
	delete knobParams['release'];
	knobParams['release'] = function(v){ effectHandler.eqEffect(this.$.context.audioId, this.$.context.effectId, v, "high", "target")};
	$("#eqKnob21").knob(knobParams);
	delete knobParams['release'];
	knobParams['release'] = function(v){ effectHandler.eqEffect(this.$.context.audioId, this.$.context.effectId, v, "mid", "target")};
	$("#eqKnob22").knob(knobParams);
	delete knobParams['release']
	knobParams['release'] = function(v){ effectHandler.eqEffect(this.$.context.audioId, this.$.context.effectId, v, "low", "target")};
	$("#eqKnob23").knob(knobParams);
}

module.exports = {
	renderEqView: renderEqView
}