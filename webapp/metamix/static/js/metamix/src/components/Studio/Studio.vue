<style type="text/css">
@import './style.css';
@import './effect-style.css';
@import './menu.css';
</style>

<template>
	<div>
		<div id="top-toolbar" class="flex-container">
			<div id="cut" class="flex-item" @click="effectClick('cut')">
				<i class="material-icons" style="font-size: 5rem">content_cut</i>
				<p>Cut</p>
			</div>
			<div id="eq" class="flex-item" @click="effectClick('eq')">
				<i class="material-icons" style="font-size: 5rem">tune</i>
				<p>EQ</p>
			</div>
			<div id="volume" class="flex-item" @click="effectClick('volume')">
				<i class="material-icons" style="font-size: 5rem">volume_up</i>
				<p>Volume Modulation</p>
			</div>
			<div id="highPass" class="flex-item" @click="effectClick('highPass')">
				<i class="material-icons" style="font-size: 5rem">blur_linear</i>
				<p>High Pass Filter</p>
			</div>
			<div id="lowPass" class="flex-item" @click="effectClick('lowPass')">
				<i class="material-icons" id="low-pass">blur_linear</i>
				<p>Low Pass Filter</p>
			</div>
			<div id="pitch" class="flex-item" @click="effectClick('pitch')">
				<i class="material-icons" style="font-size: 5rem">trending_up</i>
				<p>Pitch Shift</p>
			</div>
			<div id="tempo" class="flex-item" @click="effectClick('tempo')">
				<i class="material-icons" style="font-size: 5rem">fast_rewind</i><i class="material-icons" style="font-size: 5rem">fast_forward</i>
				<p>Tempo Modulation</p>
			</div>
			<div id="remove" class="flex-item" @click="effectClick('remove')">
				<i class="material-icons" style="font-size: 5rem" id="removeI">cancel</i>
				<p>Remove Audio</p>
			</div>
		</div>
		<Scroll></Scroll>
		<div id="timeline">
			<canvas id="timeline-canvas"></canvas>
		</div>
		<Exterior></Exterior>
		<Effect></Effect>
	</div>

</template>

