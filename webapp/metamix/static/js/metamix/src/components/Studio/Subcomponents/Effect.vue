<template>
	<vue-draggable-resizable drag-handle=".drag-div" :w="dragWidth" :h="dragHeight" :x="dragX" :y="dragY" class="hidden" id="draggable-master">
		<div class="modal" id="effectModal">
			<div class="drag-div">
			</div>
			<div class="modal-content" title="modal-content-div">
				<span class="close" id="modalClose" v-on:click="closeModal">&times;</span>
				<div class="title-div">
					<h3>{{effectDescriptor[currentEffect]["title"]}}</h3>
					<h4>Strength Curve</h4>
					<select id="strength-curve" name="Strength Curve" v-on:input="strengthCurveUpdate($event.target.value)" :value="effectDescriptor[currentEffect]['strengthCurve']">
						<option value="continuous" >Continuous</option>
						<option value="linear">Linear</option>
					</select>
				</div> 
				<div class="knob-wrapper">
					<div id="input-container" class="column-input-container">
						<div id="bar-input-container-start" class="input-container">
							<button id="barDownStart" @click="barValueUpdate(-1, 'barCountStart')">&darr;</button>
							<input id="barStartCounter" class="bar-effect-input" :value="effectDescriptor[currentEffect]['barCountStart']" @change="barValueUpdate($event.target.value, 'inputStart')">
							<button id="barUpStart" @click="barValueUpdate(1, 'barCountStart')">&uarr;</button>
							<button id="barDownEnd" @click="barValueUpdate(-1, 'barCountEnd')">&darr;</button>
							<input id="barEndCounter" class="bar-effect-input" :value="effectDescriptor[currentEffect]['barCountEnd']" @change="barValueUpdate($event.target.value, 'inputEnd')">
							<button id="barUpEnd" @click="barValueUpdate(1, 'barCountEnd')">&uarr;</button>
						</div>
						<h4 id="start-end-header">Start/End Song Contextual</h4>
						<div id="start-end-container" class="input-container">
							<input id="start" :value="effectDescriptor[currentEffect]['start']" v-on:input="updateStartEnd($event.target.value, 'start', false)">
							<br>
							<input id="end" :value="effectDescriptor[currentEffect]['end']" v-on:input="updateStartEnd($event.target.value, 'end', false)">
						</div>
						<h4 id="start-end-header">Start/End Timeline Contextual</h4>
						<div id="start-end-container" class="input-container">
							<input id="start" :value="effectDescriptor[currentEffect]['startGlobal']" v-on:input="updateStartEnd($event.target.value, 'start', true)">
							<br>
							<input id="end" :value="effectDescriptor[currentEffect]['endGlobal']" v-on:input="updateStartEnd($event.target.value, 'end', true)">
						</div>
						<button id="entireAudio" @click="updateStartEnd('max', 'both')">Entire Audio</button>
						<button @click="deleteEffect">Delete Effect</button>
					</div>
					<div class="knobs-container">
						<div id="start-knob-container" class="knob-container">
							<template v-for="knob in effectDescriptor[currentEffect]['knobs']">
								<h4>{{knob.title}}</h4>
								<knob-control v-model="knob['start']" :min="knob['min']" :max="knob['max']" :stepSize="knob['step']" :value-display-function="knobUpdate" :updateFunction="update" :effectId="effectId" :audioId="audioId" :type="'start'" :name="knob['name']" :primaryColor="knobColour"></knob-control>
<!-- 								Pitch modulation effect needs another parameter which will display the achieved pitch key as the value in the knob changes -->
							</template>
						</div>
						<div id="end-knob-container" class="knob-container-hidden">
							<template v-for="knob in effectDescriptor[currentEffect]['knobs']">
								<h4>{{knob.title}}</h4>
								<knob-control v-model="knob['target']" :min="knob['min']" :max="knob['max']" :stepSize="knob['step']" :value-display-function="knobUpdate" :updateFunction="update" :effectId="effectId" :audioId="audioId" :type="'target'" :name="knob['name']" :primaryColor="knobColour"></knob-control>
							</template>
						</div>
					</div>
				</div>
			</div>
		</div>
	</vue-draggable-resizable>
