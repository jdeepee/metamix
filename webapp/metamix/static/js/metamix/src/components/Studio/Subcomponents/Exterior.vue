<template>
	<div>
		<div id="left-column">
			<canvas id="left-column-canvas"></canvas>
		</div>
		<div id="zoom-column">
			<input id="range-slider" v-model="rangeValue" type="range" min="1" max="150" step="0.5" v-on:mousemove="rangeUpdate" v-on:mousedown="rangeDown" v-on:mouseup="rangeUp">
<!-- 			<input id="timeline-size-input" v-on:input="updateTimelineSize"> -->
		</div>
		<div id="add-song" @click="updateAudioModal()">
			<i class="material-icons" style="font-size: 5rem">expand_less</i>
		</div>
		<transition name="fade">
			<div id="audio-modal" v-if="showAudio">
				<template v-for="audio in audioData">
					<VueDraggableResizable :resizable="false" class="audio-element" :x="audio.x" :y="audio.y" :w="audio.w" :h="audio.h" :id="audio.id" @dragstop="onDragstop">
						<h4>{{audio.name}}</h4>
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

	export default {
		name: "Exterior",
		components: {
			VueDraggableResizable
		},
		data(){
			return {
				dragging: 0,
				rangeValue: undefined,
				showAudio: false
			}
		},
		methods:{
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
					result.song_id = result.id;
					result.id = utils.guid();
					result.raw_wave_form = null;
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
					this.$store.commit("addAudio", result)
				}

				dragObj.left = origX;
				dragObj.top = origY;
			},
			computeAudioXy(){
				let audioWidth = 160;
				let audioHeight = 120;
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
					this.audioData[i].w = audioWidth;
					this.audioData[i].h = audioHeight;

				}
				// console.log(this.audioData);
			},
			getAudio(){
				console.log(this.baseUrl)
				axios({ method: "GET", "url": this.baseUrl+"/meta/song", "headers": { "content-type": "application/json", "JWT-Auth":  this.jwt}})
				.then(result => {
					let songResult = result.data;
					this.audioData = songResult;
					this.computeAudioXy();
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
		}	
	}
</script>