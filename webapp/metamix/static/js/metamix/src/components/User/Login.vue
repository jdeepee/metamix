<template>
	<div>
		<p>Login</p>

		<h6>Email</h6>
		<input v-model="input.email">
		<h6>Password</h6>
		<input v-model="input.password" type="password">
		<br>
		<button @click="login">Login</button>
	</div>
</template>

<script type="text/javascript">
	import axios from "axios";

	export default {
		name: "Login",
		data() {
			return {
				input: {
					email: null,
					password: null
				}
			}
		},
		methods: {
			login(type){
				axios({ method: "POST", "url": this.baseUrl+"/login", "data": this.input, "headers": { "content-type": "application/json" } })
				.then(result => {
					console.log("Login success", result.data)
                    this.currentUserData["jwtToken"] = result.data["token"]
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
			this.baseUrl = currentAppData["baseUrl"];
		}
	}
</script>