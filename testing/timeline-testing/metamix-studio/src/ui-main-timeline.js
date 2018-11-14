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
AudioItem.prototype.set = function(x, y, x2, y2, color, audioName, id, track, time_scale, frame_start, barMarkers) {
	this.x = x;
	this.y = y;
	this.x2 = x2;
	this.y2 = y2;
	this.color = color;
	this.audioName = audioName;
	this.id = id;
	this.track = track;
	this.xNormalized = x + (frame_start * time_scale);
	this.x2Normalized = x2 + (frame_start * time_scale);
	this.size = this.x2Normalized - this.xNormalized;
	this.xMiddle = this.xNormalized + ((this.size) / 2);
	this.effects = effects;
	this.barMarkers = barMarkers;
	this.time_scale = time_scale;
	this.frame_start = frame_start;

	this.rounded1X = utils.round(this.xNormalized, 0.25);
	this.rounded1X2 = utils.round(this.x2Normalized, 0.25);

	this.rounded2X = utils.round(this.xNormalized, 0.5);
	this.rounded2X2 = utils.round(this.x2Normalized, 0.5);

	this.rounded3X = utils.round(this.xNormalized, 1);
	this.rounded3X2 = utils.round(this.x2Normalized, 1);
};

AudioItem.prototype.paintEffects = function(ctx) {

}

AudioItem.prototype.paintBarMarkers = function(ctx) {
	this.barMarkersX = [];
	this.barMarkersXRounded = [];
	ctx.strokeStyle = "grey";

	for (var i=0; i<this.barMarkers.length; i++){
		if (i % 4 == 0){ ctx.lineWidth = 2; } else { ctx.lineWidth = 1;}

		time = utils.time_to_x(this.barMarkers[i], this.time_scale, this.frame_start);
		this.barMarkersX.push(time);
		this.barMarkersXRounded.push(utils.round(time, 0.5));
		ctx.beginPath();
		ctx.moveTo(time, this.y+1);
		ctx.lineTo(time, this.y+this.y2);
		ctx.stroke();
		ctx.fillText(i+1, time+5, this.y+this.y2-1);
	}
}

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
	if (txtWidth < this.x2-this.x){ctx.fillText(this.audioName, this.x+txtWidth, this.y+10);}
};

