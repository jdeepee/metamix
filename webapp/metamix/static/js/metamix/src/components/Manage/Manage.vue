<template>
	<div>
		<p>This is the Management page</p>
	</div>
</template>

<script type="text/javascript">
	import axios from "axios";

	export default {
		name: "Manage",
		data() {
			return {
			}
		},
		methods: {
			getSongs(){
				axios({ method: "GET", "url": this.baseUrl+"/meta/song", "headers": { "content-type": "application/json", "JWT-Auth":  this.jwt}})
				.then(result => {
					console.log(result.data)
                }).catch(error => {
                	//Display error on front end
   					console.log(error.response)
				});
			}
		},
		mounted() {
			let currentAppData = this.$store.getters.getAppData;
			let currentUserData = this.$store.getters.getUserData;
			this.baseUrl = currentAppData["baseUrl"];
			this.jwt = currentUserData["jwtToken"];
			this.getSongs();
		}
	}
</script>