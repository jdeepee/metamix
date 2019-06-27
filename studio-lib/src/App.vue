<template>
  <div id="app">
  	<notifications group="main" position="top right"></notifications>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
    }
  }
}
</script>
