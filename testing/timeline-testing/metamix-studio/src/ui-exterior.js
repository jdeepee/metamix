var Settings = require("./settings");
	utils = require("./utils");
	Theme = require("./theme");

function Rect() {
	
}

Rect.prototype.set = function(x, y, w, h, color, outline) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.color = color;
	this.outline = outline;
};

Rect.prototype.paint = function(ctx) {
	ctx.fillStyle = Theme.b;  // // 'yellow';
	ctx.strokeStyle = Theme.c;

	this.shape(ctx);

	ctx.stroke();
	ctx.fill();
};

Rect.prototype.shape = function(ctx) {
	ctx.beginPath();
	ctx.rect(this.x, this.y, this.w, this.h);
};

Rect.prototype.contains = function(x, y) {
	return x >= this.x && y >= this.y
	 && x <= this.x + this.w && y <= this.y + this.h;
};

function zoom(dataStore, dispatcher){
	var div = document.getElementById("zoomColumn");
	
	this.resize = function () {
		var range = document.getElementById("rangeSlider");
		utils.style(range, {
			width: (div.offsetWidth-20).toString() + "px",
		});
	}

	function changeRange() {
		dispatcher.fire('update.scale', range.value);
	}

	var range = document.createElement('input');
	range.setAttribute("id", "rangeSlider");
	range.type = "range";
	range.value = Settings.time_scale;
	range.min = 1;
	range.max = 100;
	range.step = 0.5;
	range.steps = 10;

	utils.style(range, {
		width: (div.offsetWidth-20).toString() + "px"
	});

	var draggingRange = 0;

	range.addEventListener('mousedown', function() {
		draggingRange = 1;
	});

	range.addEventListener('mouseup', function() {
		draggingRange = 0;
		changeRange();
	});

	range.addEventListener('mousemove', function() {
		if (!draggingRange) return;
		changeRange();
	});

	div.appendChild(range)

}

function trackCanvas(dataStore, dispatcher){
	var canvas = document.getElementById("left-column-canvas");
	var width = canvas.width;
	var height = canvas.height;
	var dpr = window.devicePixelRatio; 
	var ctx = canvas.getContext('2d');
	var zoomBar = new zoom(dataStore, dispatcher);

	this.resize = function() {
		parentDiv = document.getElementById("left-column")
		canvas.width = parentDiv.offsetWidth;
		canvas.height = parentDiv.offsetHeight;
		height = canvas.height;
		width = canvas.width;
		zoomBar.resize();
	}

	this.paint = function() {
		var trackLayers = dataStore.getData("ui", "tracks");
		var lineHeight = dataStore.getData("ui", "lineHeight"); //TODO line height should be updated as more track layers are added - if track layers extend view
		var offset = dataStore.getData("ui", "trackTimelineOffset");

		ctx.fillStyle = Theme.a;
		ctx.fillRect(0, 0, width, height);
		ctx.save();
		ctx.scale(dpr, dpr);

		for (var i = 0; i <= trackLayers; i++){
			ctx.strokeStyle = Theme.b;
			ctx.beginPath();
			ctx.moveTo(0, ((offset + i*lineHeight)/dpr)+i);
			ctx.lineTo(width, ((offset + i*lineHeight)/dpr)+i);
			ctx.stroke();

			if (i != 0){
				ctx.fillStyle = Theme.d;
				ctx.textAlign = 'center';
				ctx.fillText(i.toString(), width/4, ((offset + i*lineHeight)/dpr)-(lineHeight/4));
			}
		}
		ctx.restore();
	}
}

//Function which renders effect icons and their wrapping divs
function effectMenu(effectHandler){
	var effectDiv = document.getElementById("top-toolbar");
	effectDiv.style.backgroundColor = Theme.a;
	effectDiv.classList.add("flex-container");

	var cutDiv = document.createElement('div');
	cutDiv.id = "cut";
	cutDiv.onclick = function() {effectHandler.effectClicker("cut")};
	cutDiv.classList.add("flex-item");
	cutDiv.innerHTML = '<i class="material-icons" style="font-size: 5rem">content_cut</i><p>Cut</p>';

	var eqDiv = document.createElement('div');
	eqDiv.id = "eq";
	eqDiv.onclick = function() {effectHandler.effectClicker("eq")};
	eqDiv.classList.add("flex-item");
	eqDiv.innerHTML = '<i class="material-icons" style="font-size: 5rem">tune</i><p>EQ</p>';

	var volumeDiv = document.createElement('div');
	volumeDiv.id = "volume";
	volumeDiv.onclick = function() {effectHandler.effectClicker("volume")};
	volumeDiv.classList.add("flex-item");
	volumeDiv.innerHTML = '<i class="material-icons" style="font-size: 5rem">volume_up</i><p>Volume Modulation</p>';

	var highPassDiv = document.createElement('div');
	highPassDiv.id = "highPass";
	highPassDiv.onclick = function() {effectHandler.effectClicker("highPass")};
	highPassDiv.classList.add("flex-item");
	highPassDiv.innerHTML = '<i class="material-icons" style="font-size: 5rem">blur_linear</i><p>High Pass Filter</p>';

	var lowPassDiv = document.createElement('div');
	lowPassDiv.id = "lowPass";
	lowPassDiv.onclick = function() {effectHandler.effectClicker("lowPass")};
	lowPassDiv.classList.add("flex-item");
	lowPassDiv.innerHTML = '<i class="material-icons" style="font-size: 5rem; moz-transform: scaleX(-1); -o-transform: scaleX(-1); -webkit-transform: scaleX(-1); transform: scaleX(-1); filter: FlipH -ms-filter: "FlipH";">blur_linear</i><p>Low Pass Filter</p>';

	var pitchDiv = document.createElement('div');
	pitchDiv.id = "pitch";
	pitchDiv.onclick = function() {effectHandler.effectClicker("pitch")};
	pitchDiv.classList.add("flex-item");
	pitchDiv.innerHTML = '<i class="material-icons" style="font-size: 5rem">trending_up</i><p>Pitch Shift</p>';

	var tempoDiv = document.createElement('div');
	tempoDiv.id = "tempo";
	tempoDiv.onclick = function() {effectHandler.effectClicker("tempo")};
	tempoDiv.classList.add("flex-item");
	tempoDiv.innerHTML = '<i class="material-icons" style="font-size: 5rem">fast_rewind</i><i class="material-icons" style="font-size: 5rem">fast_forward</i><p>Tempo Modulation</p>';

	var removeDiv = document.createElement('div');
	removeDiv.id = "remove";
	removeDiv.onclick = function() {effectHandler.effectClicker("remove")};
	removeDiv.classList.add("flex-item");
	removeDiv.innerHTML = '<i class="material-icons" style="font-size: 5rem" id="removeI">cancel</i><p>Remove Audio</p>';

	effectDiv.appendChild(cutDiv);
	effectDiv.appendChild(eqDiv);
	effectDiv.appendChild(volumeDiv);
	effectDiv.appendChild(highPassDiv);
	effectDiv.appendChild(lowPassDiv);
	effectDiv.appendChild(pitchDiv);
	effectDiv.appendChild(tempoDiv);
	effectDiv.appendChild(removeDiv);
}

module.exports = {
	trackCanvas: trackCanvas,
	effectMenu: effectMenu
};