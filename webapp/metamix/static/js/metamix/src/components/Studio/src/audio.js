import utils from "./utils.js"
import {Settings} from "../../../settings.js"
import effectUtils from "./effects.js"

//AudioItem class? which is used to draw each audio item + x/y containing operations 
//AudioItem code should be moved to its own file - its getting huge and cluttering this file
function AudioItem() {
	
}

//Set letiables for audio item
//This should be refactored to accept AudioItem object and then this letiables set from getting values from this object - much cleaner than sending a bunch of paramters
AudioItem.prototype.setWaveForm = function(rawWaveForm, y, y2, x, x2, time_scale, frame_start, offset){
	this.rawWaveForm = rawWaveForm;
	this.rawWaveFormMin = [];
	this.rawWaveFormMax = [];
	this.y = y;
	this.y2 = y2;
	this.x = x;
	this.x2 = x2;
	this.xNormalized = this.x + (frame_start * time_scale);
	this.x2Normalized = this.x2 + (frame_start * time_scale);
	this.size = this.x2Normalized - this.xNormalized;

	if (this.rawWaveForm != null){
		const y = utils.interpolateHeight(this.y2-16);
		this.rawWaveForm = this.rawWaveForm.resample({ width: this.size })

		// for(let i=0; i<this.rawWaveForm.min.length; i++){
		// 	this.rawWaveFormMin.push([i + 0.5, y(this.rawWaveForm.min[i]) + 0.5])
		// }
		this.rawWaveForm.min.forEach((val, x) => {
		  this.rawWaveFormMin.push([x + 0.5, y(val)+8])
		});
		// this.rawWaveForm.max = this.rawWaveForm.max.reverse()
		// for(let i=0; i<this.rawWaveForm.max.length; i++){
		// 	this.rawWaveFormMax.push([(this.rawWaveForm.offset_length - y) + 0.5, y(this.rawWaveForm.max[i]) + 0.5]);
		// }
		this.rawWaveForm.max.reverse().forEach((val, x) => {
			this.rawWaveFormMax.push([(this.rawWaveForm.offset_length - x) + 0.5, y(val)+8]);
		});

	}
}

AudioItem.prototype.set = function(x, y, x2, y2, color, audioName, id, track, time_scale, frame_start, barMarkers, effects, end, bpm, dpr, currentWidth) {
	this.x = x;
	this.y = y;
	this.x2 = x2;
	this.y2 = y2;
	this.color = color;
	this.audioName = audioName;
	this.bpm = bpm;
	this.id = id;
	this.track = track;
	this.xNormalized = x + (frame_start * time_scale);
	this.x2Normalized = x2 + (frame_start * time_scale);
	this.size = this.x2Normalized - this.xNormalized;
	this.ySize = this.y2 - this.y;
	this.xMiddle = this.xNormalized + ((this.size) / 2);
	this.effects = effects;
	this.barMarkers = barMarkers;
	this.time_scale = time_scale;
	this.frame_start = frame_start;
	this.xOffset = this.frame_start * this.time_scale;
	this.ratio = this.y2 / 100;
	this.curveValues = [];
	this.drawSelectGlow = false;
	this.end = end;
	this.dpr = dpr;
	this.currentWidth = currentWidth;

	this.rounded1X = utils.round(this.xNormalized, 0.25);
	this.rounded1X2 = utils.round(this.x2Normalized, 0.25);

	this.rounded2X = utils.round(this.xNormalized, 0.5);
	this.rounded2X2 = utils.round(this.x2Normalized, 0.5);

	this.rounded3X = utils.round(this.xNormalized, 1);
	this.rounded3X2 = utils.round(this.x2Normalized, 1);
};

AudioItem.prototype.updateBars = function(val){
	//console.log("updating by", startX - draggingx, startX, draggingx)
	let {x, xr} = utils.increaseArray(this.barMarkersX, val, true);
	this.barMarkersX = x;
	this.barMarkersXRounded = xr;
}

AudioItem.prototype.createBarDiff = function(){
	this.barMarkerDiff = {};
	for (let i=0; i<this.barMarkersX.length; i++){
		this.barMarkerDiff[this.barMarkersX[i]] = [this.barMarkersX[i]-this.xNormalized, this.x2Normalized-this.barMarkersX[i]];
	}
}

AudioItem.prototype.paintWaveform = function(ctx){
	if (this.rawWaveForm != undefined){
		// //console.log(this.rawWaveForm)
		//lets add some checking to this rendering which will check if X value is greater/less than canvas width -> if so then dont render only render what is in view
		//pre rendering?
		ctx.beginPath();
		// from 0 to 100
		//compute waveform min/max upon the setWaveForm function - so we dont need to recompute for each iteration over the min/max values
		for (let i=0; i<this.rawWaveFormMin.length; i++){
			ctx.lineTo(this.xNormalized+this.rawWaveFormMin[i][0] - this.xOffset, this.y+this.rawWaveFormMin[i][1])
		}
		// this.rawWaveForm.min.forEach((val, x) => {
		//   ctx.lineTo(x + 0.5, y(val) + 0.5);
		// });

		for (let i=0; i<this.rawWaveFormMax.length; i++){
			ctx.lineTo(this.xNormalized+this.rawWaveFormMax[i][0] - this.xOffset, this.y+this.rawWaveFormMax[i][1])
		}
		// then looping back from 100 to 0
		// this.rawWaveForm.max.reverse().forEach((val, x) => {
		//   ctx.lineTo((this.rawWaveForm.offset_length - x) + 0.5, y(val) + 0.5);
		// });

		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	}
}

