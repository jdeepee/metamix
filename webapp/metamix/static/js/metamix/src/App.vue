<template>
  <div id="app">
  	<notifications group="main" position="top center"></notifications>
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
