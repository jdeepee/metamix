<template>
	<div>
		<p>Login</p>

		<h6>Email</h6>
		<input v-model="email">
		<h6>Password</h6>
		<input v-model="password">
		<br>
		<button @click="login">Login</button>
	</div>
</template>

<script type="text/javascript">
	export default {
		name: "Login",
		data() {
			return {
				email: null,
				password: null
			}
		},
		methods: {
			login(type){
				console.log(this.email, this.password)
			}
		},
		mounted() {
		}
	}
</script>