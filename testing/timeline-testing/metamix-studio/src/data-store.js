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
