<template>
	<div>
		<div id="left-column">
			<canvas id="left-column-canvas"></canvas>
		</div>
		<div id="zoom-column">
			<input id="range-slider" v-model="rangeValue" type="range" min="1" max="150" step="0.5" v-on:mousemove="rangeUpdate" v-on:mousedown="rangeDown" v-on:mouseup="rangeUp">
<!-- 			<input id="timeline-size-input" v-on:input="updateTimelineSize"> -->
			<button type="button" @click="saveAudio">Save</button>
			<div id="play-pause">
				<i class="material-icons" @click="playAudio">play_arrow</i><i class="material-icons" @click="pauseAudio">pause</i>
			</div>
		</div>
		<div style="display: none; justify-content: center; top:20%" id="loader-wrapper">
			<semipolar-spinner
				:animation-duration="2000"
				:size="loaderSize"
				color="#4286f4"
			/>
		</div>
		<div id="add-song" @click="updateAudioModal()">
			<i class="material-icons" style="font-size: 5rem">expand_less</i>
		</div>
		<transition name="fade">
			<div id="audio-modal" v-if="showAudio">
				<template v-for="audio in audioData">
					<VueDraggableResizable :resizable="false" class="audio-element" :x="audio.x" :y="audio.y" :w="audio.w" :h="audio.h" :id="audio.id" @dragstop="onDragstop">
						<h4>{{audio.name}}</h4>
						<p>Audio Key: {{audio.key}}</p>
						<p>BPM: {{audio.bpm}}</p>
					</VueDraggableResizable>
				</template>
    		</div>
  		</transition>
	</div>
</template>

