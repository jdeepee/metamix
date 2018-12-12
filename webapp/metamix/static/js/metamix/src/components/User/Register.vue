<template>
	<div>
		<p>Register</p>

		<h6>Email</h6>
		<input v-model="email">
		<h6>Password</h6>
		<input v-model="password">
		<h6>First Name</h6>
		<input v-model="firstName">
		<h6>Last Name</h6>
		<input v-model="lastName">
		<br>
		<button @click="register">Register</button>
	</div>
</template>

<script type="text/javascript">
	export default {
		name: "Register",
		data() {
			return {
				email: null,
				password: null,
				firstName: null,
				lastName: null
			}
		},
		methods: {
			register(){
				console.log(this.email, this.password, this.firstName, this.lastName);
			}
		},
		mounted() {
		}
	}
</script>