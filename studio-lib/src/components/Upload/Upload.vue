<template>
	<div>
		<p>This is the upload page</p>

		<h6>Song Upload</h6>
		<input type="file" name="file" multiple="" v-on:change="fileChange($event.target.files, 'song')"/>
		<h6>Clip Upload</h6>
		<input type="file" name="file" multiple="" v-on:change="fileChange($event.target.files, 'clip')"/>
		<br>
		<button type="button" @click="upload()">Upload</button>
	</div>
</template>

<script type="text/javascript">
	import axios from "axios";

	export default {
		name: "Register",
		data() {
			return {
				type: null,
				files: new FormData()
			}
		},
		methods: {
			fileChange(files, type){
				for (let i=0; i<files.length; i++){
					this.files.append("files", files[i]);
				}
				this.type = type;
			},
			upload(){
				axios({ method: "POST", "url": this.baseUrl+"/meta/song/upload", "data": this.files, "headers": { "content-type": "multipart/form-data", "JWT-Auth":  this.jwt}, "params": {"type": "song"} })
				.then(result => {
					console.log(result.data)
					this.$router.push("/");	
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
		}
	}
</script>