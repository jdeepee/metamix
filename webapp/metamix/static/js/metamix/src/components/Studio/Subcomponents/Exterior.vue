<template>
	<div>
		<div id="left-column">
			<canvas id="left-column-canvas"></canvas>
		</div>
		<div id="zoom-column">
			<input id="range-slider" v-model="rangeValue" type="range" min="1" max="150" step="0.5" v-on:mousemove="rangeUpdate" v-on:mousedown="rangeDown" v-on:mouseup="rangeUp">
<!-- 			<input id="timeline-size-input" v-on:input="updateTimelineSize"> -->
		</div>
	</div>
</template>

<script type="text/javascript">
	import {Settings} from "../../../settings.js"
	import utils from "../src/utils.js"

	export default {
		name: "Exterior",
		data(){
			return {
				dragging: 0,
				rangeValue: undefined
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
			// updateTimelineSize(value){
			// 	console.log("update")
			// 	this.$store.commit("updateUi", {"totalTime": value});
			// },
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
		}	
	}
</script>