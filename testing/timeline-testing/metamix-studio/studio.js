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
			lineHeight: lineHeight //Size of track items
		};
	}

	this.updateData = function updateData(audioId, key, value) {
		for (var i in this.data) {
			if (this.data[i].id == audioId) {
				this.data[i][key] = vale;
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
		console.log('Time.update ran');
		v = Math.max(0, v);
		data.updateUi("currentTime", v);

		if (start_play) start_play = performance.now() - v * 1000;
		// repaintAll();
		// layer_panel.repaint(s);
	});	
	dispatcher.on('update.scrollTime', function(v) {
		v = Math.max(0, v);
		data.updateUi("scrollTime", v);
		// repaintAll();
	});

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
};
},{}],8:[function(require,module,exports){
var Settings = require("./settings");

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

function trackCanvas(dataStore, dispatcher){
	var canvas = document.getElementById("left-column-canvas");
	var width = canvas.width;
	var height = canvas.height;
	var dpr = window.devicePixelRatio; 
	var ctx = canvas.getContext('2d');

	this.resize = function() {
		parentDiv = document.getElementById("left-column")
		canvas.width = parentDiv.offsetWidth;
		canvas.height = parentDiv.offsetHeight;
		height = canvas.height;
		width = canvas.width;
	}

	this.paint = function() {
		var trackLayers = dataStore.getData("ui", "tracks");
		var lineHeight = dataStore.getData("ui", "lineHeight"); //TODO line height should be updated as more track layers are added - if track layers extend view
		var offset = dataStore.getData("ui", "trackTimelineOffset");

		ctx.fillStyle = "#343434";
		ctx.fillRect(0, 0, width, height);
		ctx.save();
		ctx.scale(dpr, dpr);

		for (var i = 0; i <= trackLayers; i++){
			ctx.strokeStyle = "#535353";
			ctx.beginPath();
			console.log("Y exterior");
			console.log((offset + i*lineHeight)/dpr);
			ctx.moveTo(0, (offset + i*lineHeight)/dpr);
			ctx.lineTo(width, (offset + i*lineHeight)/dpr);
			ctx.stroke();
		}
		ctx.restore();
	}
}

module.exports = {
	trackCanvas: trackCanvas
};
},{"./settings":5}],9:[function(require,module,exports){
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
			console.log("Y main");
			console.log((offset + i*lineHeight)/dpr);
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
	var width = canvas.width - 10;

	this.repaint = function(){
		paint(ctx);
	}

	this.scrollTo = function(s, y) {
		// console.log('Scroll to function called arguments are below ')
		// console.log(s)
		// console.log(y)
		scrollTop = s * Math.max(layers.length * LINE_HEIGHT - SCROLL_HEIGHT, 0);
		repaint();
	};

	this.resize = function resize() {
		parentDiv = document.getElementById("top-timeline")
		canvas.width = parentDiv.offsetWidth;
		canvas.height = parentDiv.offsetHeight;
		height = canvas.height - 10;
		width = canvas.width - 10;
	}

	this.paint = function() {
		var totalTime = dataStore.getData("ui", "totalTime")
		var scrollTime = dataStore.getData("ui", "scrollTime")
		var currentTime = dataStore.getData("ui", "currentTime")
		
		var pixels_per_second = dataStore.getData("ui", "timeScale")

		ctx.save();

		var w = width - 2 * MARGINS;
		var h = 16; // TOP_SCROLL_TRACK;
		var h2 = h;

		ctx.clearRect(0, 0, width, height);
		ctx.translate(MARGINS, 5);

		// outline scroller
		ctx.beginPath();
		ctx.strokeStyle = Theme.b;
		ctx.rect(0, 0, w, h);
		ctx.stroke();
		
		var totalTimePixels = totalTime * pixels_per_second;
		var k = w / totalTimePixels;
		scroller.k = k;

		var grip_length = w * k;

		scroller.grip_length = grip_length;

		scroller.left = scrollTime / totalTime * w;

		if (scroller.left+grip_length > w) {
			scroller.left = w
		}
		
		scrollRect.set(scroller.left, 0, scroller.grip_length, h);
		scrollRect.paint(ctx);

		var r = currentTime / totalTime * w;		

		ctx.fillStyle =  Theme.c;
		ctx.lineWidth = 2;
		
		ctx.beginPath();
		
		// circle
		// ctx.arc(r, h2 / 2, h2 / 1.5, 0, Math.PI * 2);

		// line
		ctx.rect(r, 0, 2, h + 5);
		ctx.fill()

		ctx.restore();
	}

	/** Handles dragging for scroll bar **/

	var draggingx = null;

	utils.handleDrag(canvas,
		function down(e) {
			// console.log('ondown', e);

			if (scrollRect.contains(e.offsetx - MARGINS, e.offsety -5)) {
				draggingx = scroller.left;
				return;
			}
			
			var totalTime = dataStore.getData("ui", "totalTime")
			var pixels_per_second = data.getData("ui", "timeScale")
			var w = width - 2 * MARGINS;

			var t = (e.offsetx - MARGINS) / w * totalTime;
			// t = Math.max(0, t);

			// data.get('ui:currentTime').value = t;
			dispatcher.fire('time.update', t);
				
		},
		function move (e) {
			if (draggingx != null) {
				var totalTime = dataStore.getData("ui", "totalTime")
				var w = width - 2 * MARGINS;
				
				dispatcher.fire('update.scrollTime', 
					(draggingx + e.dx)  / w * totalTime);

			} else {
				this.onDown(e);	
			}
		},
		function up(e){
			draggingx = null;
		}
		// function hit(e) {
		// 	if (child.onHit) { child.onHit(e) };
		// }
	);

	/*** End handling for scrollbar ***/
}

module.exports = {
	timelineScroll: timelineScroll
};
},{"./theme":7,"./utils":12}],11:[function(require,module,exports){
var utils = require("./utils");

function initCanvas () {
	console.log("Running canvas init");
	topToolbar = document.createElement('div');
	topToolbar.setAttribute("id", "top-toolbar");
	utils.style(topToolbar, {position: "fixed", width: "100%", height: "10%", color: "black"});
	document.body.appendChild(topToolbar);

	topToolbar = document.createElement('div');
	topToolbar.setAttribute("id", "top-timeline");
	utils.style(topToolbar, {position: "fixed", width: "90%", left: "10%", height: "5%", top: "10%", color: "black"});
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
	utils.style(timeline, {position: "fixed", left: "10%", top: "15%", width: "90%", height: "85%", color: "black"});
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
	utils.style(leftColumn, {position: "fixed", width: "10%", top: "15%", height: "85%", color: "black"});
	document.body.appendChild(leftColumn);

	canvas = document.createElement('canvas');
	canvas.setAttribute("id", "left-column-canvas");
	canvas.style.width ='100%';
	canvas.style.height='100%';
	canvas.width = leftColumn.offsetWidth;
	canvas.height = leftColumn.offsetHeight;
	leftColumn.appendChild(canvas);
}

function paintTrackColumn() {

}

module.exports = {
	initCanvas: initCanvas,
	paintTrackColumn: paintTrackColumn
};
},{"./utils":12}],12:[function(require,module,exports){
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
	getDivSize: getDivSize
};
},{}]},{},[6]);
