(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function Do(parent) {
	var listeners = [];
	this.do = function(callback) {
		listeners.push(callback);
	};
	this.undo = function(callback) {
		listeners.splice(listeners.indexOf(callback), 1);
	};
	this.fire = function() {
		for (var v = 0; v < listeners.length; v++) {
			listeners[v].apply(parent, arguments);
		}
	};
}

if (typeof(module) === 'object') module.exports = Do;

},{}],2:[function(require,module,exports){
module.exports={
  "version": "0.0.1"
}
},{}],3:[function(require,module,exports){
var package_json = require('../package.json'),
	Settings = require('./settings'),
	Do = require('do.js');
	utils = require("./utils");

// Data Store with a source of truth
function DataStore() {
	this.data = undefined;
	this.ui = undefined;

	this.initData = function initData(audio, tracks){
		this.data = audio;

		var lineWidth, lineHeight = utils.getDivSize("timeline");
		lineHeight = lineHeight * Settings.lineHeightProportion;

		this.ui = {
			currentTime: 0,
			totalTime: Settings.default_length,
			scrollTime: 0,
			timeScale: Settings.time_scale,
			tracks: tracks,
			trackTimelineOffset: Settings.trackTimelineOffset, //Offset between top of studio timeline and start of track items
			lineHeight: lineHeight, //Size of track items
			xScrollTime: 0
		};
	}

	this.updateData = function updateData(audioId, key, value) {
		for (var i in this.data) {
			if (this.data[i].id == audioId) {
				this.data[i][key] = value;
				break;
			}
		}
	}

	this.addEffect = function addEffect(audioId, effectObject) {
		for (var i in this.data) 
			if (this.data[i].id == audioId){
				this.data[i].effects.push(effectObject)
				break;
			}
	}

	this.updateEffect = function updateEffect(audioId, effectId, effectObject) {
		for (var i in this.data){
			if (this.data[i].id == audioId){
				for (var i2 in this.data[i].effects){
					if (this.data[i].effects[i2].id == effectId){
						this.data[i].effects[i2] = effectObject;
						break;
					}
				}
			}
		}
	}

	this.updateUi = function updateUi(key, value) {
		this.ui[key] = value
	}

	this.getData = function getData(type, key) {
		if (type == "data"){
			return this.data;

		} else if (type == "ui"){
			if (key == undefined) {
				return this.ui;

			} else {
				return this.ui[key];
			}
		}
	}
}

module.exports = DataStore;

},{"../package.json":2,"./settings":5,"./utils":12,"do.js":1}],4:[function(require,module,exports){
/**************************/
// Dispatcher
/**************************/

function Dispatcher() {

	var event_listeners = {

	};

	function on(type, listener) {
		if (!(type in event_listeners)) {
			event_listeners[type] = [];
		}
		var listeners = event_listeners[type];
		listeners.push(listener);
	}

	function fire(type) {
		var args = Array.prototype.slice.call(arguments);
		args.shift();
		var listeners = event_listeners[type];
		if (!listeners) return;
		for (var i = 0; i < listeners.length; i++) {
			var listener = listeners[i];
			listener.apply(listener, args);
		}
	}

	this.on = on;
	this.fire = fire;

}

module.exports = Dispatcher;
},{}],5:[function(require,module,exports){
//Time scale definitions
var DEFAULT_TIME_SCALE = 60;

//Timeline component sizes (% of screen size)
var timelineToolbarHeight = 0.05
var timelineToolbarWidth = 1

var trackColumnWidth = 0.2
var trackColumnHeight = 0.85

var timelineWidth = 0.8
var timelineHeight = 0.85

var topTimelineWidth = 0.8
var topTimelineHeight = 0.6

var lineHeightProportion = 0.22 //This value should be worked out on size of studio vs number of tracks so that we can fill the entire space
var trackTimelineOffset = 40;

// Dimensions
module.exports = {
	MARKER_TRACK_HEIGHT: 60,
	TIMELINE_SCROLL_HEIGHT: 0,
	time_scale: DEFAULT_TIME_SCALE, // number of pixels to 1 second
    default_length: 600, // seconds
    trackColumnWidth: trackColumnWidth,
    trackColumnHeight: trackColumnHeight,
    timelineWidth: timelineWidth,
    timelineHeight: timelineHeight,
    topTimelineWidth: topTimelineWidth,
    topTimelineHeight: topTimelineHeight,
    timelineToolbarHeight: timelineToolbarHeight,
    timelineToolbarWidth: timelineToolbarWidth,
    lineHeightProportion: lineHeightProportion,
    trackTimelineOffset: trackTimelineOffset
};

},{}],6:[function(require,module,exports){
var ui = require("./ui"),
	Dispatcher = require("./dispatcher"),
	dataStore = require("./data-store"),
	timelineScroll = require("./ui-scroll"),
	timeline = require("./ui-main-timeline");
	Settings = require("./settings");

function Studio(audio){
	//Accepts audio and tracks. Audio is a json array of objects of each audio item to be rendered into timeline view. 
	ui.initCanvas(); //Create intial divs with canvas items inside for drawing

	//Create event listeners here to update various variables so that when paint() is called the items are painted dynamically according to what 
	//the user is doing? 
	var tracks = Math.max.apply(Math, audio.map(function(o) { return o.track; })); //Maximum number of tracks which audio occupies
	var needsResize = false;
	var data = new dataStore();
	data.initData(audio, tracks);

	var dispatcher = new Dispatcher();
	var timelineObject = new timeline.timeline(data, dispatcher);

	//Setting dispatcher functions
	dispatcher.on('time.update', function(v) {
		v = Math.max(0, v);
		data.updateUi("currentTime", v);

		// if (start_play) start_play = performance.now() - v * 1000;
		// repaintAll();
		// layer_panel.repaint(s);
	});	
	dispatcher.on('update.scrollTime', function(v) {
		v = Math.max(0, v);
		data.updateUi("scrollTime", v);
		// repaintAll();
	});
	dispatcher.on('update.scale', function(v) {
		console.log('range', v);
		data.updateUi("timeScale", v);
	});

	dispatcher.on("update.audioTime", function(id, start, end){
		data.updateData(id, "start", start);
		data.updateData(id, "end", end);
	})

	//Registering event listeners
	window.addEventListener('resize', function() {
		needsResize = true;
	});

	//Core paint routines
	function paint() {
		requestAnimationFrame(paint);
		if (needsResize == true){
			timelineObject.resize();
			needsResize = false;

		}
		timelineObject.paint();
	}

	paint();
}

window.Studio = Studio;
},{"./data-store":3,"./dispatcher":4,"./settings":5,"./ui":11,"./ui-main-timeline":9,"./ui-scroll":10}],7:[function(require,module,exports){
module.exports = {
	// photoshop colors
	a: '#343434',
	b: '#535353',
	c: '#b8b8b8',
	d: '#d6d6d6',
	audioElement: '#4286f4'
};
},{}],8:[function(require,module,exports){
var Settings = require("./settings");
	utils = require("./utils");

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
	console.log(div.offsetWidth);

	this.resize = function () {
		var range = document.getElementById("rangeSlider");
		utils.style(range, {
			width: (div.offsetWidth-20).toString() + "px",
		});
	}

	function changeRange() {
		console.log("Change range")
		dispatcher.fire('update.scale', range.value );
	}

	var range = document.createElement('input');
	range.setAttribute("id", "rangeSlider");
	range.type = "range";
	range.value = Settings.time_scale;
	range.min = 1;
	range.max = 100;
	range.step = 0.5;

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
			ctx.moveTo(0, (offset + i*lineHeight)/dpr);
			ctx.lineTo(width, (offset + i*lineHeight)/dpr);
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

module.exports = {
	trackCanvas: trackCanvas
};
},{"./settings":5,"./utils":12}],9:[function(require,module,exports){
var Settings = require("./settings");
	utils = require("./utils");
	proxy_ctx = utils.proxy_ctx,
	Theme = require("./theme");
	timelineScroll = require("./ui-scroll");
	uiExterior = require("./ui-exterior");
//Import settings/functions from other files

var tickMark1;
var tickMark2;
var tickMark3;
var frame_start;

//AudioItem class? which is used to draw each audio item + x/y containing operations 
function AudioItem() {
	
}

//Set variables for audio item
AudioItem.prototype.set = function(x, y, x2, y2, color, audioName, id, track) {
	this.x = x;
	this.y = y;
	this.x2 = x2;
	this.y2 = y2;
	this.color = color;
	this.audioName = audioName;
	this.id = id;
	this.track = track;
};

//Paint audio item in canvas
AudioItem.prototype.paint = function(ctx, outlineColor) {
	ctx.fillStyle = outlineColor;
	ctx.beginPath();
	ctx.rect(this.x, this.y, this.x2-this.x, this.y2);
	ctx.fill();
	ctx.strokeStyle = "black";
	ctx.stroke();
	ctx.fillStyle = "black";
	txtWidth = ctx.measureText(this.audioName).width;
	if (txtWidth < this.x2-this.x){
		ctx.fillText(this.audioName, this.x+txtWidth, this.y+10);
	}
};

//Check if mouse at x/y is contained in audio
AudioItem.prototype.contains = function(x, y, time_scale, frame_start) {
	// console.log("X", this.x, "Y", this.y, "X2", this.x2, "y2", this.y2)
	// console.log("Comparison", x ," >= ", (this.x + (frame_start * time_scale)), y, " >= ", this.y, x, " <= ", (this.x2 + (frame_start * time_scale)), y, "<= ", this.y + this.y2, this.id)
	//X & X2 values of audio item are normalized in accordance with the timescale and framestart so we can effectively care againsy mouse position no matter where the scroll wheel is
	return x >= (this.x + (frame_start * time_scale)) && y >= this.y  && x <= (this.x2 + (frame_start * time_scale)) && y <= this.y + this.y2;
};

//Change outline to red to notify user that they cannot slide audio over item in same track
AudioItem.prototype.alert = function(ctx, outlineColor){
	this.paint(ctx, outlineColor);
}

// AudioItem.prototype.mousedrag = function(){
// 	var t1 = x_to_time(x1 + e.dx);
// 	t1 = Math.max(0, t1);
// 	// TODO limit moving to neighbours
// 	start = t1;

// 	var t2 = x_to_time(x2 + e.dx);
// 	t2 = Math.max(0, t2);
// 	frame2.time = t2;
// }

//Gets the timescale values for each tick
function time_scaled(time_scale) {
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

function timeline(dataStore, dispatcher) {
	var canvas = document.getElementById("timeline-canvas");
	var ctx = canvas.getContext('2d');
	var dpr = window.devicePixelRatio; 
	var scroll_canvas = new timelineScroll.timelineScroll(dataStore, dispatcher); //Creates timeline scroll and gets object of timeline scroll
	var track_canvas = new uiExterior.trackCanvas(dataStore, dispatcher); //Creates exterior track canvas and gets object
	var time_scale;
	var renderItems;

	//Resize function called upon window resize - will resize canvas so that future paint operations can be correctly painted according to resize
	function resize() {
		parentDiv = document.getElementById("timeline")
		canvas.width = parentDiv.offsetWidth;
		canvas.height = parentDiv.offsetHeight;
		dataStore.updateUi("lineHeight", canvas.height*Settings.lineHeightProportion); //Update lineHeight in accordance to window height + proportion of track to window
		scroll_canvas.resize();
		track_canvas.resize();
	}

	//Core paint routine for studio view
	function paint() {
		//Paint other canvas items
		scroll_canvas.paint();
		track_canvas.paint();

		var time_scale = dataStore.getData("ui", "timeScale");
		time_scaled(time_scale);
		currentTime = dataStore.getData("ui", "currentTime"); // of marker
		frame_start = dataStore.getData("ui", "scrollTime"); //Starting time value of timeline view

		var units = time_scale / tickMark1; //For now timescale is taken from settings - this should be updated later as user zooms into timeline
		var offsetUnits = (frame_start * time_scale) % units;
		var count = (canvas.width + offsetUnits) / tickMark1; //Amount of possible main tick markers across window width
		var width = canvas.width;
		var height = canvas.height;

		//TODO: Lines and text size should scale relative to size of canvas
		ctx.fillStyle = Theme.a;
		ctx.fillRect(0, 0, width, height);
		ctx.save();
		ctx.scale(dpr, dpr);

		ctx.lineWidth = 1;

		//Iterate over count and draw main tick markers along with second(s) timestamp related to this
		for (i = 0; i < count; i++) {
			x = (i * units) - offsetUnits;

			// vertical lines
			ctx.strokeStyle = Theme.b;
			ctx.beginPath();
			ctx.moveTo(x, 5);
			ctx.lineTo(x, height);
			ctx.stroke();

			ctx.fillStyle = Theme.d;
			ctx.textAlign = 'center';

			//Get time at current tick with accordance to timescale and scroll wheel position
			var t = (i * units - offsetUnits) / time_scale + frame_start;
			if (t != 0){
				t = utils.format_friendly_seconds(t);
				ctx.fillText(t, x, 15);
			}
		}
		units = time_scale / tickMark2;
		count = (width + offsetUnits) / units;

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

		drawAudioElements(); //Draw audio elements
		ctx.restore();

		//Begin drawing marker
		var lineHeight = dataStore.getData("ui", "lineHeight");
		ctx.strokeStyle = 'red'; // Theme.c
		x = ((currentTime - (frame_start)) * time_scale)*dpr;

		//Get currentTime to input into marker
		var txt = utils.format_friendly_seconds(currentTime);
		var textWidth = ctx.measureText(txt).width;

		var base_line = (lineHeight, half_rect = textWidth / dpr);

		//Draw main line 
		ctx.beginPath();
		ctx.moveTo(x, base_line);
		ctx.lineTo(x, height);
		ctx.stroke();

		//Draw main marker body
		ctx.fillStyle = 'red'; // black
		ctx.textAlign = 'center';
		ctx.beginPath();
		ctx.moveTo(x, base_line + 5);
		ctx.lineTo(x + 5, base_line);
		ctx.lineTo(x + half_rect, base_line);
		ctx.lineTo(x + half_rect, base_line - 14);
		ctx.lineTo(x - half_rect, base_line - 14);
		ctx.lineTo(x - half_rect, base_line);
		ctx.lineTo(x - 5, base_line);
		ctx.closePath();
		ctx.fill();

		ctx.fillStyle = 'white';
		ctx.fillText(txt, x, base_line - 4);

		ctx.restore();

		needsRepaint = false;

	}

	function drawAudioElements() {
		renderItems = [];

		var trackLayers = dataStore.getData("ui", "tracks");
		var lineHeight = dataStore.getData("ui", "lineHeight"); //TODO line height should be updated as more track layers are added - if track layers extend view
		var offset = dataStore.getData("ui", "trackTimelineOffset");
		var audioData = dataStore.getData("data", "data");
		var time_scale = dataStore.getData("ui", "timeScale");
		var width = canvas.width;
		var height = canvas.height;
		var y;

		//Draw track lines
		for (var i = 0; i <= trackLayers; i++){
			y = (offset + i*lineHeight)/dpr;
			ctx.strokeStyle = Theme.b;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		}

		//Iterate over audioData and paint componenets on timeline - along will all effects associated on them
		for (var i = 0; i < audioData.length; i++){
			audioItem = audioData[i];
			track = audioItem.track;
			track = track-1;
			start = audioItem.start;
			end = audioItem.end;
			effects = audioItem.effects;
			beatMarkers = audioItem.beatMarkers;
			name = audioItem.name;
			id = audioItem.id;

			x = time_to_x(start, time_scale); //Starting x value for audio item
			x2 = time_to_x(end, time_scale); //Ending x value for audio item

			var y1 = (offset + track * lineHeight)/dpr; //Starting y value for audio item
			var y2 = (lineHeight)/dpr; //Ending y value for audio item
			// console.log("Computed values", "Track", track, "x (start x)", x, "x2 (width)", x2, "y1 (starting y)", y1, "y2 (height)", y2, 
			// 			"x2-x1", x2-x, "starting time", start, "ending time", end);
			AudioRect = new AudioItem();
			AudioRect.set(x, y1, x2, y2, Theme.audioElement, name, id, track);
			AudioRect.paint(ctx, Theme.audioElement);
			renderItems.push(AudioRect); //Add audio item to renderItems so we can process mousemove/clicks later
		}
	}

	//Convert time in seconds to x value given a timescale
	function time_to_x(s, time_scale) {
		var ds = s - frame_start;
		ds = ds * time_scale;
		return ds;
	}

	//Convert x to time given frame start and current time scale
	function x_to_time(x, time_scale) {
		return frame_start + (x) / time_scale
	}

	function normalize_x(x, time_scale, frame_start){
		return x + (frame_start * time_scale);
	}


	this.paint = paint;
	this.resize = resize;

	//mousemove eventListener to handle cursor changing to pointer upon hovering over a draggable item
	canvas.addEventListener("mousemove", function(e){
		bounds = canvas.getBoundingClientRect();
		var w = canvas.width;
		var time_scale = dataStore.getData("ui", "timeScale");
		frame_start = dataStore.getData("ui", "scrollTime");

		for (var i = 0; i < renderItems.length; i++){
			item = renderItems[i];
			if (item.contains(((e.clientX - bounds.left)/dpr + (frame_start * time_scale)), (e.clientY - bounds.top)/dpr, time_scale, frame_start)) {
				canvas.style.cursor = 'pointer';
				return;
			}
		}
		canvas.style.cursor = 'default';
	})

	//Handles "wheel" zoom events - trackpad zoom or scroll wheel zoom - also includes scroll left and right
	//Handle scroll left and right - moves timeline left and right - scroll up and down zooms into/out of timeline - then two finger 
	canvas.addEventListener("wheel", function(e){
		console.log("Wheel", e);
	})

	var draggingx = null;
	var currentDragging = null;

	//Handles dragging of movable items
	utils.handleDrag(canvas,
		function down(e){
			console.log("DOWN RAN");
			var time_scale = dataStore.getData("ui", "timeScale");
			frame_start = dataStore.getData("ui", "scrollTime");

			for (var i = 0; i < renderItems.length; i++){
				item = renderItems[i];
				if (item.contains(((e.offsetx)/dpr + (frame_start * time_scale)), (e.offsety)/dpr, time_scale, frame_start)) {
					draggingx = item.x + frame_start * time_scale
					currentDragging = item;
					currentDragging.originalX = item.x;
					currentDragging.originalY = item.y;
					canvas.style.cursor = 'grabbing';
					// console.log("Dragging x")
					// console.log(draggingx);
					return;
				}
			}
			dispatcher.fire('time.update', x_to_time((e.offsetx)/dpr, time_scale));
		},
		function move(e){
			console.log("MOVE");
			var time_scale = dataStore.getData("ui", "timeScale");
			frame_start = dataStore.getData("ui", "scrollTime");

			if (draggingx != null) {
				canvas.style.cursor = 'grabbing';
				startX = (draggingx + e.dx/dpr);
				start = startX / time_scale;
				endX = (startX + normalize_x(currentDragging.x2, time_scale, frame_start) - normalize_x(currentDragging.x, time_scale, frame_start))
				end = endX / time_scale

				//Still need to handle X snapping & Y movement
				for (var i = 0; i < renderItems.length; i++){
					item = renderItems[i];
					if (item.track == currentDragging.track && item.id != currentDragging.id){
						if (normalize_x(item.x, time_scale, frame_start) >= currentDragging.originalX){
							if (endX >= normalize_x(item.x, time_scale, frame_start)){
								console.log("Computed block ran");
								console.log("Betwee items", item, currentDragging)
								diff = endX - startX;
								endX = normalize_x(item.x, time_scale, frame_start);
								startX = endX - diff;
								start = startX / time_scale;
								end = endX /time_scale;

								console.log("New values", startX, endX, start, end)
							}
						} else if (normalize_x(item.x2, time_scale, frame_start) <= currentDragging.originalX){
							console.log("ifelse");
							if (startX <= normalize_x(item.x2, time_scale, frame_start)){
								console.log("Computed block ran upper");
								console.log("Betwee items", item, currentDragging)
								diff = endX - startX;
								startX = normalize_x(item.x2, time_scale, frame_start);
								endX = startX + diff;
								start = startX / time_scale;
								end = endX /time_scale;

								console.log("New values", startX, endX, start, end)
							}
						}
					}
				}
				// console.log("startx", startX, "start", start, "endX", endX, "end", end);

				//Mouse should not be able to go past 0 - thus if mouse go pasts 0 starts will be updated to 0 and end values will be increased by negative start value to ensure we dont loose length of audio
				if (startX < 0){
					end = end - start;
					endX = endX - startX;
					startX = 0;
					start = 0;
					console.log("X block ran");
				}

				currentDragging.x = startX
				currentDragging.x2 = endX

				dispatcher.fire('update.audioTime', currentDragging.id, start, end);
				// var audioData = dataStore.getData("data", "data");
				// console.log(audioData);

			} else {
				dispatcher.fire('time.update', x_to_time((e.offsetx)/dpr, time_scale));
			}
		},
		function up(e){
			console.log("UP");
			draggingx = null;
			currentDragging = null;
			canvas.style.cursor = 'pointer';
		});
}

module.exports = {
	timeline: timeline
};
},{"./settings":5,"./theme":7,"./ui-exterior":8,"./ui-scroll":10,"./utils":12}],10:[function(require,module,exports){
var Theme = require("./theme")
	utils = require("./utils")

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

function timelineScroll(dataStore, dispatcher){
	var canvas = document.getElementById("top-timeline-canvas");
	var ctx = canvas.getContext('2d');
	var dpr = window.devicePixelRatio; 
	var scrollTop = 0, scrollLeft = 0, SCROLL_HEIGHT;
	var layers = dataStore.getData("ui", "layers");

	var TOP_SCROLL_TRACK = 20;
	var MARGINS = 0;

	var scroller = {
		left: 0,
		grip_length: 0,
		k: 1
	};

	var scrollRect = new Rect();
	var height = canvas.height;
	var width = canvas.width;

	this.repaint = function(){
		paint(ctx);
	}

	this.scrollTo = function(s, y) {
		console.log('Scroll to function called arguments are below ')
		console.log(s)
		console.log(y)
		scrollTop = s * Math.max(layers.length * LINE_HEIGHT - SCROLL_HEIGHT, 0);
		repaint();
	};

	this.resize = function resize() {
		parentDiv = document.getElementById("top-timeline")
		canvas.width = parentDiv.offsetWidth;
		canvas.height = parentDiv.offsetHeight;
		height = canvas.height;
		width = canvas.width;
	}

	this.paint = function() {
		var totalTime = dataStore.getData("ui", "totalTime")
		var scrollTime = dataStore.getData("ui", "scrollTime")
		var currentTime = dataStore.getData("ui", "currentTime")
		
		var pixels_per_second = dataStore.getData("ui", "timeScale")

		ctx.save();

		var w = width;
		var h = 16; // TOP_SCROLL_TRACK;
		var h2 = h;

		ctx.fillStyle = Theme.a;
		ctx.fillRect(0, 0, width, height);
		ctx.translate(MARGINS, 5);

		// outline scroller
		ctx.beginPath();
		ctx.strokeStyle = Theme.b;
		ctx.rect(0, height/4, w, height/3);
		ctx.stroke();
		
		var totalTimePixels = totalTime * pixels_per_second;
		var k = w / totalTimePixels;
		scroller.k = k;

		var grip_length = (w * k)/dpr;

		scroller.grip_length = grip_length;

		scroller.left = scrollTime / totalTime * w;
		
		scrollRect.set(scroller.left, height/4, scroller.grip_length, height/3);
		scrollRect.paint(ctx);

		var r = currentTime / totalTime * w;		

		ctx.fillStyle = Theme.c;
		ctx.lineWidth = 2;
		
		ctx.beginPath();
		
		// circle
		// ctx.arc(r, h2 / 2, h2 / 1.5, 0, Math.PI * 2);

		// line
		ctx.rect(r, height/4, 2, height/3);
		ctx.fill()

		ctx.restore();

	}

	/** Handles dragging for scroll bar **/

	var draggingx = null;

	utils.handleDrag(canvas,
		function down(e) {
			console.log("DOWN")
			if (scrollRect.contains(e.offsetx, e.offsety)) {
				draggingx = scroller.left;
				console.log("Dragging x")
				console.log(draggingx);
				return;
			}
			
			var totalTime = dataStore.getData("ui", "totalTime")
			var pixels_per_second = dataStore.getData("ui", "timeScale")
			var frame_start = dataStore.getData("ui", "scrollTime")
			var w = width;

			var t = (e.offsetx) / w * totalTime;

			// data.get('ui:currentTime').value = t;
			dispatcher.fire('time.update', t);
				
		},
		function move (e) {
			if (draggingx != null) {
				console.log("Move");
				var totalTime = dataStore.getData("ui", "totalTime")
				var w = width;

				if ((e.offsetx) < w){ //Check currently does not work - this should check if scroller.start + scroller.length < total width of slider
					dispatcher.fire('update.scrollTime', (draggingx + e.dx)  / w * totalTime);
				}

			} else {
				console.log("DOWN")
				if (scrollRect.contains(e.offsetx, e.offsety)) {
					draggingx = scroller.left;
					console.log("Dragging x")
					console.log(draggingx);
					return;
				}
				
				var totalTime = dataStore.getData("ui", "totalTime")
				var pixels_per_second = dataStore.getData("ui", "timeScale")
				var frame_start = dataStore.getData("ui", "scrollTime")
				var w = width;

				var t = (e.offsetx) / w * totalTime;
				dispatcher.fire('time.update', t);	
			}
		},
		function up(e){
			draggingx = null;
		}
		// function hit(e) {
		// 	if (child.onHit) { child.onHit(e) };
		// }
	);

	canvas.addEventListener("mousedown", function (e){
		bounds = canvas.getBoundingClientRect();
		var currentx = e.clientX - bounds.left, currenty = e.clientY;
	})

	/*** End handling for scrollbar ***/
}

module.exports = {
	timelineScroll: timelineScroll
};
},{"./theme":7,"./utils":12}],11:[function(require,module,exports){
var utils = require("./utils");
	Theme = require("./theme")

function initCanvas () {
	console.log("Running canvas init");
	topToolbar = document.createElement('div');
	topToolbar.setAttribute("id", "top-toolbar");
	utils.style(topToolbar, {position: "fixed", width: "100%", height: "10%"});
	document.body.appendChild(topToolbar);

	topToolbar = document.createElement('div');
	topToolbar.setAttribute("id", "top-timeline");
	utils.style(topToolbar, {position: "fixed", width: "90%", left: "10%", height: "5%", top: "10%"});
	document.body.appendChild(topToolbar);

	canvas = document.createElement('canvas');
	canvas.setAttribute("id", "top-timeline-canvas");
	canvas.style.width ='100%';
	canvas.style.height='100%';
	canvas.width = topToolbar.offsetWidth;
	canvas.height = topToolbar.offsetHeight;
	topToolbar.appendChild(canvas);

	timeline = document.createElement('div');
	timeline.setAttribute("id", "timeline");
	utils.style(timeline, {position: "fixed", left: "10%", top: "15%", width: "90%", height: "85%"});
	document.body.appendChild(timeline);

	canvas = document.createElement('canvas');
	canvas.setAttribute("id", "timeline-canvas");
	canvas.style.width ='100%';
	canvas.style.height='100%';
	canvas.width = timeline.offsetWidth;
	canvas.height = timeline.offsetHeight;
	timeline.appendChild(canvas);

	leftColumn = document.createElement('div');
	leftColumn.setAttribute("id", "left-column");
	utils.style(leftColumn, {position: "fixed", width: "10%", top: "15%", height: "85%"});
	document.body.appendChild(leftColumn);

	canvas = document.createElement('canvas');
	canvas.setAttribute("id", "left-column-canvas");
	canvas.style.width ='100%';
	canvas.style.height='100%';
	canvas.width = leftColumn.offsetWidth;
	canvas.height = leftColumn.offsetHeight;
	leftColumn.appendChild(canvas);

	zoomColumn = document.createElement('div');
	zoomColumn.setAttribute("id", "zoomColumn");
	utils.style(zoomColumn, {position: "fixed", top: "10%", width: "10%", height: "5%", backgroundColor: Theme.a});
	document.body.appendChild(zoomColumn);
}

function paintTrackColumn() {

}

module.exports = {
	initCanvas: initCanvas,
	paintTrackColumn: paintTrackColumn
};
},{"./theme":7,"./utils":12}],12:[function(require,module,exports){
function getDivSize(id){
	parentDiv = document.getElementById(id);
	return parentDiv.offsetWidth, parentDiv.offsetHeight;
}

function style(element, var_args) {
	for (var i = 1; i < arguments.length; ++i) {
		var styles = arguments[i];
		for (var s in styles) {
			element.style[s] = styles[s];
		}
	}
}

function format_friendly_seconds(s, type) {
	// TODO Refactor to 60fps???
	// 20 mins * 60 sec = 1080 
	// 1080s * 60fps = 1080 * 60 < Number.MAX_SAFE_INTEGER

	var raw_secs = s | 0;
	var secs_micro = s % 60;
	var secs = raw_secs % 60;
	var raw_mins = raw_secs / 60 | 0;
	var mins = raw_mins % 60;
	var hours = raw_mins / 60 | 0;

	var secs_str = (secs / 100).toFixed(2).substring(2);

	var str = mins + ':' + secs_str;

	if (s % 1 > 0) {
		var t2 = (s % 1) * 60;
		if (type === 'frames') str = secs + '+' + t2.toFixed(0) + 'f';
		else str += ((s % 1).toFixed(2)).substring(1);
		// else str = mins + ':' + secs_micro;
		// else str = secs_micro + 's'; /// .toFixed(2)
	}
	return str;	
}

function proxy_ctx(ctx) {
	// Creates a proxy 2d context wrapper which 
	// allows the fluent / chaining API.
	var wrapper = {};

	function proxy_function(c) {
		return function() {
			// Warning: this doesn't return value of function call
			ctx[c].apply(ctx, arguments);
			return wrapper;
		};
	}

	function proxy_property(c) {
		return function(v) {
			ctx[c] = v;
			return wrapper;
		};
	}

	wrapper.run = function(args) {
		args(wrapper);
		return wrapper;
	};

	for (var c in ctx) {
		// if (!ctx.hasOwnProperty(c)) continue;
		// console.log(c, typeof(ctx[c]), ctx.hasOwnProperty(c));
		// string, number, boolean, function, object

		var type = typeof(ctx[c]);
		switch(type) {
			case 'object':
				break;
			case 'function':
				wrapper[c] = proxy_function(c);
				break;
			default:
				wrapper[c] = proxy_property(c);
				break;
		}
	}

	return wrapper;
}

function handleDrag(element, ondown, onmove, onup, down_criteria) {
	var pointer = null;
	var bounds = element.getBoundingClientRect();
	
	element.addEventListener('mousedown', onMouseDown);

	function onMouseDown(e) {
		handleStart(e);

		if (down_criteria && !down_criteria(pointer)) {
			pointer = null;
			return;
		}

		
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
		
		ondown(pointer);

		e.preventDefault();
	}
	
	function onMouseMove(e) {
		handleMove(e);
		onmove(pointer);
	}

	function handleStart(e) {
		bounds = element.getBoundingClientRect();
		var currentx = e.clientX, currenty = e.clientY;
		pointer = {
			startx: currentx,
			starty: currenty,
			x: currentx,
			y: currenty,
			dx: 0,
			dy: 0,
			offsetx: currentx - bounds.left,
			offsety: currenty - bounds.top,
			moved: false
		};
	}
	
	function handleMove(e) {
		bounds = element.getBoundingClientRect();
		var currentx = e.clientX,
		currenty = e.clientY,
		offsetx = currentx - bounds.left,
		offsety = currenty - bounds.top;
		pointer.x = currentx;
		pointer.y = currenty;
		pointer.dx = e.clientX - pointer.startx;
		pointer.dy = e.clientY - pointer.starty;
		pointer.offsetx = offsetx;
		pointer.offsety = offsety;

		// If the pointer dx/dy is _ever_ non-zero, then it's moved
		pointer.moved = pointer.moved || pointer.dx !== 0 || pointer.dy !== 0;
	}
	
	function onMouseUp(e) {
		handleMove(e);
		onup(pointer);
		pointer = null;
		
		document.removeEventListener('mousemove', onMouseMove);
		document.removeEventListener('mouseup', onMouseUp);
	}

	element.addEventListener('touchstart', onTouchStart);

	function onTouchStart(te) {
		
		if (te.touches.length == 1) {
			
			var e = te.touches[0];
			if (down_criteria && !down_criteria(e)) return;
			te.preventDefault();
			handleStart(e);
			ondown(pointer);
		}
		
		element.addEventListener('touchmove', onTouchMove);
		element.addEventListener('touchend', onTouchEnd);
	}
	
	function onTouchMove(te) {
		var e = te.touches[0];
		onMouseMove(e);
	}

	function onTouchEnd(e) {
		// var e = e.touches[0];
		onMouseUp(e);
		element.removeEventListener('touchmove', onTouchMove);
		element.removeEventListener('touchend', onTouchEnd);
	}


	this.release = function() {
		element.removeEventListener('mousedown', onMouseDown);
		element.removeEventListener('touchstart', onTouchStart);
	};
}

module.exports = {
	style: style,
	format_friendly_seconds: format_friendly_seconds,
	handleDrag: handleDrag,
	getDivSize: getDivSize,
	proxy_ctx: proxy_ctx
};
},{}]},{},[6]);