AudioItem.prototype.effectGlow = function(){
	this.drawSelectGlow = true;
}

AudioItem.prototype.drawEffectCurve = function(ctx, start, target, type, startX, endX, strengthCurve, id){
	//currently start/target only works for phase 1 of effect - this should be able to handle effects which have multiple start/targets - 
	//maybe this means drawing multiple curves?
	//console.log("Draw effect curve for", start, target)
	if (start != null || target != null){
		if ((target == null || target == Settings.effectBounds[type]["default"]) && strengthCurve == "continuous"){
			target = start;

		} else if ((target == null || target == Settings.effectBounds[type]["default"]) && strengthCurve != "continuous"){
			target = 0;
		}
		//console.log("Drawing", strengthCurve, start, target, type);
		let effectStartRatio, effectEndRatio;
		let out = effectUtils.computeHighLow(start, target, type);
		effectStartRatio = out[0];
		effectEndRatio = out[1];
		let effectStartY = this.y + this.y2 - effectStartRatio * this.ratio;
		let effectEndY = this.y + this.y2 - effectEndRatio * this.ratio;

		ctx.strokeStyle = Settings.theme.effectColours[type];
		ctx.fillStyle = Settings.theme.effectColours[type];
		ctx.beginPath();
		ctx.moveTo(startX, this.y);
		ctx.lineTo(startX, this.y+this.y2);
		ctx.stroke();
		ctx.moveTo(endX, this.y);
		ctx.lineTo(endX, this.y+this.y2);
		ctx.stroke();

		if (strengthCurve == "linear"){
			this.curveValues.push({x0: startX, y0: effectStartY, x1: endX, y1: effectEndY, id: id, type: type});
			ctx.moveTo(startX, effectStartY);
			ctx.lineTo(endX, effectEndY)
			ctx.stroke();
			if (type == "eq"){
				ctx.fillText("EQ", startX+(ctx.measureText(type).width/this.dpr), effectStartY-2);
			} else {
				ctx.fillText(utils.capitalizeFirstLetter(type), startX+(ctx.measureText(type).width/this.dpr), effectStartY-2);
			}

		} else if (strengthCurve == "continuous"){
			this.curveValues.push({x0: startX, y0: effectStartY, x1: endX, y1: effectEndY, id: id, type: type});
			ctx.moveTo(startX, effectStartY);
			ctx.lineTo(endX, effectStartY)
			ctx.stroke();
			if (type == "eq"){
				ctx.fillText("EQ", startX+(ctx.measureText(type).width/this.dpr), effectStartY-2);
			} else {
				ctx.fillText(utils.capitalizeFirstLetter(type), startX+(ctx.measureText(type).width/this.dpr), effectStartY-2);
			}
		}
		ctx.fillStyle = "black";
	}
}

AudioItem.prototype.paintEffects = function(ctx) {
	//Iterate over effects and paint them on the audio item - in theme define some basic temporary colour scheme/symbols which can signify different effects
	//So for example yellow = eq, red = volume. etc. Currently only two supported strength_curves on backend: continous and linear - just build these for now
	//Y position on the audio item should indicate the start/target values of the effects
	//console.log("Effects", this.effects);
	for (let i=0; i<this.effects.length; i++){
		let effect = this.effects[i];
		if (effect["endX"] - effect["startX"] > 5){
			if (effect["type"] != "eq"){
				if (effect["effectStart"] != Settings.effectBounds[effect["type"]]["default"] || effect["effectTarget"] != Settings.effectBounds[effect["type"]]["default"]){ //here it should be checking that the values are != default values not 0
					this.drawEffectCurve(ctx, effect["effectStart"], effect["effectTarget"], effect["type"], 
										 effect["startX"], effect["endX"], effect["strength_curve"], effect["id"]);

				}
			} else {
				if (effect["high"]["start"] != 0 || effect["high"]["target"] != 0){
					this.drawEffectCurve(ctx, effect["high"]["start"], effect["high"]["target"], effect["type"], 
										 effect["startX"], effect["endX"], effect["strength_curve"], effect["id"]);
				}
				if (effect["mid"]["start"] != 0 || effect["mid"]["target"] != 0){
					this.drawEffectCurve(ctx, effect["mid"]["start"], effect["mid"]["target"], effect["type"], 
										 effect["startX"], effect["endX"], effect["strength_curve"], effect["id"]);
				}
				if (effect["low"]["start"] != 0 || effect["low"]["target"] != 0){
					this.drawEffectCurve(ctx, effect["low"]["start"], effect["low"]["target"], effect["type"], 
										 effect["startX"], effect["endX"], effect["strength_curve"], effect["id"]);
			}
			}
		}
	}
	ctx.lineWidth = 1.0;
}

