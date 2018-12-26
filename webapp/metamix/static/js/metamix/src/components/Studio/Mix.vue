<template>
	<div>
		<h3>Mix Selection page</h3>
		<h5 @click="updateMixUi(null)">New Mix</h5>
		<template v-if="newMix === true">		
			<h6>Name</h6>
			<input v-model="name"><br>
			<h6>Description</h6>
			<input v-model="description"><br>
			<h6>Genre</h6>
			<input v-model="genre"><br> 
			<h6>Submit</h6>
			<input type="button" @click="createMix">
		</template>
		<br>
		<template v-for="mix in mixData">
			<h5 @click="loadMix(mix)">Load Mix: {{mix.name}}</h5>
		</template>
	</div>
</template>

<script type="text/javascript">
	import axios from "axios";
	import utils from "./src/utils";

	export default {
		name: "Mix",
		data() {
			return {
				newMix: false,
				mixData: [],
				name: undefined,
				description: undefined,
				genre: undefined
			}
		},
		methods: {
			updateMixUi(){
				this.newMix = true;
			},
			createMix(){
				//New mix - not loading old one
				if (this.name == undefined || this.description == undefined || this.genre == undefined){
					//raise error ensuring that all fields are filled out
				}
				let mix = {"name": this.name, "description": this.description, "genre": this.genre, "audio": []};
				axios({ method: "POST", "url": this.baseUrl+"/meta/mix", "data": {"mix_description": mix}, "headers": { "content-type": "application/json", "JWT-Auth":  this.jwt}})
				.then(result => {
					console.log("Creating Mix", result.data);
					mix["id"] = result.data.data.id;
					console.log("Mix data being set as", mix)
					this.$store.commit("addMixData", mix);
					this.$router.push("/meta/mix/studio");	
					this.$notify({
						type: "success",
						group: "main",
						title: 'Mix '+mix.name+' Created',
						duration: 1000
					});

                }).catch(error => {
                	//Display error on front end
   					console.log(error.response);
				});
			},
			getMixes(){
				axios({ method: "GET", "url": this.baseUrl+"/meta/mix", "headers": { "content-type": "application/json", "JWT-Auth":  this.jwt}})
				.then(result => {
					this.mixData = result.data.data;
                }).catch(error => {
                	//Display error on front end
   					console.log(error.response);
				});
			},
			loadMix(mix){
				console.log("Received mix", mix)
				if (typeof mix.json_description != "object"){
					mix.json_description = JSON.parse(mix.json_description)
				}
				mix.json_description.s3_key = mix.s3_key
				mix.json_description.processing_status = mix.processing_status
				this.$store.commit("addMixData", mix.json_description);
				this.$router.push("/meta/mix/studio");	
				this.$notify({
					type: "success",
					group: "main",
					title: 'Mix Loaded',
					duration: 1000
				});
			}
		},
		mounted() {
			let currentAppData = this.$store.getters.getAppData;
			let currentUserData = this.$store.getters.getUserData;
			this.currentUserData = currentUserData;
			this.jwt = currentUserData["jwtToken"];
			this.baseUrl = currentAppData["baseUrl"];
			this.getMixes();
		}
	}
</script>