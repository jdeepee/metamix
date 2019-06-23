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