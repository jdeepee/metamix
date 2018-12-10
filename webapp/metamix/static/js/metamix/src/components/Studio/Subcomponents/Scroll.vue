<template>
	<div id="top-timeline">
		<canvas id="top-timeline-canvas"></canvas>
	</div>
</template>

<script type="text/javascript">
	import {Settings} from "../../../settings.js"
	import utils from "..//src/utils.js"

	function Rect() {
		
	}

	Rect.prototype.set = function(x, y, w, h, color, outline) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	};

	Rect.prototype.paint = function(ctx) {
		ctx.fillStyle = Settings.theme.b;  // // 'yellow';
		ctx.strokeStyle = Settings.theme.c;

		ctx.beginPath();
		ctx.rect(this.x, this.y, this.w, this.h);

		ctx.stroke();
		ctx.fill();
	};

	Rect.prototype.contains = function(x, y) {
		return x >= this.x && y >= this.y
		 && x <= this.x + this.w && y <= this.y + this.h;
	};

	export default {
		name: "Scroll",
		data(){
			return {
				draggingx: null
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
			repaint(){
				this.paint();
			},
			resize() {
				this.dpr = window.devicePixelRatio;
				this.canvas.width = this.parentDiv.offsetWidth;
				this.canvas.height = this.parentDiv.offsetHeight;
				this.height = this.canvas.height;
				this.width = this.canvas.width;
			},
			paint(){
				let currentUi = this.$store.getters.getUi;
				let totalTime = currentUi["totalTime"];
				let scrollTime = currentUi["scrollTime"];
				let currentTime = currentUi["currentTime"];
				let pixelsPerSecond = currentUi["timeScale"];
				let h = 16; // TOP_SCROLL_TRACK;

				this.ctx.save();

				this.ctx.fillStyle = Settings.theme.a;
				this.ctx.fillRect(0, 0, this.width, this.height);
				this.ctx.translate(this.MARGINS, 5);

				// outline scroller
				this.ctx.beginPath();
				this.ctx.strokeStyle = Settings.theme.b;
				this.ctx.rect(0, this.height/4, this.width, this.height/3);
				this.ctx.stroke();

				let totalTimePixels = totalTime * pixelsPerSecond;
				let k = this.width / totalTimePixels;
				this.scroller.k = k;

				let gripLength = (this.width * k)/this.dpr;

				this.scroller.gripLength = gripLength;

				this.scroller.left = scrollTime / totalTime * this.width;

				this.scrollRect.set(this.scroller.left, this.height/4, this.scroller.gripLength, this.height/3);
				this.scrollRect.paint(this.ctx);

				let r = currentTime / totalTime * this.width;		

				this.ctx.fillStyle = Settings.theme.c;
				this.ctx.lineWidth = 2;

				this.ctx.beginPath();

				// circle
				// ctx.arc(r, h2 / 2, h2 / 1.5, 0, Math.PI * 2);

				// line
				this.ctx.rect(r, this.height/4, 2, this.height/3);
				this.ctx.fill()

				this.ctx.restore();
			},
			registerListners(){
				let componentObj = this;

				utils.handleDrag(this.canvas,
					function down(e) {
						console.log("Mouse down")
						if (componentObj.scrollRect.contains(e.offsetx, e.offsety)) {
							componentObj.draggingx = componentObj.scroller.left;
							return;
						}
						
						let currentUi = componentObj.$store.getters.getUi;
						let totalTime = currentUi["totalTime"];

						let t = (e.offsetx) / componentObj.width * totalTime;

						componentObj.$store.commit("updateUi", {"currentTime": t});
							
					},
					function move (e) {
						let currentUi = componentObj.$store.getters.getUi;
						let totalTime = currentUi["totalTime"];
						if (componentObj.draggingx != null) {
							if ((e.offsetx) < componentObj.width){ //Check currently does not work - this should check if scroller.start + scroller.length < total width of slider
								let t = (componentObj.draggingx + e.dx)  / componentObj.width * totalTime
								if (t >= 0){
									componentObj.$store.commit("updateUi", {"scrollTime": (componentObj.draggingx + e.dx)  / componentObj.width * totalTime});
								}
							}

						} else {
							if (componentObj.scrollRect.contains(e.offsetx, e.offsety)) {
								componentObj.draggingx = componentObj.scroller.left;
								return;
							}

							let t = (e.offsetx) / componentObj.width * totalTime;
							if (t >= 0){
								componentObj.$store.commit("updateUi", {"currentTime": t});
							}
						}
					},
					function up(e){
						componentObj.draggingx = null;
					}
					// function hit(e) {
					// 	if (child.onHit) { child.onHit(e) };
					// }
				);
			}

		},
		mounted() {
			this.$ready(() => {
				this.parentDiv = document.getElementById("top-timeline");
				this.canvas = document.getElementById("top-timeline-canvas");
				this.height = this.parentDiv.offsetHeight;
				this.width = this.parentDiv.offsetWidth;
				this.canvas.height = this.height;
				this.canvas.width = this.width;
				this.ctx = this.canvas.getContext('2d');
				this.dpr = window.devicePixelRatio; 
				this.SCROLL_HEIGHT;
				let uiData = this.$store.getters.getUi;
				this.layers = uiData["tracks"];

				this.TOP_SCROLL_TRACK = 20;
				this.MARGINS = 0;

				this.scroller = {
					left: 0,
					grip_length: 0,
					k: 1
				};

				this.scrollRect = new Rect();
				this.registerListners();
			})
		}
	}

</script>