<script type="text/javascript">
	import {Settings} from "../../settings.js";
	import utils from "./src/utils.js";
	import AudioItem from "./src/audio.js";
	import Scroll from "./Subcomponents/Scroll.vue";
	import Exterior from "./Subcomponents/Exterior.vue";
	import Effect from "./Subcomponents/Effect.vue";
	import ContextMenu from "./src/menu.js";
	import WaveformData from "waveform-data";
	import axios from "axios";

	export default {
		name: "Timeline",
		components:{
			Scroll,
			Exterior,
			Effect
		},
		data(){
			return {
				canvas: undefined,//This can be accesed on self from either mounted or resize methods
				menuItems: [
					  {
					    "text": "Copy Item"
					  },
					  {
					    "type": ContextMenu.DIVIDER 
					  },
					  {
					    "text": "Add Effect",
					   	"sub": [
					      {
					        "text": "EQ"
					      },
					      {
					        "text": "Volume Modulation"
					      },
					      {
					      	"text": "High Pass Filter"
					      },
					      {
					      	"text": "Low Pass Filter"
					      },
					      {
					      	"text": "Pitch Shift"
					      },
					      {
					      	"text": "Tempo Modulation"
					      }
					    ]
					  },
					  {
					    "type": ContextMenu.DIVIDER 
					  },
					  {
					  	"text": "Create Clip"
					  },
					  {
					    "type": ContextMenu.DIVIDER 
					  },
					  {
					  	"text": "Delete Audio"
					  },
					  {
					    "type": ContextMenu.DIVIDER 
					  },
					  {
					  	"text": "Adjust Bar Markers"
					  }
				],
				overwriteCursor: false,
				draggingx: null,
				currentDragging: null,
				holdTick: 0, //Handles snapping of items on y axis to assist with moving tracks together
				block: false,
				lastX: 0,
				startX: null,
				endX: null,
				trackSave: null, //Saves state of audio items on timeline - to be used if audioItem Y position is put back to previous state - should save
				trackSave2: null,
				blockNumber: 0,
				renderedItems: false,
				drawSnapMarker: false,
				renderItems: [],
				trackBounds: {},
				resetWaveForm: false,
				hit: false,
				cuttingAudio: false
			}
		},
		methods:{
			upToDate(){
				//Checks if current mixData == last saved mix data
				console.log("up to date called", this.$store.getters.getSavedMixData, this.$store.getters.getMixData);
				return this.$store.getters.getSavedMixData == this.$store.getters.getMixData;
			},
			$ready(fn) {
				if (process.env.NODE_ENV === 'production') {
					return this.$nextTick(fn);
				}

				setTimeout(() => {
					this.$nextTick(fn);
				});
			},
			removeRenderItem(index){
				this.renderItems.splice(index, 1);
			},
			effectClick(type){
				console.log("Effect clicked", type);
				if (type == "cut"){
					this.canvas.classList.add("cut-cursor");
					this.cuttingAudio = true;
					this.overwriteCursor = true;
				}
				let componentObj = this;
				let audioSelectCallback = function(e) {
					let currentUi = componentObj.$store.getters.getUi;
					let timeScale = currentUi["timeScale"];
					let frameStart = currentUi["scrollTime"];
					let currentX = ((e.clientX - componentObj.bounds.left)/componentObj.dpr + (frameStart * timeScale));
					let currentY = (e.clientY - componentObj.bounds.top)/componentObj.dpr;

					for (let i=0; i<componentObj.renderItems.length; i++){
						if (componentObj.renderItems[i].contains(currentX, currentY, timeScale, frameStart)){
							componentObj.renderItems[i].effectGlow();
							switch (type){
								case "eq":
									componentObj.effectHandler.renderEffectModal(type, componentObj.renderItems[i], null);
									break;

								case "remove":
									componentObj.effectHandler.removeAudio(componentObj.renderItems[i].id);
									componentObj.removeRenderItem(i);
									break;

								case "cut":
									//If we cannot stop the X value accuractely when mouse is over a bar marker it is probably sensible to check if there is a block and if so take the drawsnapmarker position and use this as the currentX value
									componentObj.effectHandler.cutAudio(componentObj.renderItems[i], currentX);
									componentObj.cuttingAudio = false;
									componentObj.overwriteCursor = false;
									componentObj.canvas.classList.remove("cut-cursor");
									break;

								case "volume":
									componentObj.effectHandler.renderEffectModal(type, componentObj.renderItems[i], null);
									break;

								case "highPass":
									componentObj.effectHandler.renderEffectModal(type, componentObj.renderItems[i], null);
									break;

								case "lowPass":
									componentObj.effectHandler.renderEffectModal(type, componentObj.renderItems[i], null);
									break;

								case "pitch":
									componentObj.effectHandler.renderEffectModal(type, componentObj.renderItems[i], null);
									break;

								case "tempo":
									componentObj.effectHandler.renderEffectModal(type, componentObj.renderItems[i], null);
									break;


							}
							componentObj.canvas.removeEventListener('click', audioSelectCallback, false);
						}
					}
				}
				this.canvas.addEventListener("click", audioSelectCallback, false);
				this.$notify({
					type: "success",
					group: "main",
					title: 'Select audio which you would like to add ' + type + ' effect to',
					text: '',
					duration: 400
				});
			},
			timeScaled(){
				let div = 60;

				this.tickMark1 = this.timeScale / div;
				this.tickMark2 = 2 * this.tickMark1;
				this.tickMark3 = 10 * this.tickMark1;
			},
			resize() {
				let parentDiv = document.getElementById("timeline")
				this.dpr = window.devicePixelRatio; 
				this.height = parentDiv.offsetHeight;
				this.width = parentDiv.offsetWidth;
				this.canvas.height = this.height;
				this.canvas.width = this.width;
				this.$store.commit("updateUi", {"lineHeight": this.height*Settings.lineHeightProportion});
				this.scrollCanvas.resize();
				this.exterior.resize();
				this.resetWaveForm = true;
				this.bounds = this.canvas.getBoundingClientRect();

				//Redefine track bounds after resize
				for (let i=0; i<this.trackLayers; i++){
					this.trackBounds[i] = [(this.offset + i*this.lineHeight)/this.dpr, (this.offset + (i+1)*this.lineHeight)/this.dpr];
				}
				this.$store.commit("updateUi", {"trackBounds": this.trackBounds});
			},
			moveY(yPosition){
				let track = this.currentDragging.track;
				// console.log(yPosition);
				// console.log(this.trackLayers);
				// console.log(this.trackBounds);
				for (let i=0; i<this.trackLayers; i++){
					//Cursor has moved to a new track - update Y track
					if (yPosition > this.trackBounds[i][0] && yPosition < this.trackBounds[i][1] && this.currentDragging.track != i){
						//Write code to ensure track cant change if position will be inside another audio on Y track
						track = i;
					}
				}
				return track;
			},
			moveX(e){
				//console.log("X MOVE");
				let startX = (this.draggingx + e.dx/this.dpr); //tickOffset must be calculated based on diffence between current x value and last x value
				let endX = (startX + this.currentDragging.size)
				let rendX = utils.round(endX, 0.5);
				let rstartX = utils.round(startX, 0.5);

				audioItemLoop:
				for (let i = 0; i < this.renderItems.length; i++){
					let item = this.renderItems[i];
					//console.log("Checking against item", item);
					if (item.isInsideWindow() == true){
						if (item.track == this.currentDragging.track && item.id != this.currentDragging.id){ //If to check if comparison items are on same track 
							if (item.xNormalized >= this.currentDragging.xNormalized){ //If start of current comparison audio is before dragging audio start
								if (endX >= item.xNormalized){ //Check that computed end is greater than comparison audio start 
									if (e.offsetx/this.dpr <= item.x2){
										endX = item.xNormalized;
										startX = endX - this.currentDragging.size;
									} else {
										startX = item.x2Normalized;
										endX = startX + this.currentDragging.size;
									}
								}
							} else if (item.x2Normalized <= this.currentDragging.xNormalized){
								if (startX <= item.x2Normalized){
									if (e.offsetx/this.dpr >= item.x){
										startX = item.x2Normalized;
										endX = startX + this.currentDragging.size;

									} else {
										endX = item.xNormalized;
										startX = endX - this.currentDragging.size;
									}
								}
							}
						} else if (item.id != this.currentDragging.id && this.lastX != 0) { //Run Y aligment - will hold currently dragged audio item at snapped location for x movement ticks
							//Rounding values should change based on time_scale value - when we are far zoomed out 0.5 is too small each scroll steps much larger than 0.5
							//console.log("Running Y snapping computation");
							if (rendX == item.rounded2X){ //end2start
								this.block = true;
								this.blockNumber = 10;
								startX = item.xNormalized - this.currentDragging.size;
								endX = item.xNormalized;
								this.drawSnapMarker = item.xNormalized;
								break audioItemLoop;

							} else if (rendX == item.rounded2X2) { //end2end
								this.block = true;
								this.blockNumber = 10;
								startX = item.x2Normalized - this.currentDragging.size;
								endX = item.x2Normalized;
								this.drawSnapMarker = item.x2Normalized;
								break audioItemLoop;

							} else if (rstartX == item.rounded2X) { //start2/start
								this.block = true;
								this.blockNumber = 10;
								startX = item.xNormalized;
								endX = item.xNormalized + this.currentDragging.size;
								this.drawSnapMarker = item.xNormalized;
								break audioItemLoop;

							} else if (rstartX == item.rounded2X2) { //start2end
								this.block = true;
								this.blockNumber = 10;
								startX = item.x2Normalized;
								endX = item.x2Normalized + this.currentDragging.size;
								this.drawSnapMarker = item.x2Normalized;
								break audioItemLoop;

							} else {
								if (startX >= item.xNormalized && startX <= item.x2Normalized || endX >= item.xNormalized && endX <= item.x2Normalized || item.xNormalized >= startX && item.x2Normalized <= endX){
									if (item.barMarkersX.length > 0){
										//console.log("Running bar marker matching");
										for (let i2=0; i2<item.barMarkersXRounded.length; i2++){ //bar marker matching seems to be very hit and miss - try and figure out why that is happening
											//console.log("Checkng", item.id, "marker ", item.barMarkersXRounded[i], "vs", rendX, rstartX);
											if (item.isInsideWindow(item.barMarkersXRounded[i2]) == true){
												if (rendX == item.barMarkersXRounded[i2]){ //end2start
													this.block = true;
													this.blockNumber = 4;
													startX = item.barMarkersX[i2] - this.currentDragging.size;
													endX = item.barMarkersX[i2];
													this.drawSnapMarker = item.barMarkersX[i2];
													break audioItemLoop;

												} else if (rstartX == item.barMarkersXRounded[i2]) { //start2/start
													this.block = true;
													this.blockNumber = 4;
													startX = item.barMarkersX[i2];
													endX = item.barMarkersX[i2] + this.currentDragging.size;
													this.drawSnapMarker = item.barMarkersX[i2];
													break audioItemLoop;
												}
												// } else {
												// 	for (let bi=0; bi<this.currentDragging.barMarkersXRounded.length; bi++){
												// 		// console.log("Checkng", item.id, "marker ", "vs", this.currentDragging.id, "vs marker", "item x", item.barMarkersX, "cd bar diff", this.currentDragging.barMarkerDiff);
												// 		if (this.currentDragging.barMarkersXRounded[bi] == item.barMarkersXRounded[i2]){
												// 			console.log("Match 1", item.id, "vs", this.currentDragging.id, this.currentDragging.barMarkersXRounded[bi], item.barMarkersXRounded[i2])
												// 			startX = item.barMarkersX[i2] - this.currentDragging.barMarkerDiff[this.currentDragging.barMarkersX[bi]][0];
												// 			endX = item.barMarkersX[i2] + this.currentDragging.barMarkerDiff[this.currentDragging.barMarkersX[bi]][1];
												// 			this.block = true;
												// 			this.blockNumber = 4;
												// 			this.drawSnapMarker = item.barMarkersX[i2];
												// 			break audioItemLoop;

												// 		} else if (this.currentDragging.barMarkersXRounded[bi] == item.rounded2X) {
												// 			console.log("Match 2", item.id, "vs", this.currentDragging.id, this.currentDragging.barMarkersXRounded[bi], item.rounded2X)
												// 			startX = item.xNormalized - this.currentDragging.barMarkerDiff[this.currentDragging.barMarkersX[bi]][0];
												// 			endX = item.xNormalized + this.currentDragging.barMarkerDiff[this.currentDragging.barMarkersX[bi]][1];
												// 			this.block = true;
												// 			this.blockNumber = 4;
												// 			this.drawSnapMarker = item.xNormalized;
												// 			break audioItemLoop;

												// 		} else if (this.currentDragging.barMarkersXRounded[bi] == item.rounded2X2) {
												// 			console.log("Match 3", item.id, "vs", this.currentDragging.id, this.currentDragging.barMarkersXRounded[bi], item.rounded2X2)
												// 			startX = item.x2Normalized - this.currentDragging.barMarkerDiff[this.currentDragging.barMarkersX[bi]][0];
												// 			endX = item.x2Normalized + this.currentDragging.barMarkerDiff[this.currentDragging.barMarkersX[bi]][1];
												// 			this.block = true;
												// 			this.blockNumber = 4;
												// 			this.drawSnapMarker = item.x2Normalized;
												// 			break audioItemLoop;
												// 		}
												// 	}
												// }
											}
										}
									} else {
										//console.log("Checking current dragging bar markers vs items start/end");
										for (let bi=0; bi<this.currentDragging.barMarkersXRounded.length; bi++){
											if (this.currentDragging.isInsideWindow(this.currentDragging.barMarkersXRounded[bi]) == true){
												//console.log("Checkng", item.id, "start ", item.rounded2X, "vs", this.currentDragging.id, "vs marker", this.currentDragging.barMarkersXRounded[bi]);
												if (this.currentDragging.barMarkersXRounded[bi] == item.rounded2X) {
													console.log("Match 4", item.id, "vs", this.currentDragging.id, this.currentDragging.barMarkersXRounded[bi], item.rounded2X)
													startX = item.xNormalized - this.currentDragging.barMarkerDiff[this.currentDragging.barMarkersX[bi]][0];
													endX = item.xNormalized + this.currentDragging.barMarkerDiff[this.currentDragging.barMarkersX[bi]][1];
													this.block = true;
													this.blockNumber = 4;
													this.drawSnapMarker = item.xNormalized;
													break audioItemLoop;

												} else if (this.currentDragging.barMarkersXRounded[bi] == item.rounded2X2) {
													console.log("Match 5", item.id, "vs", this.currentDragging.id, this.currentDragging.barMarkersXRounded[bi], item.rounded2X2)
													startX = item.x2Normalized - this.currentDragging.barMarkerDiff[this.currentDragging.barMarkersX[bi]][0];
													endX = item.x2Normalized + this.currentDragging.barMarkerDiff[this.currentDragging.barMarkersX[bi]][1];
													this.block = true;
													this.blockNumber = 4;
													this.drawSnapMarker = item.x2Normalized;
													break audioItemLoop;
												}
											}
										}
									}
								}
							}
						}
					}
				}
				if (startX < 0){
					endX = endX - startX;
					startX = 0;
				}
				return [startX, endX];
			},
			drawAudioElements(){
				let currentUi = this.$store.getters.getUi;
				let trackLayers = currentUi["tracks"];
				let lineHeight = currentUi["lineHeight"];//TODO line height should be updated as more track layers are added - if track layers extend view
				let offset = currentUi["trackTimelineOffset"];
				let y = null;
				//Draw track lines
				for (let i = 0; i <= trackLayers; i++){
					y = (offset + i*lineHeight)/this.dpr;
					this.ctx.strokeStyle = Settings.theme.b;
					this.ctx.beginPath();
					this.ctx.moveTo(0, y);
					this.ctx.lineTo(this.width, y);
					this.ctx.stroke();
				}
				//console.log(audioData);
				//Iterate over audioData and paint componenets on timeline - along will all effects associated on them
				for (let i = 0; i < this.audioData.length; i++){
					let audioItem = this.audioData[i];
					let x = utils.time_to_x(audioItem.start, this.timeScale, this.frameStart); //Starting x value for audio item
					let x2 = utils.time_to_x(audioItem.end, this.timeScale, this.frameStart); //Ending x value for audio item
					audioItem.effects = utils.computeEffectsX(audioItem.effects, x, this.timeScale, this.frameStart);
					let y1 = (offset + audioItem.track * lineHeight)/this.dpr; //Starting y value for audio item
					let y2 = (lineHeight)/this.dpr; //Ending y value for audio item

					if (this.renderedItems == false){
						console.log("Setting audio item", audioItem, x, x2);
						let AudioRect = new AudioItem();
						AudioRect.set(x, y1, x2, y2, Settings.theme.audioElement, audioItem, this.timeScale, this.frameStart, this.dpr, this.width);
						AudioRect.setWaveForm(audioItem.rawWaveForm, this.frameStart, this.timeScale, offset);
						AudioRect.paint(this.ctx, Settings.theme.audioElement, this.block);
						this.renderItems.push(AudioRect);

					} else {
						let currentItem = this.renderItems[i];
						if (currentItem != undefined){
							currentItem.set(x, y1, x2, y2, Settings.theme.audioElement, audioItem, this.timeScale, this.frameStart, this.dpr, this.width);
							if (audioItem.rawWaveForm != null && currentItem.rawWaveForm == undefined || this.lastTimeScale != this.timeScale || this.resetWaveForm == true){
								currentItem.setWaveForm(audioItem.rawWaveForm, this.frameStart, this.timeScale, offset);
							}
							currentItem.paint(this.ctx, Settings.theme.audioElement, this.block);
						} else {
							//New item has been inserted from copy/cut/import
							console.log("new audio rect");
							console.log(audioItem)
							if (audioItem.rawWaveForm == undefined){
								let waveform = this.fetchWaveForm(audioItem.waveform);
								let componentObj = this;
								waveform.then(function(data) {
									componentObj.audioData[i].rawWaveForm = WaveformData.create(data.data);
								})
							}
							let AudioRect = new AudioItem();
							AudioRect.set(x, y1, x2, y2, Settings.theme.audioElement, audioItem, this.timeScale, this.frameStart, this.dpr, this.width);
							AudioRect.setWaveForm(audioItem.rawWaveForm, this.frameStart, this.timeScale, offset);
							AudioRect.paint(this.ctx, Settings.theme.audioElement, this.block);
							this.renderItems.push(AudioRect);
						}
					}
				}
				this.lastTimeScale = this.timeScale;
				this.renderedItems = true;
				this.resetWaveForm = false;

				if (this.drawSnapMarker != false){
					this.ctx.strokeStyle = "red";
					this.ctx.beginPath();
					this.ctx.moveTo(this.drawSnapMarker - this.frameStart * this.timeScale, 0);
					this.ctx.lineTo(this.drawSnapMarker - this.frameStart * this.timeScale, this.height);
					this.ctx.stroke();
				}
			},
			paint(){
				//Paint other canvas items
				this.scrollCanvas.paint();
				this.exterior.paint();
				// track_canvas.paint();
				let currentUi = this.$store.getters.getUi;
				this.timeScale = currentUi["timeScale"];
				this.timeScaled();
				this.currentTime = currentUi["currentTime"]; // of marker
				this.frameStart = currentUi["scrollTime"]; //Starting time value of timeline view
				let units = this.timeScale / this.tickMark1; //For now timescale is taken from settings - this should be updated later as user zooms into timeline
				let offsetUnits = (this.frameStart * this.timeScale) % units;
				let count = (this.canvas.width + offsetUnits) / this.tickMark1; //Amount of possible main tick markers across window width
				//TODO: Lines and text size should scale relative to size of canvas
				this.ctx.fillStyle = Settings.theme.a;
				this.ctx.fillRect(0, 0, this.width, this.height);
				this.ctx.save();
				this.ctx.scale(this.dpr, this.dpr);

				this.ctx.lineWidth = 1;

				//Iterate over count and draw main tick markers along with second(s) timestamp related to this
				for (let i = 0; i < count; i++) {
					let x = (i * units) - offsetUnits;

					// vertical lines
					this.ctx.strokeStyle = Settings.theme.b;
					this.ctx.beginPath();
					this.ctx.moveTo(x, 5);
					this.ctx.lineTo(x, this.height);
					this.ctx.stroke();

					this.ctx.fillStyle = Settings.theme.d;
					this.ctx.textAlign = 'center';

					//Get time at current tick with accordance to timescale and scroll wheel position
					let t = (i * units - offsetUnits) / this.timeScale + this.frameStart;
					if (t != 0){
						t = utils.format_friendly_seconds(t);
						this.ctx.fillText(t, x, 15);
					}
				}
				units = this.timeScale / this.tickMark2;
				count = (this.width + offsetUnits) / units;
				// marker lines - main
				for (let i = 0; i < count; i++) {
					this.ctx.strokeStyle = Settings.theme.d;;
					this.ctx.beginPath();
					let x = i * units - offsetUnits;
					this.ctx.moveTo(x, 0);
					this.ctx.lineTo(x, 8);
					this.ctx.stroke();
				}

				let mul = this.tickMark3 / this.tickMark2;
				units = this.timeScale / this.tickMark3;
				count = (this.width + offsetUnits) / units;

				// small ticks
				for (let i = 0; i < count; i++) {
					if (i % mul === 0) continue;
					this.ctx.strokeStyle = Settings.theme.c;
					this.ctx.beginPath();
					let x = i * units - offsetUnits;
					this.ctx.moveTo(x, 0);
					this.ctx.lineTo(x, 5);
					this.ctx.stroke();
				}
				this.drawAudioElements(); //Draw audio elements
				this.ctx.restore();

				//Begin drawing marker
				let lineHeight = currentUi["lineHeight"];
				this.ctx.strokeStyle = 'red'; // Theme.c
				let x = ((this.currentTime - (this.frameStart)) * this.timeScale)*this.dpr;
				//Get currentTime to input into marker
				let txt = utils.format_friendly_seconds(this.currentTime);
				let textWidth = this.ctx.measureText(txt).width;

				let half_rect = null;
				let base_line = (this.lineHeight, half_rect = textWidth / this.dpr);

				//Draw main line 
				this.ctx.beginPath();
				this.ctx.moveTo(x, base_line);
				this.ctx.lineTo(x, this.height);
				this.ctx.stroke();

				//Draw main marker body
				this.ctx.fillStyle = 'red'; // black
				this.ctx.textAlign = 'center';
				this.ctx.beginPath();
				this.ctx.moveTo(x, base_line + 5);
				this.ctx.lineTo(x + 5, base_line);
				this.ctx.lineTo(x + half_rect, base_line);
				this.ctx.lineTo(x + half_rect, base_line - 14);
				this.ctx.lineTo(x - half_rect, base_line - 14);
				this.ctx.lineTo(x - half_rect, base_line);
				this.ctx.lineTo(x - 5, base_line);
				this.ctx.closePath();
				this.ctx.fill();

				this.ctx.fillStyle = 'white';
				this.ctx.fillText(txt, x, base_line - 4);

				this.ctx.restore();

				this.needsRepaint = false;
				//There should be check here that the user is still on the canvas page - currently it is running this loop even when the user is not on the canvas page
				requestAnimationFrame(this.paint)
			},
			registerListeners(){
				//mousemove eventListener to handle cursor changing to pointer upon hovering over a draggable item
				let componentObj = this;
				window.addEventListener('resize', this.resize);

				// Contextmenu-eventlistener
				this.canvas.addEventListener("contextmenu", function(e){
					let currentUi = componentObj.$store.getters.getUi;
					let timeScale = currentUi["timeScale"];
					let frameStart = currentUi["scrollTime"];
					let currentX = ((e.clientX - componentObj.bounds.left)/componentObj.dpr + (frameStart * timeScale));
					let currentY = (e.clientY - componentObj.bounds.top)/componentObj.dpr;

					for (let i = 0; i < componentObj.renderItems.length; i++){
						if (componentObj.renderItems[i].contains(currentX, currentY, timeScale, frameStart)) {
							componentObj.currentAudio = componentObj.renderItems[i];
							componentObj.currentAudioIndex = i;
							componentObj.menuItem.display(e, undefined);
						}
					}
				}, false);

				this.canvas.addEventListener("mousemove", function(e){
					if (componentObj.block == false){
						let currentUi = componentObj.$store.getters.getUi;
						let timeScale = currentUi["timeScale"];
						let frameStart = currentUi["scrollTime"];
						let currentX = ((e.clientX - componentObj.bounds.left)/componentObj.dpr + (frameStart * timeScale));
						let currentY = (e.clientY - componentObj.bounds.top)/componentObj.dpr;
						for (let i = 0; i < componentObj.renderItems.length; i++){
							if (componentObj.renderItems[i].contains(currentX, currentY, timeScale, frameStart)) {
								if (componentObj.cuttingAudio == true){
									let barMatch = componentObj.renderItems[i].onBarMarker(currentX, frameStart, timeScale);
									if (barMatch != false){
										console.log("Cursor over bar", barMatch)
										componentObj.drawSnapMarker = barMatch.x0;
										componentObj.block = true;
										componentObj.blockNumber = 4;
									}
								}
								if (componentObj.overwriteCursor == false){
									componentObj.canvas.style.cursor = 'pointer';
								}
								return;
							}
						}
						if (componentObj.overwriteCursor == false){
							componentObj.canvas.style.cursor = 'default';
						}
					} else {
						e.preventDefault(); //This doesnt work it should prevent the mouse from moving
						if (componentObj.holdTick == componentObj.blockNumber){
							componentObj.block = false;
							componentObj.holdTick = 0;
							componentObj.drawSnapMarker = false;

						} else {
							componentObj.holdTick += 1;
						}
					}
				});

				//Handles "wheel" zoom events - trackpad zoom or scroll wheel zoom - also includes scroll left and right
				//Handle scroll left and right - moves timeline left and right - scroll up and down zooms into/out of timeline - then two finger 
				this.canvas.addEventListener("wheel", function(e){
					let xMove = e.deltaX/4;
					let currentUi = componentObj.$store.getters.getUi;
					let frameStart = currentUi["scrollTime"];
					if (frameStart != 0){
						e.preventDefault();
					}
					let out = frameStart + xMove;
					if (out >= 0){
						componentObj.$store.commit("updateUi", {"scrollTime": frameStart + xMove});
					}
				});

				let keydownHandler = function(e){
					let currentUi = componentObj.$store.getters.getUi;
					if (e.keyCode == 37){ //left arrow key
						let timeScale = 60/currentUi["timeScale"];
						let out = currentUi["scrollTime"] -1*timeScale;
						if (out < 0){
							out = 0;
						}
						componentObj.$store.commit("updateUi", {"scrollTime": out});

					} else if (e.keyCode == 39){ //right arrow key
						let timeScale = 60/currentUi["timeScale"]; //Ensure that this changing of timeScale offset for moving on timeline is working correctl
						componentObj.$store.commit("updateUi", {"scrollTime": currentUi["scrollTime"] +1*timeScale});

					} else if (e.keyCode == 38){ //up arrow key
						let timeScale = currentUi["timeScale"];
						let out;
						if (timeScale < 5){
							out = timeScale +1;
						} else {
							out = timeScale +5;
						}
						componentObj.$store.commit("updateUi", {"timeScale": out});

					} else if (e.keyCode == 40){ //down arrow key
						let timeScale = currentUi["timeScale"];
						let out;
						if (timeScale <= 5){
							out = timeScale -1;
						} else {
							out = timeScale -5;
						}
						if (out < 1){
							out = 1;
						}
						componentObj.$store.commit("updateUi", {"timeScale": out});

					} else if (e.keyCode == 32){ //Space bar
						if (componentObj.exterior.playing == false){
							componentObj.exterior.playAudio();
						} else {
							componentObj.exterior.pauseAudio();
						}
					}
				}

				//this seems to be adding listner multiple times - makes sure that all listeners are only added once
				document.addEventListener("keydown", keydownHandler);

				//Handles dragging of movable items
				utils.handleDrag(this.canvas,
					function down(e){
						let currentUi = componentObj.$store.getters.getUi;
						let timeScale = currentUi["timeScale"];
						let frameStart = currentUi["scrollTime"];
						let currentX = ((e.offsetx)/componentObj.dpr + (frameStart * timeScale));
						let currentY = (e.offsety)/componentObj.dpr;

						for (let i = 0; i < componentObj.renderItems.length; i++){
							let item = componentObj.renderItems[i];
							if (item.contains(currentX, currentY, timeScale, frameStart)) {
								let effect = item.containsEffect(currentX, currentY);
								//console.log("Contains effect val", effect);
								if (effect == false){
									componentObj.draggingx = item.x + frameStart * timeScale;
									componentObj.currentDragging = item;
									if (componentObj.overwriteCursor == false){
										componentObj.canvas.style.cursor = 'grabbing';
									}
									return;

								} else {
									//Open effect modal
									componentObj.effectHandler.renderEffectModal(effect.type, item, effect);
									return;
								}
							}
						}
						componentObj.$store.commit("updateUi", {"currentTime": utils.x_to_time((e.offsetx)/componentObj.dpr, timeScale, frameStart)});
					},
					function move(e){
						let currentUi = componentObj.$store.getters.getUi;
						let timeScale = currentUi["timeScale"];
						let frameStart = currentUi["scrollTime"];

						if (componentObj.draggingx != null) {
							if (componentObj.block == false){
								componentObj.canvas.style.cursor = 'grabbing';
								let track = componentObj.moveY(e.offsety/componentObj.dpr);
								componentObj.currentDragging.track = track;
								let startX, endX;
								[startX, endX] = componentObj.moveX(e);

								//Update x/x2 value of current dragging item so we can use for future compuations
								componentObj.currentDragging.x = startX;
								componentObj.currentDragging.x2 = endX;
								componentObj.currentDragging.xNormalized = startX;
								componentObj.currentDragging.x2Normalized = endX;
								componentObj.currentDragging.updateBars(1);
								componentObj.lastX = startX;
								let start = (startX / timeScale);
								let end = (endX / timeScale);
								componentObj.$store.commit("updateAudio", {"id": componentObj.currentDragging.id, "start": start, "end": end, "track": track})

							} else {
								if (componentObj.holdTick == componentObj.blockNumber){
									componentObj.block = false;
									componentObj.holdTick = 0;
									componentObj.drawSnapMarker = false;

								} else {
									componentObj.holdTick += 1;
								}
							}

						} else {
							componentObj.$store.commit("updateUi", {"currentTime": utils.x_to_time((e.offsetx)/componentObj.dpr, timeScale, frameStart)});
						}
					},
					function up(e){
						//Reset drag related variables
						componentObj.draggingx = null;
						componentObj.currentDragging = null;
						if (componentObj.overwriteCursor == false){
							componentObj.canvas.style.cursor = 'pointer';
						}
						componentObj.holdTick = 0;
						componentObj.block = false;
						componentObj.drawSnapMarker = false;
						componentObj.blockNumber = 0;
					});

				this.menuItems[2]["sub"][0]["events"] = { //Set eq click event
															"click": function(e){
																componentObj.effectHandler.renderEffectModal("eq", componentObj.currentAudio, null);
															}
														}

				this.menuItems[2]["sub"][1]["events"] = { //Set volume click event
												"click": function(e){
													componentObj.effectHandler.renderEffectModal("volume", componentObj.currentAudio, null);
												}
											}

				this.menuItems[2]["sub"][2]["events"] = { //Set high pass click event
												"click": function(e){
													componentObj.effectHandler.renderEffectModal("highPass", componentObj.currentAudio, null);
												}
											}

				this.menuItems[2]["sub"][3]["events"] = { //Set low pass click event
												"click": function(e){
													componentObj.effectHandler.renderEffectModal("lowPass", componentObj.currentAudio, null);
												}
											}

				this.menuItems[2]["sub"][4]["events"] = { //Set pitch click event
												"click": function(e){
													componentObj.effectHandler.renderEffectModal("pitch", componentObj.currentAudio, null);
												}
											}

				this.menuItems[2]["sub"][5]["events"] = { //Set tempo click event
												"click": function(e){
													componentObj.effectHandler.renderEffectModal("tempo", componentObj.currentAudio, null);
												}
											}

				this.menuItems[6]["events"] = { //Set delete click event
												"click": function(e){
													componentObj.effectHandler.removeAudio(componentObj.currentAudio.id);
													componentObj.removeRenderItem(componentObj.currentAudioIndex);
												}
											}

				this.menuItems[0]["events"] = { //Set copy click event
												"click": function(e){
													componentObj.effectHandler.copyAudio(componentObj.currentAudio.id);
												}
											}
			},
			refreshAudio(refreshId){
				//Currently this refresh the entire set of audio - in the future this should instead refresh the audio at a given audioId
				//Will be used to update audioData after effect computation has taken place
				this.mixData = this.$store.getters["getMixData"];
				this.renderItems = [];
				this.audioData = this.mixData.audio; 
				this.renderedItems = false;
			},
			fetchWaveFormObj(audioObj){
				let componentObj = this;
				let waveform = this.fetchWaveForm(audioObj.waveform);
				return waveform.then(function(data){
					let wfd = WaveformData.create(data.data);
					return wfd;
				})
			},
			fetchWaveForms(){
				let componentObj = this;
				for (let i=0; i<this.audioData.length; i++){
					if (this.audioData[i].waveform != null){
						let waveform = this.fetchWaveForm(this.audioData[i].waveform);
						waveform.then(function(data) {
							componentObj.audioData[i].rawWaveForm = WaveformData.create(data.data);
						})
					}
				}
			},
			async fetchWaveForm(waveformKey){
				try {
					let res = await axios.get(this.appData.s3Url+waveformKey, {"responseType": 'arraybuffer'});
					return res;
				} catch (error) {
					console.error(error);
				}
			}
		},
		mounted() {
			this.$ready(() => {
				let parentDiv = document.getElementById("timeline");
				this.canvas = document.querySelector("#timeline-canvas");
				this.ctx = this.canvas.getContext('2d');
				this.dpr = window.devicePixelRatio; 
				this.mixData = this.$store.getters["getMixData"];
				this.audioData = this.mixData.audio; 
				this.appData = this.$store.getters["getAppData"];
				console.log("Loaded mix data", this.mixData);
				//this.trackLayers = Math.max.apply(Math, this.audioData.map(function(o) { return o.track; }))+1; for now this shouldnt be used - only to be used when there is a + icon on the timeline to add more tracks - that way it doesnt matter if the timeline renders with no tracks
				this.trackLayers = 4;
				let lineWidth, lineHeight = utils.getDivSize("timeline");
				this.lineHeight = lineHeight * Settings.lineHeightProportion;
				this.offset = Settings.trackTimelineOffset;
				this.height = parentDiv.offsetHeight;
				this.width = parentDiv.offsetWidth;
				this.canvas.width = this.width;
				this.canvas.height = this.height;
				this.timeScale = Settings.time_scale;
				this.lastTimeScale = this.timeScale;
				this.bounds = this.canvas.getBoundingClientRect();
				this.$store.commit("updateUi", {"tracks": this.trackLayers, "lineHeight": this.lineHeight, "timeScale": this.timeScale, "trackTimelineOffset": this.offset, "currentTime": 0, "totalTime": Settings.default_length});

				this.scrollCanvas = this.$children[0];
				this.exterior = this.$children[1];
				this.effectHandler = this.$children[2];

				//Create array of objects which defines the pixel bounds for each track element
				for (let i=0; i<this.trackLayers; i++){
					this.trackBounds[i] = [(this.offset + i*this.lineHeight)/this.dpr, (this.offset + (i+1)*this.lineHeight)/this.dpr];
				}
				this.$store.commit("updateUi", {"trackBounds": this.trackBounds});
				this.fetchWaveForms();
				this.exterior.init();
				this.registerListeners();
				this.menuItem = new ContextMenu(this.menuItems);
				this.paint();
			})
		}
	}
</script>