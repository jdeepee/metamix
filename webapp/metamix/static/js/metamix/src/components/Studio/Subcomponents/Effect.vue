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
								<knob-control v-model="knob['start']" :min="knob['min']" :max="knob['max']" :stepSize="knob['step']" :value-display-function="knobUpdate" :updateFunction="update" :effectId="effectId" :audioId="audioId" :type="'start'" :name="knob['name']"></knob-control>
							</template>
						</div>
						<div id="end-knob-container" class="knob-container-hidden">
							<template v-for="knob in effectDescriptor[currentEffect]['knobs']">
								<h4>{{knob.title}}</h4>
								<knob-control v-model="knob['target']" :min="knob['min']" :max="knob['max']" :stepSize="knob['step']" :value-display-function="knobUpdate" :updateFunction="update" :effectId="effectId" :audioId="audioId" :type="'target'" :name="knob['name']"></knob-control>
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
					dragWidth: 350,
					dragHeight: 600,
					dragX: 200,
					dragY: 200,
					title: null,
					effectDescriptor: this.$store.getters.getUi["effects"],
					effectId: null,
					audioId: null,
					counterStart: 0,
					counterEnd: 0,
					barMarkers: null
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
						switch (this.currentEffect){
							case "eq":
								let update = this.effectData[name];
								update[type] = value;
								let out = {"id": this.effectId, "audioId": this.audioId};
								out[name] = update;
								this.$store.commit("updateEffect", out);
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
					let multiplier = Math.pow(10, 2 || 0); 
					value = Math.round(value * multiplier) / multiplier;
					return (value*100).toString() + "%";
				},
				knobRevert(value){
					value = value.slice(0, -1);
					return value/100;
				},
				updateEffect(effectData){
					switch (this.currentEffect){ //Also likley that EQ is the only rendered effect that has difference in the way we store the effect paramters - if/else might work better than a switch statement here
						case "eq":
							if (effectData != null){
								this.effectDescriptor[this.currentEffect]["knobs"][0]["start"] = effectData["high"]["start"];
								this.effectDescriptor[this.currentEffect]["knobs"][0]["target"] = effectData["high"]["target"];

								this.effectDescriptor[this.currentEffect]["knobs"][1]["start"] = effectData["mid"]["start"];
								this.effectDescriptor[this.currentEffect]["knobs"][1]["target"] = effectData["mid"]["target"];

								this.effectDescriptor[this.currentEffect]["knobs"][2]["start"] = effectData["low"]["start"];
								this.effectDescriptor[this.currentEffect]["knobs"][2]["target"] = effectData["low"]["target"];
							} else {
								this.effectDescriptor[this.currentEffect]["knobs"][0]["start"] = 0; //This can be broken out into a function which will get the default vaues for the current effect and use this to set the knobs - this doesnt need to be done per effect type
								this.effectDescriptor[this.currentEffect]["knobs"][0]["target"] = 0;

								this.effectDescriptor[this.currentEffect]["knobs"][1]["start"] = 0;
								this.effectDescriptor[this.currentEffect]["knobs"][1]["target"] = 0;

								this.effectDescriptor[this.currentEffect]["knobs"][2]["start"] = 0;
								this.effectDescriptor[this.currentEffect]["knobs"][2]["target"] = 0;

								this.effectData["high"] = {"start": 0, "target": 0};
								this.effectData["mid"] = {"start": 0, "target": 0};
								this.effectData["low"] = {"start": 0, "target": 0};
							}
							break;

						case "volume":
							if (effectData != null){
								this.effectDescriptor[this.currentEffect]["knobs"][0]["start"] = effectData["effectStart"];
								this.effectDescriptor[this.currentEffect]["knobs"][0]["target"] = effectData["effectTarget"];
							} else {
								this.effectDescriptor[this.currentEffect]["knobs"][0]["start"] = 1;
								this.effectDescriptor[this.currentEffect]["knobs"][0]["target"] = 1;
								this.effectData["effectStart"] = 1;
								this.effectData["effectTarget"] = 1;
							}
							break;
					}
				},
				removeAudio(audioId){
					this.$store.commit("deleteAudio", audioId);
				},
				cutAudio(audioItem, currentX){
					let currentUi = this.$store.getters.getUi;
					let cutTime = utils.x_to_time(currentX, currentUi["timeScale"], currentUi["scrollTime"]);
					this.$store.commit("updateAudio", {"id": audioItem.id, "end": cutTime});
					let copyId = utils.guid();
					this.$store.commit("copyAudio", {"copyId": audioItem.id, "id": copyId});
					this.$store.commit("updateAudio", {"id": copyId, "start": cutTime, "end": audioItem.end});

					//Add code to also split effect

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