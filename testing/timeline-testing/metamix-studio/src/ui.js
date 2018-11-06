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