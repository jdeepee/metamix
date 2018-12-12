<template>
	<div>
		<h4>MetaMix Home Page</h4>
	    <router-link to="/studio">
            <p>Studio</p>
        </router-link>
      	<router-link to="/register" v-if="hasLoggedIn === false">
            <p>Register</p>
        </router-link>
       	<router-link to="/login" v-if="hasLoggedIn === false">
            <p>Login</p>
        </router-link>
        <router-link to="/upload" v-if="hasLoggedIn === true">
            <p>Upload Song(s)</p>
        </router-link>
        <router-link to="/manage" v-if="hasLoggedIn === true">
            <p>View Song(s)</p>
        </router-link>
	</div>
</template>

<script type="text/javascript">
	export default {
		name: "Home",
		data() {
			return {
				"hasLoggedIn": false
			}
		},
		mounted() {
			let userData = this.$store.getters.getUserData;

			if (userData.jwtToken == null){
				this.hasLoggedIn = false;
			} else {
				this.hasLoggedIn = true;
			}
		}
	}
</script>