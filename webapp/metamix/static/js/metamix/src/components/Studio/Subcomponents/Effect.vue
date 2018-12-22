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
							<p id="barStartCounter">{{effectDescriptor[currentEffect]['barCountStart']}}</p>
							<button id="barUpStart" @click="barValueUpdate(1, 'barCountStart')">&uarr;</button>
							<button id="barDownEnd" @click="barValueUpdate(-1, 'barCountEnd')">&darr;</button>
							<p id="barEndCounter">{{effectDescriptor[currentEffect]['barCountEnd']}}</p>
							<button id="barUpEnd" @click="barValueUpdate(1, 'barCountEnd')">&uarr;</button>
						</div>
						<div id="start-end-container" class="input-container">
							<input id="start" :value="effectDescriptor[currentEffect]['start']" v-on:input="updateStartEnd($event.target.value, 'start')">
							<br>
							<input id="end" :value="effectDescriptor[currentEffect]['end']" v-on:input="updateStartEnd($event.target.value, 'end')">
						</div>
					</div>
					<div class="knobs-container">
						<div id="start-knob-container" class="knob-container">
							<template v-for="knob in effectDescriptor[currentEffect]['knobs']">
								<h4>{{knob.title}}</h4>
								<knob-control v-model="knob['start']" :min="knob['min']" :max="knob['max']" :stepSize="knob['step']" :value-display-function="knobUpdate" :updateFunction="update" :effectId="effectId" :audioId="audioId" :type="'start'" :name="knob['name']" :primaryColor="knobColour"></knob-control>
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
							this.$store.commit("updateEffect", {"id": this.effectId, "audioId": this.audioId, "start": barValue});
						} else {
							this.counterEnd = barIndex;
							this.effectDescriptor[this.currentEffect]["end"] = barValue;
							this.$store.commit("updateEffect", {"id": this.effectId, "audioId": this.audioId, "end": barValue});
						}
					}
				},
				update(value, effectId, audioId, type, name){
					console.log("Update", value, effectId, audioId, type, name, this.effectData);
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
				updateStartEnd(value, type){
					if (value != ""){
						this.effectDescriptor[this.currentEffect][type] = value;
						let out = {"id": this.effectId, "audioId": this.audioId}
						out[type] = value;
						this.$store.commit("updateEffect", out)
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
							this.effectData["effectStart"] = 1;
							this.effectData["effectTarget"] = 1;
						}
					}
				},
				removeAudio(audioId){
					this.$store.commit("deleteAudio", audioId);
					console.log(this.$store.getters.getMixData);
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

					let newAudio = this.$store.getters.getAudio(copyId);
					let oldAudioLength = oldAudio["end"] - oldAudio["start"];

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

					for (let i=0; i<newAudio["beat_markers"].length; i++){ //Remove any bar markers before start of new audio cut segment (right side)
						if (newAudio["beat_markers"][i] + oldAudio["start"] < newAudio["start"]){
							delete newAudio["beat_markers"][i];
						}
						newAudio["beat_markers"][i] = newAudio["beat_markers"][i] - oldAudioLength;
					}

					for (let i=0; i<oldAudio["beat_markers"].length; i++){ //Remove any bar markers past new end of first audio cut segment (left side)
						if (oldAudio["beat_markers"][i] + oldAudio["start"] > oldAudio["end"]){
							delete oldAudio["beat_markers"][i];
						}
					}

					console.log("New values after cut", oldAudio, newAudio);
				},
				renderEffectModal(type, audioItem, effect){
					//Updates values in vuex and here so that the modal is rendered correctly with the correct ID's
					let currentUi = this.$store.getters.getUi;
					this.$store.commit("updateUi", {"currentEffect": type});
					this.currentEffect = type;
					this.audioId = audioItem.id;
					this.barMarkers = audioItem.barMarkers;
					this.counterStart = 0;
					this.counterEnd = 0;
					this.knobColour = Settings.theme.effectColours[this.currentEffect];

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
				this.modal = document.getElementById("effectModal");
				this.draggableModal = document.getElementById("draggable-master");
				this.hiddenKnobContainer = document.getElementById("end-knob-container");
				let browserHorizonHalf = window.innerWidth / 2;
				let browserVerticalHalf = window.innerHeight / 2;

				this.dragHeight = browserVerticalHalf;
				this.dragWidth = browserHorizonHalf/2;
				this.dragX = browserHorizonHalf ;
				this.dragY = browserVerticalHalf;
			}
		}
</script>