import Vue from 'vue'
import Vuex from 'vuex'
import Settings from "./settings.js"

Vue.use(Vuex)

export const store = new Vuex.Store({
	state: {
		mixData: undefined,
		uiData: {
			currentTime: 0,
			totalTime: Settings.default_length,
			scrollTime: 0,
			timeScale: Settings.time_scale,
			tracks: undefined, //This should also be set in Studio component after data has been received and maximum number of tracks is decided
			trackTimelineOffset: Settings.trackTimelineOffset, //Offset between top of studio timeline and start of track items
			lineHeight: undefined, //Size of track items - this should be compute when Studio component is ran and resized
			xScrollTime: 0,
			currentEffect: null,
			effects: {"eq": {"start": 0, "end": 0, "barCountStart": 0, "barCountEnd": 0, "strengthCurve": "continuous", "title": "EQ Effect",
							 "knobs": [{"name": "high", "title": "Highs", "start": 0, "target": 0, "max": 2, "min": -2, "step": 0.01, "precision": 2, "default": 0}, 
							 		   {"name": "mid", "title": "Mids", "start": 0, "target": 0, "max": 2, "min": -2, "step": 0.01, "precision": 2, "default": 0}, 
							 		   {"name": "low", "title": "Lows", "start": 0, "target": 0, "max": 2, "min": -2, "step": 0.01, "precision": 2, "default": 0}],
							 "default_values": {"high": {"start": null, "target": null}, "mid": {"start": null, "target": null}, "low": {"start": null, "target": null}, "strength_curve": "continuous"}},
					  "remove": {"start": null, "end": null, "barCountStart": null, "barCountEnd": null, "strengthCurve": null, "title": "Remove", "knobs": [], "default_values": null, "strength_curve": null},
					  "cut": {"start": null, "end": null, "barCountStart": null, "barCountEnd": null, "strengthCurve": null, "title": "Remove", "knobs": [], "default_values": null, "strength_curve": null},
					  "volume": {"start": 0, "end": 0, "barCountStart": 0, "barCountEnd": 0, "strengthCurve": "continuous", "title": "Volume Modulation",
					  		     "knobs": [{"name": "volume", "start": 0, "target": 0, "max": 2, "min": 0, "step": 0.01, "precision": 2, "default": 1}],
					  		     "default_values": {"start": null, "target": null, "strength_curve": "continuous"}, "starting": 1}
					} //This might not have to be here in Vuex - it might be possible to handle everything in the effect Vue
		}
	},
	mutations: { //syncronous
		addMixData(state, data){
			state.mixData = data;
		},
		updateUi(state, data){
			for (let key in data){
				state.uiData[key] = data[key];
			}
		},
		updateMixData(state, data){
			for (let i in state.mixData) {
				if (state.mixData[i].id == data.audioId) {
					state.mixData[i][data.key] = data.value;
					break;
				}
			}
		},
		addEffect(state, data){
			for (let i in state.mixData) {
				if (state.mixData[i].id == data.audioId){
					delete data["audioId"];
					state.mixData[i]["effects"].push(data)
					break;
				}
			}
		},
		updateEffect(state, data){
			for (let i in state.mixData){
				if (state.mixData[i].id == data.audioId){
					for (let i2 in state.mixData[i].effects){
						if (state.mixData[i].effects[i2].id == data.id){
							delete data["audioId"];
							for (let key in data){
								state.mixData[i].effects[i2][key] = data[key]
							}
							break;
						}
					}
				}
			}
		},
		deleteEffect(start, data){
			for (let i in state.mixData){
				if (state.mixData[i].id == data.audioId){
					for (let i2 in state.mixData[i].effects){
						if (state.mixData[i].effects[i2].id == data.id){
							state.mixData[i].splice(i2);
							break;
						}
					}
				}
			}
		},
		updateAudio(state, data){
			for (let i in state.mixData){
				if (state.mixData[i].id == data.id){
					delete data["id"];
					for (let key in data){
						state.mixData[i][key] = data[key];
					}
				}
			}
		},
		copyAudio(state, data){
			for (let i in state.mixData){
				if (state.mixData[i].id == data.copyId){
					let newAudio = state.mixData[i]; //This is currently updating old audio rather than creating copy from old and then adding to the array as new value
					newAudio["id"] = data["id"];
					newAudio["name"] = state.mixData[i].name + " copy";
					state.mixData.push(newAudio);
				}
			}
		},
		deleteAudio(state, id){
			for (let i in state.mixData){
				if (state.mixData[i].id == id){
					state.mixData.splice(i, 1);
				}
			}
		}
	},
	actions: { //async

	},
	getters: {
		//Get information with data manipulation code applied
		getEffect(state){
			return function(data){
				for (let i=0; i<state.mixData.length; i++){
					if (state.mixData[i].id == data.audioId){
						for (let i2 in state.mixData[i]['effects']){
							if (state.mixData[i]["effects"][i2].id == data.effectId){
								return state.mixData[i].effects[i2];
							}
						}
					}
				}
			}
		},
		getMixData: state => state.mixData,
		getUi: state => state.uiData
	}
})