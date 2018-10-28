var Settings = require("./settings");
	utils = require("./utils");
	Theme = require("./theme");
	timelineScroll = require("./ui-scroll");
	uiExterior = require("./ui-exterior");

var time_scale = Settings.time_scale;
time_scale = 60;
var tickMark1;
var tickMark2;
var tickMark3;

function time_scaled() {
	/*
	 * Subdivison LOD
	 * time_scale refers to number of pixels per unit
	 * Eg. 1 inch - 60s, 1 inch - 60fps, 1 inch - 6 mins
	 */
	var div = 60;

	tickMark1 = time_scale / div;
	tickMark2 = 2 * tickMark1;
	tickMark3 = 10 * tickMark1;

}

time_scaled();

function timeline(dataStore, dispatcher) {
	var canvas = document.getElementById("timeline-canvas");
	var ctx = canvas.getContext('2d');
	var dpr = window.devicePixelRatio; 
	var scroll_canvas = new timelineScroll.timelineScroll(dataStore, dispatcher);
	var track_canvas = new uiExterior.trackCanvas(dataStore, dispatcher);

	function resize() {
		parentDiv = document.getElementById("timeline")
		canvas.width = parentDiv.offsetWidth;
		canvas.height = parentDiv.offsetHeight;
		dataStore.updateUi("lineHeight", canvas.height*Settings.lineHeightProportion)
		scroll_canvas.resize();
		track_canvas.resize();
	}

	function setTimeScale() {
		var v = dataStore.getData("ui", "timeScale");
		if (time_scale !== v) {
			time_scale = v;
			time_scaled();
		}
	}

	function paint() {
		scroll_canvas.paint();
		track_canvas.paint();

		time_scaled();
		currentTime = dataStore.getData("ui", "currentTime");
		frame_start =  dataStore.getData("ui", "scrollTime");

		var units = time_scale / tickMark1; //For now timescale is taken from settings - this should be updated later as user zooms into timeline
		var count = canvas.width / tickMark1;
		var offsetUnits = (frame_start * time_scale) % units;
		var width = canvas.width;
		var height = canvas.height;

		//TODO: Lines and text size should scale relative to size of canvas
		ctx.fillStyle = "#343434";
		ctx.fillRect(0, 0, width, height);
		ctx.save();
		ctx.scale(dpr, dpr);

		ctx.lineWidth = 1;

		for (i = 0; i < count; i++) {
			x = i * units - offsetUnits;x

			// vertical lines
			ctx.strokeStyle = "#535353";
			ctx.beginPath();
			ctx.moveTo(x, 5);
			ctx.lineTo(x, height);
			ctx.stroke();

			ctx.fillStyle = Theme.d;
			ctx.textAlign = 'center';

			var t = (i * units) / time_scale + frame_start;
			if (t != 0){
				t = utils.format_friendly_seconds(t);
				ctx.fillText(t, x, 15);
			}
		}
		units = time_scale / tickMark2;
		count = (width) / units;

		// marker lines - main
		for (i = 0; i < count; i++) {
			ctx.strokeStyle = Theme.d;
			ctx.beginPath();
			x = i * units - offsetUnits;
			ctx.moveTo(x, 0);
			ctx.lineTo(x, 8);
			ctx.stroke();
		}

		var mul = tickMark3 / tickMark2;
		units = time_scale / tickMark3;
		count = (width + offsetUnits) / units;

		// small ticks
		for (i = 0; i < count; i++) {
			if (i % mul === 0) continue;
			ctx.strokeStyle = Theme.c;
			ctx.beginPath();
			x = i * units - offsetUnits;
			ctx.moveTo(x, 0);
			ctx.lineTo(x, 5);
			ctx.stroke();
		}

		var trackLayers = dataStore.getData("ui", "tracks");
		var lineHeight = dataStore.getData("ui", "lineHeight"); //TODO line height should be updated as more track layers are added - if track layers extend view
		var offset = dataStore.getData("ui", "trackTimelineOffset");

		for (var i = 0; i <= trackLayers; i++){
			ctx.strokeStyle = "#535353";
			ctx.beginPath();
			ctx.moveTo(0, (offset + i*lineHeight)/dpr);
			ctx.lineTo(width, (offset + i*lineHeight)/dpr);
			ctx.stroke();
		}

		ctx.restore()

	}

	// document.addEventListener('mousemove', onMouseMove);

	// function onMouseMove(e) {
	// 	canvasBounds = canvas.getBoundingClientRect();
	// 	var mx = e.clientX - canvasBounds.left , my = e.clientY - canvasBounds.top;
	// 	onPointerMove(mx, my);
	// }

	// var pointerdidMoved = false;
	// var pointer = null;

	// function onPointerMove(x, y) {
	// 	if (mousedownItem) return;
	// 	pointerdidMoved = true;
	// 	pointer = {x: x, y: y};
	// }

	// canvas.addEventListener('mouseout', function() {
	// 	pointer = null;
	// });

	this.paint = paint;
	this.resize = resize;
}

module.exports = {
	timeline: timeline
};