//Check if mouse at x/y is contained in audio
AudioItem.prototype.contains = function(x, y, time_scale, frame_start) {
	// console.log("X", this.x, "Y", this.y, "X2", this.x2, "y2", this.y2)
	// console.log("Comparison", x ," >= ", (this.x + (frame_start * time_scale)), y, " >= ", this.y, x, " <= ", (this.x2 + (frame_start * time_scale)), y, "<= ", this.y + this.y2, this.id)
	//X & X2 values of audio item are normalized in accordance with the timescale and framestart so we can effectively care againsy mouse position no matter where the scroll wheel is
	return x >= this.xNormalized && y >= this.y  && x <= this.x2Normalized && y <= this.y + this.y2;
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
	var drawSnapMarker = 0;
	var trackLayers = dataStore.getData("ui", "tracks");
	var lineHeight = dataStore.getData("ui", "lineHeight");
	var offset = dataStore.getData("ui", "trackTimelineOffset");
	var trackBounds = {};
	var height = canvas.height;
	var width = canvas.width;

	//Create array of objects which defines the pixel bounds for each track element
	for (var i=0; i<trackLayers; i++){
		trackBounds[i] = [(offset + i*lineHeight)/dpr, (offset + (i+1)*lineHeight)/dpr];
	}

	console.log(trackBounds);

	var time_scale = dataStore.getData("ui", "timeScale");

	//Resize function called upon window resize - will resize canvas so that future paint operations can be correctly painted according to resize
	function resize() {
		parentDiv = document.getElementById("timeline")
		height = parentDiv.offsetHeight;
		width = parentDiv.offsetWidth;
		canvas.height = height;
		canvas.width = width;
		dataStore.updateUi("lineHeight", height*Settings.lineHeightProportion); //Update lineHeight in accordance to window height + proportion of track to window
		scroll_canvas.resize();
		track_canvas.resize();

		//Redefine track bounds after resize
		for (var i=0; i<trackLayers; i++){
			trackBounds[i] = [(offset + i*lineHeight)/dpr, (offset + i+1*lineHeight)/dpr];
		}
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
			start = audioItem.start;
			end = audioItem.end;
			effects = audioItem.effects;
			beatMarkers = audioItem.beat_markers;
			name = audioItem.name;
			id = audioItem.id;

			x = utils.time_to_x(start, time_scale, frame_start); //Starting x value for audio item
			x2 = utils.time_to_x(end, time_scale, frame_start); //Ending x value for audio item

			var y1 = (offset + track * lineHeight)/dpr; //Starting y value for audio item
			var y2 = (lineHeight)/dpr; //Ending y value for audio item
			// console.log("Computed values", "Track", track, "x (start x)", x, "x2 (width)", x2, "y1 (starting y)", y1, "y2 (height)", y2, 
			// 			"x2-x1", x2-x, "starting time", start, "ending time", end);
			AudioRect = new AudioItem();
			AudioRect.set(x, y1, x2, y2, Theme.audioElement, name, id, track, time_scale, frame_start, beatMarkers);
			AudioRect.paint(ctx, Theme.audioElement);
			AudioRect.paintBarMarkers(ctx);
			renderItems.push(AudioRect); //Add audio item to renderItems so we can process mousemove/clicks later
		}

		if (drawSnapMarker != false){
			console.log("drawing snap marker at", drawSnapMarker)
			console.log(drawSnapMarker);
			ctx.strokeStyle = "red";
			ctx.beginPath();
			ctx.moveTo(drawSnapMarker - frame_start * time_scale, 0);
			ctx.lineTo(drawSnapMarker - frame_start * time_scale, height);
			ctx.stroke();
		}
	}

	//Convert x to time given frame start and current time scale
	function x_to_time(x, time_scale) {
		return frame_start + (x) / time_scale
	}

	function bumpAudio(audio, startX, bumpValue){
		for (var i=0; i<audio.length; i++){
			if (audio[i].xNormalized >= startX){
				audio[i].xNormalized = audio[i].xNormalized + bumpValue;
				audio[i].x2Normalized = audio[i].x2Normalized + bumpValue;
			}
		}

		return audio;
	}

	function updateAudioItems(updates){
		console.log("Audio update ran ")
		for (var i=0; i<updates.length; i++){
			currentUpdate = updates[i];

			if (currentUpdate.id == currentDragging.id){
				currentDragging.x = startX;
				currentDragging.x2 = endX;
			}

			start = +((currentUpdate.x / time_scale).toFixed(2));
			end = +((currentUpdate.x2 / time_scale).toFixed(2));
			dispatcher.fire('update.audioTime', currentUpdate.id, start, end);
			dispatcher.fire('update.audioTrack', currentUpdate.id, track);	
		}
	}

	//Reconfigures X/X2 values on a given track timeline to ensure overlap of items does not occur - usually called after Y drag?
	function reconfigure_x(renderItems, currentDragging){
		renderItemsTracks = {};

		for (var i=0; i<renderItems.length; i++){
			currentItem = renderItems[i];

			if (renderItemsTracks.hasOwnProperty(currentItem.track)){
				renderItemsTracks[currentItem.track].push(currentItem);

			} else {
				renderItemsTracks[currentItem.track] = [currentItem];
			}
		}
		
		trackComparisonArray = utils.sortByKey(renderItemsTracks[currentDragging.track], start);
		console.log('Running x reconfiguration on', trackComparisonArray);

		trackComparisonArray = utils.removeFromArrayById(trackComparisonArray, currentDragging.id);

		for (var i=0; i<trackComparisonArray.length; i++){
			currentItem = trackComparisonArray[i];
			//Using xPosition to match is not good - we should use start/end of the currentDragging item and check if there is any overlap with any audio items
			//We need to be sure very small overlaps created by snapping are not happening - this function should solve that
			//it should be able to see if an audio item is partally inside another and then snap it to the correct side
			//should also be able to handle total coverage and snap to correct side using the comparison of the two x middle values for audio items in question

			if (currentDragging.xNormalized < currentItem.x2Normalized && currentDragging.x2Normalized > currentItem.x2Normalized){
				//Is partial inside of object before currentDragging - left side of current dragging inside right side of currentItem
				console.log("Match on left currentDragging - right currentItem");
				//Snap to right side of currentItem
				currentDragging.x = currentItem.x2Normalized;
				currentDragging.x2 = currentDragging.x + currentDragging.size;
				//currentItem should be updated using the new x2Normalized value and then the bumpSize computed from distance moved by currentItem
				out = bumpAudio(trackComparisonArray, currentDragging.xNormalized, currentDragging.size);
				out.push(currentDragging);
				return out;

			} else if (currentDragging.xNormalized > currentItem.xNormalized && currentDragging.x2Normalized < currentItem.x2Normalized){
				//Current dragging is completely covered by currentItem
				console.log("Complete match");
				//Make middleX comparison and then snap on decided side
				if (currentDragging.xMiddle > currentItem.xMiddle){
					//Snap right side
					currentDragging.x = currentItem.x2Normalized;
					currentDragging.x2 = currentDragging.xNormalized + currentDragging.size;
					out = bumpAudio(trackComparisonArray, currentDragging.x, currentDragging.size);
					out.push(currentDragging);
					return out;

				} else {
					//Snap left side
					currentDragging.x2 = currentItem.xNormalized;
					currentDragging.x = currentDragging.x2Normalized - currentDragging.size;

					if (currentDragging.x < 0){
						currentDragging.x = 0;
						currentDragging.x2 = currentDragging.size;
					}
					out = bumpAudio(trackComparisonArray, currentDragging.x, currentDragging.size);
					out.push(currentDragging);
					return out;
				}

			} else if (currentDragging.xNormalized < currentItem.xNormalized && currentDragging.x2 > currentItem.xNormalized){
				//Is partailly inside of object currentItem - right side of current dragging inside left side of currentItem
				console.log("Match on right currentDragging - left currentItem");
				//Snap to left side of currentItem
				currentDragging.x2 = currentItem.xNormalized;
				currentDragging.x = currentDragging.x2Normalized - currentDragging.size;

				if (currentDragging.x < 0){
					currentDragging.x = 0;
					currentDragging.x2 = currentDragging.size;
				}
				out = bumpAudio(trackComparisonArray, currentDragging.x, currentDragging.size);
				out.push(currentDragging);
				return out;
			}
		}
	}

	//Handle Y axis track movement
	function move_y(audioItems, currentDragging, yPosition){
		var track = currentDragging.track;
		renderItemsTracks = {};

		for (var i=0; i<audioItems.length; i++){
			currentItem = audioItems[i];

			if (renderItemsTracks.hasOwnProperty(currentItem.track)){
				renderItemsTracks[currentItem.track].push(currentItem);

			} else {
				renderItemsTracks[currentItem.track] = [currentItem];
			}
		}

		for (var i=0; i<trackLayers; i++){
			//Cursor has moved to a new track - update Y track
			if (yPosition > trackBounds[i][0] && yPosition < trackBounds[i][1] && currentDragging.track != i){
				//Write code to ensure track cant change if position will be inside another audio on Y track
				track = i;
			}
		}
		return track;
	}

	function move_x(renderItems, currentDragging, e, draggingx, lastX){
		startX = (draggingx + e.dx/dpr); //tickOffset must be calculated based on diffence between current x value and last x value
		endX = (startX + currentDragging.size)
		rendX = utils.round(endX, 0.5);
		rstartX = utils.round(startX, 0.5);

		audioItemLoop:
		for (var i = 0; i < renderItems.length; i++){
			item = renderItems[i];
			if (item.track == currentDragging.track && item.id != currentDragging.id){ //If to check if comparison items are on same track 
				if (item.xNormalized >= currentDragging.xNormalized){ //If start of current comparison audio is before dragging audio start
					if (endX >= item.xNormalized){ //Check that computed end is greater than comparison audio start 
						if (e.offsetx/dpr <= item.x2){
							endX = item.xNormalized;
							startX = endX - currentDragging.size;
						} else {
							startX = item.x2Normalized;
							endX = startX + currentDragging.size;
						}
					}
				} else if (item.x2Normalized <= currentDragging.xNormalized){
					if (startX <= item.x2Normalized){
						if (e.offsetx/dpr >= item.x){
							console.log("ran3");
							startX = item.x2Normalized;
							endX = startX + currentDragging.size;

						} else {
							console.log("ran4");
							endX = item.xNormalized;
							startX = endX - currentDragging.size;
						}
					}
				}
			} else if (item.id != currentDragging.id && lastX != 0) { //Run Y aligment - will hold currently dragged audio item at snapped location for x movement ticks
				//Rounding values should change based on time_scale value - when we are far zoomed out 0.5 is too small each scroll steps much larger than 0.5
				//Items should not be able to snap inside other pieces of audio by being close 
				// console.log("Comparing", rstartX, rendX, "With", item.rounded2X, 
				// 	item.rounded2X2, "ID", item.id, "and", currentDragging.id,
				// 	"original values", startX, endX, item.xNormalized, item.x2Normalized)
				if (rendX == item.rounded2X){ //end2start
					block = true;
					blockNumber = 10;
					startX = item.xNormalized - currentDragging.size;
					endX = item.xNormalized;
					drawSnapMarker = item.xNormalized;
					break audioItemLoop;

				} else if (rendX == item.rounded2X2) { //end2end
					block = true;
					blockNumber = 10;
					startX = item.x2Normalized - currentDragging.size;
					endX = item.x2Normalized;
					drawSnapMarker = item.x2Normalized;
					break audioItemLoop;

				} else if (rstartX == item.rounded2X) { //start2/start
					block = true;
					blockNumber = 10;
					startX = item.xNormalized;
					endX = item.xNormalized + currentDragging.size;
					drawSnapMarker = item.xNormalized;
					break audioItemLoop;

				} else if (rstartX == item.rounded2X2) { //start2end
					block = true;
					blockNumber = 10;
					startX = item.x2Normalized;
					endX = item.x2Normalized + currentDragging.size;
					drawSnapMarker = item.x2Normalized;
					break audioItemLoop;

				} else {
					if (startX >= item.xNormalized && startX <= item.x2Normalized || endX >= item.xNormalized && endX <= item.x2Normalized){
						for (var i2=0; i2<item.barMarkersXRounded.length; i2++){
							if (rendX == item.barMarkersXRounded[i2]){ //end2start
								block = true;
								blockNumber = 4;
								startX = item.barMarkersX[i2] - currentDragging.size;
								endX = item.barMarkersX[i2];
								drawSnapMarker = item.barMarkersX[i2];
								break audioItemLoop;

							} else if (rstartX == item.barMarkersXRounded[i2]) { //start2/start
								block = true;
								blockNumber = 4;
								startX = item.barMarkersX[i2];
								endX = item.barMarkersX[i2] + currentDragging.size;
								drawSnapMarker = item.barMarkersX[i2];
								break audioItemLoop;
							}
						}
			}
				}
			}
		}

		//Mouse should not be able to go past 0 - thus if mouse go pasts 0 starts will be updated to 0 and end values will be increased by negative start value to ensure we dont loose length of audio
		if (startX < 0){
			end = end - start;
			endX = endX - startX;
			startX = 0;
			start = 0;
		}
		return startX, endX, block, drawSnapMarker, blockNumber;
	}


	this.paint = paint;
	this.resize = resize;

	//mousemove eventListener to handle cursor changing to pointer upon hovering over a draggable item
	canvas.addEventListener("mousemove", function(e){
		bounds = canvas.getBoundingClientRect();
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
	});

	//Right click even listner - will be used for adding effects onto clicked audio item
	canvas.addEventListener('contextmenu', function(e) {
	    e.preventDefault();
	    return false;
	}, false);

	//Handles "wheel" zoom events - trackpad zoom or scroll wheel zoom - also includes scroll left and right
	//Handle scroll left and right - moves timeline left and right - scroll up and down zooms into/out of timeline - then two finger 
	canvas.addEventListener("wheel", function(e){
		console.log("Wheel", e);
	});

	var draggingx = null;
	var currentDragging = null;
	var holdTick = 0; //Handles snapping of items on y axis to assist with moving tracks together
	var block = false;
	var lastX = 0;
	var startX;
	var endX;
	var trackSave = null; //Saves state of audio items on timeline - to be used if audioItem Y position is put back to previous state - should save
	var trackSave2 = null;
	var blockNumber = 0;

	//Handles dragging of movable items
	utils.handleDrag(canvas,
		function down(e){
			var time_scale = dataStore.getData("ui", "timeScale");
			frame_start = dataStore.getData("ui", "scrollTime");

			for (var i = 0; i < renderItems.length; i++){
				item = renderItems[i];
				if (item.contains(((e.offsetx)/dpr + (frame_start * time_scale)), (e.offsety)/dpr, time_scale, frame_start)) {
					draggingx = item.x + frame_start * time_scale
					currentDragging = item;
					canvas.style.cursor = 'grabbing';
					return;
				}
			}
			dispatcher.fire('time.update', x_to_time((e.offsetx)/dpr, time_scale));
		},
		function move(e){
			var time_scale = dataStore.getData("ui", "timeScale");
			frame_start = dataStore.getData("ui", "scrollTime");

			if (draggingx != null) {
				if (block == false){
					canvas.style.cursor = 'grabbing';
					track = move_y(renderItems, currentDragging, e.offsety/dpr);
					currentDragging.track = track;
					startX, endX, block, drawSnapMarker, blockNumber = move_x(renderItems, currentDragging, e, draggingx, lastX);

					//Update x/x2 value of current dragging item so we can use for future compuations
					currentDragging.x = startX;
					currentDragging.x2 = endX;
					currentDragging.xNormalized = startX;
					currentDragging.x2Normalized = endX;
					lastX = startX;
					start = +((startX / time_scale).toFixed(2));
					end = +((endX / time_scale).toFixed(2));
					dispatcher.fire('update.audioTime', currentDragging.id, start, end);
					dispatcher.fire('update.audioTrack', currentDragging.id, track);
					// console.log(dataStore.getData("data"));

				} else {
					if (holdTick == blockNumber){
						block = false;
						holdTick = 0;
						drawSnapMarker = false;

					} else {
						holdTick += 1;
					}
				}

			} else {
				dispatcher.fire('time.update', x_to_time((e.offsetx)/dpr, time_scale));
			}
		},
		function up(e){
			//Reset drag related variables
			draggingx = null;
			currentDragging = null;
			canvas.style.cursor = 'pointer';
			holdTick = 0;
			block = false;
			drawSnapMarker = false;
			blockNumber = 0;
		});
}

module.exports = {
	timeline: timeline
};