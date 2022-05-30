<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <!-- <ColorfulComp msg="Welcome to Your Vue.js App"/> -->
    <!-- <ColorfulPage msg="Welcome to Your Vue.js App"/>
    <WhitelistPage /> -->
    <!-- <DemoComp /> -->
    <router-view/>
  </div>
</template>

<!-- <script>
// import ColorfulComp from './components/ColorfulComp.vue'
import ColorfulPage from './pages/ColorfulPage.vue'
import WhitelistPage from './pages/WhitelistPage.vue'

// import DemoComp from './components/DemoComp.vue'

export default {
  name: 'App',
  components: {
    // ColorfulComp,
    ColorfulPage,
    WhitelistPage
    // DemoComp
  }
}
</script> -->

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
