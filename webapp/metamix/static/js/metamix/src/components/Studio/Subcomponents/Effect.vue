<template>
	<div>
		<div id="top-toolbar" class="flex-container">
			<div id="cut" class="flex-item">
				<i class="material-icons" style="font-size: 5rem">content_cut</i>
				<p>Cut</p>
			</div>
			<div id="eq" class="flex-item">
				<i class="material-icons" style="font-size: 5rem">tune</i>
				<p>EQ</p>
			</div>
			<div id="volume" class="flex-item">
				<i class="material-icons" style="font-size: 5rem">volume_up</i>
				<p>Volume Modulation</p>
			</div>
			<div id="highPass" class="flex-item">
				<i class="material-icons" style="font-size: 5rem">blur_linear</i>
				<p>High Pass Filter</p>
			</div>
			<div id="lowPass" class="flex-item">
				<i class="material-icons" id="low-pass">blur_linear</i>
				<p>Low Pass Filter</p>
			</div>
			<div id="pitch" class="flex-item">
				<i class="material-icons" style="font-size: 5rem">trending_up</i>
				<p>Pitch Shift</p>
			</div>
			<div id="tempo" class="flex-item">
				<i class="material-icons" style="font-size: 5rem">fast_rewind</i><i class="material-icons" style="font-size: 5rem">fast_forward</i>
				<p>Tempo Modulation</p>
			</div>
			<div id="remove" class="flex-item">
				<i class="material-icons" style="font-size: 5rem" id="removeI">cancel</i>
				<p>Remove Audio</p>
			</div>
		</div>
	</div>
</template>

<script type="text/javascript">
	import {Settings} from "../../../settings.js"
	import utils from "../src/utils.js"

	export default {
		name: "Effect"
	}
</script>