AudioItem.prototype.paintBarMarkers = function(ctx, block) {
	if (block == false){
		this.barMarkersX = [];
		this.barMarkersXRounded = [];
		ctx.strokeStyle = "grey";

		for (let i=0; i<this.barMarkers.length; i++){
			if (i % 4 == 0){ ctx.lineWidth = 2; } else { ctx.lineWidth = 1;}

			let time = utils.time_to_x(this.barMarkers[i], this.time_scale, this.frame_start) + this.xNormalized;
			this.barMarkersX.push(time);
			this.barMarkersXRounded.push(utils.round(time, 0.5));
			ctx.beginPath();
			ctx.moveTo(time, this.y+1);
			ctx.lineTo(time, this.y+this.y2);
			ctx.fillText(i+1, time+5, this.y+this.y2-1);
			ctx.stroke();
		}
		this.createBarDiff();

	} else {
		ctx.strokeStyle = "grey";

		for (let i=0; i<this.barMarkers.length; i++){
			if (i % 4 == 0){ ctx.lineWidth = 2; } else { ctx.lineWidth = 1;}

			let time = this.barMarkersX[i];
			ctx.beginPath();
			ctx.moveTo(time, this.y+1);
			ctx.lineTo(time, this.y+this.y2);
			ctx.fillText(i+1, time+5, this.y+this.y2-1);
			ctx.stroke();
		}
	}
	ctx.lineWidth = 1.0;
}

//Paint audio item in canvas
AudioItem.prototype.paint = function(ctx, outlineColor, block) {
	if (this.x >= 0 || this.x2 >= 0){
		if (this.x <= this.currentWidth){
			ctx.fillStyle = outlineColor;
			ctx.beginPath();
			//console.log("Painting rectangle", this.x, this.x2-this.x)
			ctx.rect(this.x, this.y, this.x2-this.x, this.y2);
			ctx.fill();
			if (this.drawSelectGlow == true){
				ctx.strokeStyle = "red";
			} else {
				ctx.strokeStyle = "black";
			}
			ctx.stroke();
			ctx.fillStyle = "black";
			this.paintWaveform(ctx);
			this.paintBarMarkers(ctx, block);
			this.paintEffects(ctx);

			let text = this.audioName + " | Original BPM: (" + this.bpm.toString() + ")";
			let medText = this.audioName + "(" + this.bpm.toString() + ")";
			let txtWidthFull = ctx.measureText(text).width;
			let txtWidthMed = ctx.measureText(medText).width
			let txtWidthShort = ctx.measureText(this.audioName).width;
			if (txtWidthFull < this.size){
				ctx.fillText(text, this.x+(txtWidthFull/this.dpr), this.y+10);

			} else if (txtWidthMed < this.size){
				ctx.fillText(medText, this.x+(txtWidthMed/this.dpr), this.y+10);

			} else if (txtWidthShort < this.size){
				ctx.fillText(this.audioName, this.x+(txtWidthShort/this.dpr), this.y+10);
			}
		}
	}
};

//Check if mouse at x/y is contained in audio
AudioItem.prototype.contains = function(x, y, time_scale, frame_start) {
	// console.log("X", this.x, "Y", this.y, "X2", this.x2, "y2", this.y2)
	// console.log("Comparison", x ," >= ", (this.x + (frame_start * time_scale)), y, " >= ", this.y, x, " <= ", (this.x2 + (frame_start * time_scale)), y, "<= ", this.y + this.y2, this.id)
	//X & X2 values of audio item are normalized in accordance with the timescale and framestart so we can effectively care againsy mouse position no matter where the scroll wheel is
	return x >= this.xNormalized && y >= this.y  && x <= this.x2Normalized && y <= this.y + this.y2;
};

AudioItem.prototype.containsEffect = function(x, y){
	for (let i=0; i<this.curveValues.length; i++){
		let line = this.curveValues[i];
		// mouseX=parseInt(e.clientX-offsetX);
		// mouseY=parseInt(e.clientY-offsetY);
		if(x<line.x0 || y>line.x1){
		  	return false;          
		}
		let linepoint=utils.linepointNearestMouse(line,x,y);
		let dx=x-linepoint.x;
		let dy=y-linepoint.y;
		let distance=Math.abs(Math.sqrt(dx*dx+dy*dy));
		let tolerance = 3;
		if(distance<tolerance){
			return line;

		}
	}
	return false;
}

//Change outline to red to notify user that they cannot slide audio over item in same track
AudioItem.prototype.alert = function(ctx, outlineColor){
	this.paint(ctx, outlineColor);
}

AudioItem.prototype.onBarMarker = function(x, frameStart, timeScale){
	for (let i=0; i<this.barMarkersX.length; i++){
		let line = {"x0": this.barMarkersX[i] + frameStart * timeScale}

		if((x<line.x0 || x>line.x0) == false){
			if (x == line.x0){
				return line;
			}
		}
	}
	return false;
}

export default AudioItem