</template>

<script type="text/javascript">
		import utils from "../src/utils.js"
		import {Settings} from "../../../settings.js"
		import VueDraggableResizable from 'vue-draggable-resizable'
		import KnobControl from './KnobControl.vue'
		import axios from "axios"

		export default{
			"name": "Effect",
			components:{
				VueDraggableResizable,
				KnobControl
			},
			data(){
				return{
					currentEffect: "eq",
					out: 0,
					dragWidth: 350, //same dynamic rendering should be done for width
					dragHeight: 860, //Lets dynamically set this height in the future based on the required height of the effect - all effects other than EQ only require enough space for one knob
 					dragX: 200,
					dragY: 200,
					title: null,
					effectDescriptor: this.$store.getters.getUi["effects"],
					effectId: null,
					audioId: null,
					counterStart: 0,
					counterEnd: 0,
					barMarkers: null,
					knobColour: null
				}
			},
			methods:{
				deleteEffect(){
					this.$store.commit("deleteEffect", {"id": this.effectId, "audioId": this.audioId});
					this.closeModal();
				},
				closeModal(){
					this.modal.style.display = "none";
					this.draggableModal.style.display = "none";
					let modulatedAudio = this.$store.getters.getAudio(this.audioId);

					//Test running this when only tempo/pitch effect modulation happens vs any kind of modulation 
					//If this is used for any kind of modulation it may create bottlnecks in the speed of the application or speed up final mix processing time
					this.$parent.exterior.showLoader();
					this.$notify({
						type: "warn",
						group: "main",
						title: 'Audio Updating',
						text: 'Bar Markers and Waveform of audio are updating',
						duration: 1000
					});
					axios({ method: "POST", "url": this.baseUrl+"/meta/mix/"+this.mixId+"/audio/compute", "data": {"audio": modulatedAudio}, "headers": { "content-type": "application/json", "JWT-Auth":  this.jwt}})
					.then(result => {
						if ("data" in result.data){
							this.$store.commit("deleteAudio", this.audioId);
							let componentObj = this;
							result.data.data.originalLength = result.data.data.length;
							this.$parent.fetchWaveFormObj(result.data.data).then(function(data){
								result.data.data.rawWaveForm = data;
								componentObj.$store.commit("addAudio", result.data.data);
								componentObj.$parent.refreshAudio();
								componentObj.$parent.exterior.hideLoader();
								componentObj.$notify({
									type: "success",
									group: "main",
									title: 'Audio Updated',
									text: 'Bar Markers and Waveform has been updated',
									duration: 900,
									position: 'top right'
								});
							});
						} else {
							this.$parent.exterior.hideLoader();
							this.$notify({
								type: "success",
								group: "main",
								title: 'Audio Up to date',
								text: '',
								duration: 900,
								position: 'top right'
							});
						}
					}).catch(error => {
						//Display error on front end
						this.$parent.exterior.hideLoader();
						console.log(error.response)
					});
				},
				strengthCurveUpdate(value){
					this.$store.commit("updateEffect", {"id": this.effectId, "audioId": this.audioId, "strength_curve": value});
					this.effectDescriptor[this.currentEffect]['strengthCurve'] = value;
					if (value != "continuous"){
						this.hiddenKnobContainer.style.display = "block";
					} else {
						this.hiddenKnobContainer.style.display = "none";
					}
				},
				barValueUpdate(value, type){
					console.log("Updated", value, type)
					if (type != "inputStart" && type != "inputEnd") {
						let barValue;
						let barIndex;
						if (type == "barCountStart"){
							barIndex = this.counterStart + value;
						} else {
							barIndex = this.counterEnd + value;
						}
						if (value == -1){
							barValue = this.barMarkers[barIndex-1];

						} else {
							barValue = this.barMarkers[barIndex-1];
						}

						if (barValue != undefined){
							this.effectDescriptor[this.currentEffect][type] = barIndex;
							if (type == "barCountStart"){
								this.counterStart = barIndex;
								this.effectDescriptor[this.currentEffect]["start"] = barValue;
								this.effectDescriptor[this.currentEffect]['startGlobal'] = barValue + this.audioMixStart;
								this.$store.commit("updateEffect", {"id": this.effectId, "audioId": this.audioId, "start": barValue});
							} else {
								this.counterEnd = barIndex;
								this.effectDescriptor[this.currentEffect]["end"] = barValue;
								this.effectDescriptor[this.currentEffect]['endGlobal'] = barValue + this.audioMixStart;
								this.$store.commit("updateEffect", {"id": this.effectId, "audioId": this.audioId, "end": barValue});
							}
						}
					} else {
						let barIndex = value;
						if (type == "inputStart"){this.effectDescriptor[this.currentEffect]["barCountStart"] = value } else {this.effectDescriptor[this.currentEffect]["barCountEnd"] = value};
						let barValue = this.barMarkers[parseInt(barIndex) - 1];
						if (barValue != undefined){
							if (type == "inputStart"){
								this.counterStart = parseInt(barIndex) - 1;
								this.effectDescriptor[this.currentEffect]["start"] = barValue;
								this.effectDescriptor[this.currentEffect]['startGlobal'] = barValue + this.audioMixStart;
								console.log(this.effectDescriptor[this.currentEffect]["start"], this.effectDescriptor[this.currentEffect]["startGlobal"])
								this.$store.commit("updateEffect", {"id": this.effectId, "audioId": this.audioId, "start": barValue});
							} else {
								this.counterEnd = parseInt(barIndex) - 1;
								this.effectDescriptor[this.currentEffect]["end"] = barValue;
								this.effectDescriptor[this.currentEffect]['endGlobal'] = barValue + this.audioMixStart;
								this.$store.commit("updateEffect", {"id": this.effectId, "audioId": this.audioId, "end": barValue});
							}
						}
					}
				},
				update(value, effectId, audioId, type, name){
					//console.log("Update", value, effectId, audioId, type, name, this.effectData);
					if (audioId != null){
						value = this.knobRevert(value);
						let update;
						let out;
						if (this.currentEffect == "eq"){
								update = this.effectData[name];
								update[type] = value;
								out = {"id": this.effectId, "audioId": this.audioId};
								out[name] = update;
								this.$store.commit("updateEffect", out);
						} else {
							if (type == "start"){
								this.$store.commit("updateEffect", {"id": this.effectId, "audioId": this.audioId, "effectStart": Number(value)});
							} else {
								this.$store.commit("updateEffect", {"id": this.effectId, "audioId": this.audioId, "effectTarget": Number(value)});
							}
						}
					}
				},
				updateStartEnd(value, type, globalContext){
					//console.log("Update start end", value, type, globalContext)
					if (value != ""){
						if (type != "both"){
							if (globalContext == true){
								if (type == "start"){
									this.effectDescriptor[this.currentEffect]['startGlobal'] = value;
								} else {
									this.effectDescriptor[this.currentEffect]['endGlobal'] = value;
								}
								value = parseInt(value) - this.audioMixStart;
							} else {
								if (type == "start"){
									this.effectDescriptor[this.currentEffect]['startGlobal'] = parseInt(value) + this.audioMixStart;
								} else {
									this.effectDescriptor[this.currentEffect]['endGlobal'] = parseInt(value) + this.audioMixStart;
								}
							}
							this.effectDescriptor[this.currentEffect][type] = value;
							let out = {"id": this.effectId, "audioId": this.audioId}
							out[type] = value;
							this.$store.commit("updateEffect", out)
						} else {
							if (value == "max"){
								this.effectDescriptor[this.currentEffect]["start"] = this.audioStart;
								this.effectDescriptor[this.currentEffect]["end"] = this.audioEnd;
								this.effectDescriptor[this.currentEffect]['startGlobal'] = this.audioStart + this.audioMixStart;
								this.effectDescriptor[this.currentEffect]['endGlobal'] = this.audioEnd + this.audioMixStart;
								let out = {"id": this.effectId, "audioId": this.audioId}
								out["start"] = this.audioStart;
								out["end"] = this.audioEnd;
								this.$store.commit("updateEffect", out)
							}
						}
					}
				},
				knobUpdate(value){ //Currently knob update and knob revert are created using manual precision values - in the future this should be computed per effect type
					let multiplier;
					switch (this.currentEffect){
						case "eq":
							multiplier = Math.pow(10, 2 || 0); 
							value = Math.round(value * multiplier) / multiplier;
							return (value*100).toString() + "%";

						case "volume":
							multiplier = Math.pow(10, 2 || 0); 
							value = Math.round(value * multiplier) / multiplier;
							return (value*100).toString() + "%"; 

						case "highPass":
							return ">"+value.toString();

						case "lowPass":
							return "<"+value.toString();

						case "pitch":
							return value;

						case "tempo":
							return value;
					}
				},
				knobRevert(value){
					switch (this.currentEffect){
						case "eq":
							return value.slice(0, -1)/100;

						case "volume":
							return value.slice(0, -1)/100;

						case "lowPass":
							return value.substring(1);
						
						case "highPass":
							return value.substring(1);

						case "pitch":
							return value;

						case "tempo":
							return value;
					}
				},
				resetKnobs(){
					for (let i=0; i<this.effectDescriptor[this.currentEffect]["knobs"].length; i++){
						this.effectDescriptor[this.currentEffect]["knobs"][i]["start"] = this.effectDescriptor[this.currentEffect]["knobs"][i]["default"];
						this.effectDescriptor[this.currentEffect]["knobs"][i]["target"] = this.effectDescriptor[this.currentEffect]["knobs"][i]["default"];
					}
				},
				updateEffect(effectData){
					if (this.currentEffect == "eq"){
						if (effectData != null){
							this.effectDescriptor[this.currentEffect]["knobs"][0]["start"] = effectData["high"]["start"];
							this.effectDescriptor[this.currentEffect]["knobs"][0]["target"] = effectData["high"]["target"];

							this.effectDescriptor[this.currentEffect]["knobs"][1]["start"] = effectData["mid"]["start"];
							this.effectDescriptor[this.currentEffect]["knobs"][1]["target"] = effectData["mid"]["target"];

							this.effectDescriptor[this.currentEffect]["knobs"][2]["start"] = effectData["low"]["start"];
							this.effectDescriptor[this.currentEffect]["knobs"][2]["target"] = effectData["low"]["target"];
						} else {
							this.resetKnobs();
							this.effectData["high"] = {"start": 0, "target": 0};
							this.effectData["mid"] = {"start": 0, "target": 0};
							this.effectData["low"] = {"start": 0, "target": 0};
						}
					} else {
						if (effectData != null){
							this.effectDescriptor[this.currentEffect]["knobs"][0]["start"] = effectData["effectStart"];
							this.effectDescriptor[this.currentEffect]["knobs"][0]["target"] = effectData["effectTarget"];
						} else {
							this.resetKnobs();
							this.effectData["effectStart"] = this.effectDescriptor[this.currentEffect]["starting"];
							this.effectData["effectTarget"] = this.effectDescriptor[this.currentEffect]["starting"];
						}
					}
				},
				removeAudio(audioId){
					let currentUi = this.$store.getters.getUi;
					let mixData = this.$store.getters.getMixData;
					for (var i = 0; i < mixData.audio.length; i++) {
						console.log(mixData.audio[i].id, audioId);
						if (mixData.audio[i].id == audioId) {
							let audioTrueId = mixData.audio[i].audio_id;
							this.mixId = currentUi.currentMixId;
							this.$store.commit("deleteAudio", audioId);
							axios({ method: "POST", "url": this.baseUrl+"/meta/mix/"+this.mixId+"/audio/"+audioTrueId+"/delete", "headers": { "content-type": "application/json", "JWT-Auth":  this.jwt}})
								.then(result => {
									console.log(result.data)
								}).catch(error => {
							});
						}
					};
				},
				copyAudio(audioId){
					let copyId = utils.guid();
					let oldAudio = this.$store.getters.getAudio(audioId);
					this.$store.commit("copyAudio", {"copyId": audioId, "id": copyId});
					this.$store.commit("updateAudio", {"id": copyId, "start": oldAudio["end"], "end": oldAudio["end"] + (oldAudio["end"] - oldAudio["start"])})
				},
				cutAudio(audioItem, currentX){
					let currentUi = this.$store.getters.getUi;
					let cutTime = currentX / currentUi["timeScale"];
					let oldAudio = this.$store.getters.getAudio(audioItem.id);
					this.$store.commit("updateAudio", {"id": audioItem.id, "end": cutTime});
					let copyId = utils.guid();
					this.$store.commit("copyAudio", {"copyId": audioItem.id, "id": copyId});
					this.$store.commit("updateAudio", {"id": copyId, "start": cutTime, "end": audioItem.end, "song_start":  oldAudio["song_start"] + (cutTime - oldAudio["start"])});
					this.$store.commit("updateAudio", {"id": audioItem.id, "song_end": oldAudio["song_start"] + (cutTime - (oldAudio["start"]))});
					audioItem.songEnd = oldAudio["song_start"] + (cutTime - (oldAudio["start"]))
					audioItem.setWaveForm(audioItem.rawWaveForm, currentUi.timeScale, currentUi.frameStart, currentUi.trackTimelineOffset)
					//Here the waveform for the audioItem should be set again - song start/end should be taken into account on each setting of waveform

					let newAudio = this.$store.getters.getAudio(copyId);
					let oldAudioLength = oldAudio["end"] - oldAudio["start"];
					console.log(oldAudio, newAudio)

					//Update effect curves
					for (let i=0; i<oldAudio["effects"].length; i++){
						if (oldAudio["effects"][i]["start"] < cutTime && oldAudio["effects"][i]["end"] > cutTime){ //currently this is just setting the end of the effect to the cut time - should instead cross the effect between the two audio items with correct start/target values
							//Effect should be split between cut items
							oldAudio["effects"][i]["end"] = cutTime;
						}
					}

					for (let i=0; i<newAudio["effects"].length; i++){
						if (newAudio["effects"][i]["end"] < newAudio["start"]){ //currently this is just setting the end of the effect to the cut time - should instead cross the effect between the two audio items with correct start/target values
							//Effect should be split between cut items
							this.$store.commit("deleteFromArray", {"id": copyId, "key": "effects", "index": i});
						} else {
							newAudio["effects"][i]["start"] = newAudio["effects"][i]["start"] - oldAudioLength;
							newAudio["effects"][i]["end"] = newAudio["effects"][i]["end"] - oldAudioLength;
						}
					}

					for (let i=0; i<oldAudio["effects"].length; i++){
						if (oldAudio["effects"][i]["start"] > oldAudio["end"]){ //currently this is just setting the end of the effect to the cut time - should instead cross the effect between the two audio items with correct start/target values
							//Effect should be split between cut items
							this.$store.commit("deleteFromArray", {"id": audioItem.id, "key": "effects", "index": i});
						}
					}

					//Update beat markers

					for (let i=0; i<newAudio["beat_positions"].length; i++){ //Remove any bar markers before start of new audio cut segment (right side)
						if (newAudio["beat_positions"][i] + oldAudio["start"] < newAudio["start"]){
							delete newAudio["beat_positions"][i];
						}
						newAudio["beat_positions"][i] = newAudio["beat_positions"][i] - oldAudioLength;
					}

					for (let i=0; i<oldAudio["beat_positions"].length; i++){ //Remove any bar markers past new end of first audio cut segment (left side)
						if (oldAudio["beat_positions"][i] + oldAudio["start"] > oldAudio["end"]){
							delete oldAudio["beat_positions"][i];
						}
					}

					console.log("New values after cut", oldAudio, newAudio);
				},
				renderEffectModal(type, audioItem, effect){
					//Updates values in vuex and here so that the modal is rendered correctly with the correct ID's
					let currentUi = this.$store.getters.getUi;
					this.mixId = currentUi.currentMixId;
					this.$store.commit("updateUi", {"currentEffect": type});
					this.currentEffect = type;
					this.audioId = audioItem.id;
					this.barMarkers = audioItem.barMarkers;
					this.counterStart = 0;
					this.counterEnd = 0;
					this.knobColour = Settings.theme.effectColours[this.currentEffect];
					this.audioStart = audioItem.songStart;
					this.audioEnd = audioItem.songEnd;
					this.audioMixStart = audioItem.start;
					this.audioMixEnd = audioItem.end;
					let match = false;
					let startIndex = 0;

					while (match==false){
						if (audioItem.barMarkers[startIndex] != null){
							match = true;
						} else {
							startIndex += 1;
						}
					}

					this.effectDescriptor[this.currentEffect]['barCountStart'] = startIndex + 1;
					this.effectDescriptor[this.currentEffect]['barCountEnd'] = startIndex + 1;
					this.counterStart = startIndex;
					this.counterEnd = startIndex;

					if (effect == null){
						//Fresh effect
						let id = utils.guid();
						this.effectId = id;
						this.effectDescriptor[this.currentEffect]["start"] = 0;
						this.effectDescriptor[this.currentEffect]["end"] = 0;
						this.effectDescriptor[this.currentEffect]["strengthCurve"] = "continuous";
						let data = {"id": id, "start": 0, "end": 0, "strength_curve": "continuous", "audioId": this.audioId, "type": this.currentEffect};
						this.$store.commit("addEffect", data);
						this.effectData = data;
						this.updateEffect(null);
						this.hiddenKnobContainer.style.display = "none";

					} else {
						//Old effect used for updating		
						this.effectId = effect.id;	
						let effectData = this.$store.getters.getEffect({"audioId": this.audioId, "effectId": this.effectId});
						this.effectData = effectData;
						this.effectDescriptor[this.currentEffect]["start"] = effectData["start"];
						this.effectDescriptor[this.currentEffect]["end"] = effectData["end"];
						this.effectDescriptor[this.currentEffect]["strengthCurve"] = effectData["strength_curve"];
						this.updateEffect(effectData);

						if (effectData["strength_curve"] != "continuous"){
							this.hiddenKnobContainer.style.display = "block";
						} else {
							this.hiddenKnobContainer.style.display = "none";
						}
					}
					this.modal.style.display = "block";
					this.draggableModal.style.display = "block";
				}
			},
			mounted(){
				let currentAppData = this.$store.getters.getAppData;
				let currentUserData = this.$store.getters.getUserData;
				this.jwt = currentUserData["jwtToken"];
				this.modal = document.getElementById("effectModal");
				this.draggableModal = document.getElementById("draggable-master");
				this.hiddenKnobContainer = document.getElementById("end-knob-container");
				this.baseUrl = currentAppData["baseUrl"];
				let browserHorizonHalf = window.innerWidth / 2;
				let browserVerticalHalf = window.innerHeight / 2;

				this.dragHeight = browserVerticalHalf;
				this.dragWidth = browserHorizonHalf/2;
				this.dragX = browserHorizonHalf ;
				this.dragY = browserVerticalHalf;
			}
		}
</script>