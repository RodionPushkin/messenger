<template>
  <div class="container">
    <p @click="copy">{{ this.$store.getters.PEERID }}</p>
    <input type="text" v-model="text">
    <div class="button" @click="call">позвонить</div>
  </div>
</template>

<script>

export default {
  name: "home",
  data() {
    return {
      text: ''
    }
  },
  mounted() {
  },
  methods: {
    call() {
      this.$store.dispatch('SET_CONNECT_TO', this.text)
    },
    copy() {
      navigator.clipboard.writeText(this.$store.getters.PEERID)
    }
  }
}
</script>

<style lang="scss" scoped></style>
