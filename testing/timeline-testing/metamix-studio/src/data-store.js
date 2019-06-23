var package_json = require('../package.json'),
	Settings = require('./settings'),
	Do = require('do.js');
	utils = require("./utils");
	WaveformData = require("waveform-data");

// Data Store with a source of truth
function DataStore() {
	this.data = undefined;
	this.ui = undefined;

	this.initData = function initData(audio, tracks){
		this.data = audio;

		// for(var i=0; i<this.data; i++){
		// 	this.data[i].original_length = (this.data[i].end)*Settings.time_scale - (this.data[i].start)*Settings.time_scale
		// }

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
		this.fetchWaveFormData();
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
				this.data[i]["effects"].push(effectObject)
				break;
			}
	}

	this.getEffect = function getEffect(audioId, effectId){
		for (var i in this.data){
			if (this.data[i].id == audioId){
				for (var i2 in this.data[i]['effects']){
					if (this.data[i]["effects"][i2].id == effectId){
						return this.data[i].effects[i2];
					}
				}
			}
		}
	}

	this.updateEffect = function updateEffect(audioId, effectObject) {
		effectId = effectObject.id;
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

	this.deleteData = function deleteData(id){
		for (var i in this.data){
			if (this.data[i].id == id){
				this.data.splice(i, 1);
			}
		}
	}

	this.fetchWaveFormData = function fetchWaveFormData(){
		var dataTmp = this;
		console.log('Fetching wave form data');

		for (var i=0; i<this.data.length; i++){
			if (this.data[i].wave_form != null){
				console.log("Running for", this.data[i].id)
				var xhttp = new XMLHttpRequest();
				xhttp.open('GET', "http://localhost:8000/"+this.data[i].wave_form);
				xhttp.i = i;
				xhttp.responseType = 'arraybuffer';

				xhttp.onload = function(data) {
					dataTmp.data[0].raw_wave_form = WaveformData.create(data.target); //currently not updating dynamically because js fucking sucks
					dataTmp.data[1].raw_wave_form = WaveformData.create(data.target);
				};

				xhttp.send();
			}
		}
	}
}

module.exports = DataStore;
