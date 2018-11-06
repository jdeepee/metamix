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