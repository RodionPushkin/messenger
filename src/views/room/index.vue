<template>
  <div class="container">
  </div>
</template>

<script>

export default {
  name: "room",
  data() {
    return {
      stream: null
    }
  },
  async mounted() {
    this.$store.dispatch('SET_SHOW_COMMUNICATION',true)
    this.$store.dispatch('SET_IS_CALLING',false)
    setTimeout(()=>{
      if(this.$store.getters.SHOWCOMMUNICATION == false){
        this.$router.push('/')
      }
    },210000)
  }
}
</script>

<style scoped>
</style>
