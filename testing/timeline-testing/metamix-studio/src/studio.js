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