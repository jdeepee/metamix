import {Settings} from "../../../settings.js"

function mixComp (mix1, mix2) { //function to compare two mix objects
	if (mix1.audio.length != mix2.audio.length) {return false}
	for (var i = 0; i < mix1.audio.length; i++) {
		for (var p in mix1.audio[i]) {
			if (p != "rawWaveForm"){
				// console.log("Property", p);
				// console.log("Value", mix1.audio[i][p], mix2.audio[i][p]);
				if (p == "beat_positions"){
					if (mix1.audio[i].beat_positions.length === mix2.audio[i].beat_positions.length && mix1.audio[i].beat_positions.sort().every(function(value, index) { return value === mix2.audio[i].beat_positions.sort()[index]}) == false){ return false };
				} else if (p == "effects") { 
					if (JSON.stringify(mix1.audio[i].effects) === JSON.stringify(mix1.audio[i].effects) == false) { return false };
				} else {
					if (mix2.audio[i].hasOwnProperty(p) == false){
						return false
					};
					if (mix1.audio[i][p] != mix2.audio[i][p]){
						return false
					};
				}
			}
		};
	};
	if (mix1.description != mix2.description) {return false}
	if (mix1.genre != mix2.genre) {return false}
	if (mix1.name != mix2.name) {return false}
	return true
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

const interpolateHeight = (total_height, offset) => {
  const amplitude = 256;
  return (size) => total_height - ((size + 128) * total_height) / amplitude;
};

function linepointNearestMouse(line,x,y) {
    //
    let lerp=function(a,b,x){ return(a+x*(b-a)); };
    let dx=line.x1-line.x0;
    let dy=line.y1-line.y0;
    let t=((x-line.x0)*dx+(y-line.y0)*dy)/(dx*dx+dy*dy);
    let lineX=lerp(line.x0, line.x1, t);
    let lineY=lerp(line.y0, line.y1, t);
    return({x:lineX,y:lineY});
};

function increaseArray(array, increase, roundFlag){
	let out = [];
	let outRounded = [];
	let v;

	for (let i=0; i<array.length; i++){
		if (roundFlag == true){
			v = array[i]+increase;
			out.push(v)
			outRounded.push(round(v, 0.5));
		}
		out.push(array[i]+increase)
	}
	if (roundFlag == true){
		return {x: out, xr: outRounded};
	} else {
		return out;
	}
}

//Convert time in seconds to x value given a timescale
function time_to_x(s, time_scale, frame_start) {
	let ds = s - frame_start;
	ds = ds * time_scale;
	return ds;
}

//Convert x to time given frame start and current time scale
function x_to_time(x, time_scale, frame_start) {
	return frame_start + (x) / time_scale
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        let x = a[key]; let y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function removeFromArrayById(array, id) {
	for (let i=0; i<array.length; i++) {
		if (array[i].id == id) {
			array.splice(i,1);
		}
	}
	return array;
}

function round(value, step) {
	let inv = 1.0 / step;
	return Math.round(value * inv) / inv;
}

function getDivSize(id){
	let parentDiv = document.getElementById(id);
	return parentDiv.offsetWidth, parentDiv.offsetHeight;
}

function style(element, var_args) {
	for (let i = 1; i < arguments.length; ++i) {
		let styles = arguments[i];
		for (let s in styles) {
			element.style[s] = styles[s];
		}
	}
}

function format_friendly_seconds(s, type) {
	// TODO Refactor to 60fps???
	// 20 mins * 60 sec = 1080 
	// 1080s * 60fps = 1080 * 60 < Number.MAX_SAFE_INTEGER
	let raw_secs = s | 0;
	let secs_micro = s % 60;
	let secs = raw_secs % 60;
	let raw_mins = raw_secs / 60 | 0;
	let mins = raw_mins % 60;
	let hours = raw_mins / 60 | 0;

	let secs_str = (secs / 100).toFixed(2).substring(2);

	let str = mins + ':' + secs_str;

	if (s % 1 > 0) {
		let t2 = (s % 1) * 60;
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
	let wrapper = {};

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

	for (let c in ctx) {
		// if (!ctx.hasOwnProperty(c)) continue;
		// console.log(c, typeof(ctx[c]), ctx.hasOwnProperty(c));
		// string, number, boolean, function, object

		let type = typeof(ctx[c]);
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
	let pointer = null;
	let bounds = element.getBoundingClientRect();
	
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
		let currentx = e.clientX, currenty = e.clientY;
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
		let currentx = e.clientX,
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
			
			let e = te.touches[0];
			if (down_criteria && !down_criteria(e)) return;
			te.preventDefault();
			handleStart(e);
			ondown(pointer);
		}
		
		element.addEventListener('touchmove', onTouchMove);
		element.addEventListener('touchend', onTouchEnd);
	}
	
	function onTouchMove(te) {
		let e = te.touches[0];
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

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function computeHighLow(start, end, type){
	//Computes high/low ratio (0-100) of where the start/target of the effects are compared to possible min/max
	let offset = 0;
	let bounds = Settings.effectBounds[type];
	if (bounds["min"] <= 0){
		offset = bounds["min"] * -1;
	} else {
		offset = -bounds["min"]
	}

	let max = bounds["max"] + offset
	let startOff = start + offset;
	let endOffset = end + offset;
	if (startOff == 0){
		return [0, (endOffset / max)*100]

	} else if (endOffset == 0){
		return [(startOff / max)*100, 0]

	} else {
		return [(startOff / max)*100, (endOffset / max)*100]
	}
}

function computeEffectsX(effects, startX, time_scale, frame_start){
	for (let i=0; i<effects.length; i++){
		effects[i]["startX"] = startX + effects[i]["start"] * time_scale;
		effects[i]["endX"] = startX + effects[i]["end"] * time_scale;
	}
	return effects;
}

let utils = {
		style: style,
		format_friendly_seconds: format_friendly_seconds,
		handleDrag: handleDrag,
		getDivSize: getDivSize,
		proxy_ctx: proxy_ctx,
		round: round,
		sortByKey: sortByKey,
		removeFromArrayById: removeFromArrayById,
		time_to_x: time_to_x,
		increaseArray: increaseArray,
		x_to_time: x_to_time,
		linepointNearestMouse: linepointNearestMouse,
		interpolateHeight: interpolateHeight,
		guid: guid,
		capitalizeFirstLetter: capitalizeFirstLetter,
		computeHighLow: computeHighLow,
		computeEffectsX: computeEffectsX,
		mixComp: mixComp
	}
	
export default utils;