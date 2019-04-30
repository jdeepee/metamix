<template>
	<div>
		<p>Register</p>

		<h6>Email</h6>
		<input v-model="input.email">
		<h6>Password</h6>
		<input v-model="input.password" type="password">
		<h6>First Name</h6>
		<input v-model="input.first_name">
		<h6>Last Name</h6>
		<input v-model="input.last_name">
		<br>
		<button @click="register">Register</button>
	</div>
</template>

<script type="text/javascript">
	import axios from "axios";

	export default {
		name: "Register",
		data() {
			return {
				input: {
					email: null,
					password: null,
					first_name: null,
					last_name: null
				}
			}
		},
		methods: {
			register(){
				axios({ method: "POST", "url": this.baseUrl+"/signup", "data": this.input, "headers": { "content-type": "application/json" } })
				.then(result => {
					console.log("Register success", result.data);
					this.currentUserData["jwtToken"] = result.data["token"];
					localStorage.setItem('token', result.data["token"]);
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
			this.currentUserData = currentUserData;
			this.baseUrl = currentAppData["baseUrl"]
		}
	}
</script>