<script type="text/javascript">
	import {Settings} from "../../../settings.js";
	import utils from "../src/utils.js";
	import axios from "axios";
	import VueDraggableResizable from './vue-draggable-resizable.vue';
	import {SemipolarSpinner} from 'epic-spinners';

	export default {
		name: "Exterior",
		components: {
			VueDraggableResizable,
			SemipolarSpinner
		},
		data(){
			return {
				dragging: 0,
				rangeValue: undefined,
				showAudio: false,
				effectDescriptor: this.$store.getters.getUi["effects"],
				timeBegan: null,
				timeStopped: null,
				stoppedDuration: 0,
				started: null,
				loaderSize: 40,
				prevOffset: 0,
				playing: false
			}
		},
		methods:{
			showLoader(){
				this.loadingWrapper.style.display = "flex";
			},
			hideLoader(){
				this.loadingWrapper.style.display = "none";
			},
			saveAudio(){
				if (this.$parent.upToDate() == true){
					this.$notify({
						type: "success",
						group: "main",
						title: 'Mix Up To Date',
						text: 'Your mix is up to date',
						duration: 500
					});
					return;
				}
				let mixData = JSON.parse(JSON.stringify(this.$store.getters.getMixData));
				for (let i=0; i<mixData.audio.length; i++){ //Iterate over mixData to be sent to backend - delete all unnecassary key/value pairs along with redundant effects
					delete mixData.audio[i].rawWaveForm;

					for (let i2=mixData.audio[i].effects.length-1; i2 > -1; i2--){
						delete mixData.audio[i].effects[i2].startX;
						delete mixData.audio[i].effects[i2].endX;

						if (mixData.audio[i].effects[i2].start == 0 && mixData.audio[i].effects[i2].end == 0){
							mixData.audio[i].effects.splice(i2, 1);
						} else if (mixData.audio[i].effects[i2].type != "eq"){ //No need to handle EQ effect having start/target as 0 - backend already does this when parsing the three eq effects (high,mid,low)
							if (mixData.audio[i].effects[i2].effectStart == this.effectDescriptor[mixData.audio[i].effects[i2].type]["starting"] && mixData.audio[i].effects[i2].effectTarget == this.effectDescriptor[mixData.audio[i].effects[i2].type]["starting"]){
								mixData.audio[i].effects.splice(i2, 1);
							}
						}
					}
				}
				console.log("Saving mix with data: ", mixData)
				mixData = {"id": mixData.id, "mix_description": mixData, "description": mixData.description, "genre": mixData.genre, "name": mixData.name};
				axios({ method: "POST", "url": this.baseUrl+"/meta/mix", "data": mixData, "headers": { "content-type": "application/json", "JWT-Auth":  this.jwt}})
				.then(result => {
					this.$notify({
						type: "success",
						group: "main",
						title: 'Mix Saved',
						text: 'Your mix has been saved - it is now processing.',
						duration: 800
					});
					this.hideLoader();
					this.$store.commit("addSavedMixData", JSON.parse(JSON.stringify(this.$store.getters.getMixData)));
				}).catch(error => {
                	//Display error on front end
					   console.log(error.response)
					   this.hideLoader();
				});
			},
			playAudio(){
				if (this.$parent.upToDate() == false){
					this.$notify({
						type: "error",
						group: "main",
						title: 'Mix needs to be saved',
						text: 'Mix must be saved to our server before you are able to play this version',
						duration: 1000
					});
					return;
				}
				//Get mix from API - check that processing == Complete. If not complete then raise error notifications saying mix is still processing. Otherwise get mix from s3 key - then play. 
				let mixData = this.$store.getters.getMixData;
				axios({ method: "GET", "url": this.baseUrl+"/meta/mix/"+mixData.id, "headers": { "content-type": "application/json", "JWT-Auth":  this.jwt}})
				.then(result => {
					console.log(result.data)
					if (result.data.processing_status == "Completed") {
						this.start();
						this.playing = true;
					} else if (result.data.processing_status == "Processing"){
						this.$notify({
							type: "error",
							group: "main",
							title: 'Mix is still processing please wait',
							text: 'MetaMix is processing your changes - you will be able to play your mix when the changes have completed',
							duration: 1000
						});
					} else if (result.data.processing_Status == "Error"){
						this.$notify({
							type: "error",
							group: "main",
							title: 'There has been an error on MetaMix :(',
							text: 'In order to get this error fixed please send an email to joshuadparkin@gmail.com with the following value referenced:' + this.mixData.id + ' thanks for dealing with errors - MetaMix is still very early software and is undergoing bug fixes all the time. Thanks <3',
							duration: 7000
						});
					}
				}).catch(error => {
					console.log(error.resonse)
				});
			},
			pauseAudio(){
				this.stop();
				this.playing = false;
			},
			start(){
				let currentUi = this.$store.getters.getUi;
				if (currentUi.currentTime != this.timeElapsed && this.timeElapsed != undefined){
					this.offset = (currentUi.currentTime - this.timeElapsed);
				} else {
					this.offset = 0;
				}
				this.offset += this.prevOffset;
				if (this.timeBegan === null) {
					this.timeBegan = new Date();
				} else {
					clearInterval(this.started);
				}

				if (this.timeStopped !== null) {
					this.stoppedDuration += (new Date() - this.timeStopped);
				}
				this.started = setInterval(this.clockRunning, 10);	
			},
			stop() {
				this.timeStopped = new Date();
				this.prevOffset = this.offset;
			    clearInterval(this.started);
			    // this.stoppedDuration = 0;
			    // this.timeBegan = null;
			    // this.timeStopped = null;
			},
			clockRunning(){
			    let currentTime = new Date();
			    let timeElapsed = new Date(currentTime - this.timeBegan - this.stoppedDuration)
				timeElapsed = timeElapsed.getTime() / 1000;
				this.timeElapsed = timeElapsed + this.offset;
				this.$store.commit("updateUi", {"currentTime": this.timeElapsed});
			},
			$ready(fn) {
				if (process.env.NODE_ENV === 'production') {
					return this.$nextTick(fn);
				}

				setTimeout(() => {
					this.$nextTick(fn);
				});
			},
			onDragstop(dragObj){
				//x,y is in the context of the parent modal not the entire screen
				//insert element into timeline with given track and time depending on x/y value
				//reset dragging element x/y
				let x = dragObj.left;
				let y = dragObj.top;
				let id = dragObj.$props.id;
				let result = JSON.parse(JSON.stringify(this.audioData.filter(obj => {
					return obj.id == id
				})[0]));
				let origX = result.x;
				let origY = result.y;

				if (y < 0){
					let currentUi = this.$store.getters.getUi;
					let track;
					let canvas = document.querySelector("#timeline-canvas");
					let bounds = canvas.getBoundingClientRect();
					x = (x-currentUi.trackTimelineOffset)/window.devicePixelRatio; 
					y = ((y+window.innerWidth*0.6)-bounds.left)/window.devicePixelRatio;
					let inputTime = currentUi["scrollTime"] + (x) / currentUi["timeScale"];
					
					for (let i=0; i<currentUi.tracks; i++){
						//Cursor has moved to a new track - update Y track
						if (y > currentUi.trackBounds[i][0] && y < currentUi.trackBounds[i][1]){
							//Write code to ensure track cant change if position will be inside another audio on Y track
							track = i;
						}
					}
					//console.log("Track value", track, y)
					//prepare audio data for insertion into studio
					result.beat_positions = JSON.parse(result.beat_positions);
					result.effects = [];
					result.audio_id = result.id; //Backend song linked ID
					result.id = utils.guid(); //Local front end ID
					result.start = inputTime;
					result.end = inputTime + result.length;
					result.song_start = 0;
					result.song_end = result.length;
					result.originalLength = result.length;
					result.track = track;
					delete result.x;
					delete result.y;
					delete result.w;
					delete result.h;
					console.log("Adding audio", result)
					this.$store.commit("addAudio", result)
				}

				dragObj.left = origX;
				dragObj.top = origY;
			},
			computeAudioXy(type){
				let audioWidth = 160;
				let audioHeight = 140;
				let paddingX = 20;
				let paddingY = 20;
				let yCount = 0;
				let xCount = 0;
				let maxItemsW = window.innerWidth / (audioWidth+(paddingX*2) + paddingX);

				for (let i=0; i<this.audioData.length; i++){
					if (i == 0){
						this.audioData[i].x = paddingX;
						this.audioData[i].y = paddingY;
						xCount += 1;
					} else {
						if (xCount >= maxItemsW){
							xCount = 0;
							yCount += 1;
							this.audioData[i].x = paddingX;
							this.audioData[i].y = (paddingY) + (yCount * audioHeight);
						} else {
							// console.log(xCount, yCount, this.audioData[i].name, (paddingY) + (yCount * audioHeight), ((paddingX*2)*xCount + audioWidth*xCount), xCount)
							this.audioData[i].x = ((paddingX*2)*xCount + audioWidth*xCount) + paddingX;
							this.audioData[i].y = (paddingY) + (yCount * audioHeight);
							xCount += 1
						}
					}
					this.audioData[i].type = type
					this.audioData[i].w = audioWidth;
					this.audioData[i].h = audioHeight;

				}
				// console.log(this.audioData);
			},
			getAudio(){
				axios({ method: "GET", "url": this.baseUrl+"/meta/song", "headers": { "content-type": "application/json", "JWT-Auth":  this.jwt}})
				.then(result => {
					console.log("Song data", result)
					let songResult = result.data;
					this.audioData = songResult;
					this.computeAudioXy("song");
                }).catch(error => {
                	//Display error on front end
   					console.log(error.response)
				});
				// axios({ method: "GET", "url": this.baseUrl+"/meta/clip", "headers": { "content-type": "application/json", "JWT-Auth":  this.jwt}})
				// .then(result => {
				// 	let clipResult = result.data;
    //             }).catch(error => {
    //             	//Display error on front end
   	// 				console.log(error.response)
				// });
			},
			// updateTimelineSize(value){
			// 	console.log("update")
			// 	this.$store.commit("updateUi", {"totalTime": value});
			// },
			updateAudioModal(){
				this.showAudio = !this.showAudio;
				let modalIcon = document.getElementById("add-song");
				if (this.showAudio == true){
					modalIcon.style.bottom = "40%";
				} else {
					modalIcon.style.bottom = 0;
				}
			},
			rangeUpdate(){
				if (!this.dragging) return;
				this.$store.commit("updateUi", {"timeScale": this.rangeValue});
			},
			rangeDown(){
				this.dragging = 1;
			},
			rangeUp(){
				this.dragging = 0;
			},
			resize(){
				let parentDiv = document.getElementById("left-column");
				this.dpr = window.devicePixelRatio;
				this.canvas.width = parentDiv.offsetWidth;
				this.canvas.height = parentDiv.offsetHeight;
				this.width = parentDiv.offsetWidth;
				this.height = parentDiv.offsetHeight;
			},
			paint(){
				let currentUi = this.$store.getters.getUi;
				let trackLayers = currentUi["tracks"];
				let lineHeight = currentUi["lineHeight"];
				let offset = currentUi["trackTimelineOffset"];

				this.ctx.fillStyle = Settings.theme.a;
				this.ctx.fillRect(0, 0, this.width, this.height);
				this.ctx.save();
				this.ctx.scale(this.dpr, this.dpr);

				for (let i = 0; i <= trackLayers; i++){
					this.ctx.strokeStyle = Settings.theme.b;
					this.ctx.beginPath();
					this.ctx.moveTo(0, ((offset + i*lineHeight)/this.dpr)+i);
					this.ctx.lineTo(this.width, ((offset + i*lineHeight)/this.dpr)+i);
					this.ctx.stroke();

					if (i != 0){
						this.ctx.fillStyle = Settings.theme.d;
						this.ctx.textAlign = 'center';
						this.ctx.fillText(i.toString(), this.width/4, ((offset + i*lineHeight)/this.dpr)-(lineHeight/4));
					}
				}
				this.ctx.restore();
			},
			init(){
				let currentUi = this.$store.getters.getUi;
				this.rangeValue = currentUi["timeScale"];

				let parentDiv = document.getElementById("left-column");
				this.canvas = document.getElementById("left-column-canvas");
				this.ctx = this.canvas.getContext('2d');
				this.canvas.width = parentDiv.offsetWidth;
				this.canvas.height = parentDiv.offsetHeight;
				this.width = parentDiv.offsetWidth;
				this.height = parentDiv.offsetHeight;
				this.dpr = window.devicePixelRatio;
			}
		},
		mounted(){
			let currentAppData = this.$store.getters.getAppData;
			let currentUserData = this.$store.getters.getUserData;
			this.baseUrl = currentAppData["baseUrl"];
			this.jwt = currentUserData["jwtToken"];
			this.getAudio();
			this.loadingWrapper = document.querySelector("#loader-wrapper");
		}	
	}
</script>