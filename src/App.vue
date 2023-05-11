<template>
  <callComponent v-if="this.$store.getters.ISCALLING" @accept="accept" @decline="decline" />
  <communicationComponent @completeCall="completeCall" />
  <headerComponent></headerComponent>
  <mainComponent>
    <router-view></router-view>
  </mainComponent>
  <footerComponent></footerComponent>
</template>

<script>
import headerComponent from "@/components/header.component.vue";
import mainComponent from "@/components/main.component.vue";
import footerComponent from "@/components/footer.component.vue";
import callComponent from "@/components/call.component.vue";
import communicationComponent from "@/components/communication.component.vue";

export default {
  components: { communicationComponent, callComponent, headerComponent, mainComponent, footerComponent },
  data() {
    return {
      callInfo: null,
    }
  },
  mounted() {
    this.$peer.on('open', (id) => {
      this.$store.dispatch('SET_PEER_ID', id)
      console.log('waiting for calls')
      this.$peer.on('call', (call) => {
        if (!this.callInfo) {
          this.$store.dispatch('SET_IS_CALLING', true)
          this.callInfo = call
        }
        call.on('stream', (stream) => {

        })
      })
    })
    this.$peer.on('disconnected', () => {
      this.$peer.reconnect()
    })
    this.$peer.on('error', (err) => {
      console.log("peer error", err)
      this.$peer.reconnect()
    })
  },
  methods: {
    decline() {
      if (this.callInfo) {
        this.$store.dispatch('SET_IS_CALLING', false)
        this.callInfo.close()
        this.callInfo = null
      }
    },
    accept() {
      if (this.callInfo) {
        console.log(this.callInfo)
        this.$store.dispatch('SET_IS_CALLING', false)
        this.callInfo.answer()
        let connections = Array.from(this.$store.getters.CONNECTIONS)
        connections.push(this.callInfo)
        console.log(1, connections)
        this.$store.dispatch('SET_CONNECTIONS', connections)
        this.$store.dispatch('SET_SHOW_COMMUNICATION', true)
        this.$router.push(`/room/${this.callInfo.peer}`)
        console.log(this.$store.getters.PEER.connections)
      }
    },
    completeCall() {
      this.$store.dispatch('SET_SHOW_COMMUNICATION', false)
      this.$store.dispatch('SET_IS_CALLING', false)
      this.$store.dispatch('SET_CONNECTIONS', [])
      this.$router.push('/')
    }
  }
}
</script>
<style lang="scss">
* {
  padding: 0;
  margin: 0;
  border: 0;
  scroll-behavior: smooth;
}

*,
*:before,
*:after {
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  -moz-osx-font-smoothing: antialiased;
  -webkit-font-smoothing: grayscale;
}

:focus,
:active {
  outline: none;
}

a:focus,
a:active {
  outline: none;
}

nav,
footer,
header,
aside {
  display: block;
}

html,
body {
  height: 100%;
  width: 100%;
  line-height: 1;
  font-size: 14px;
  -ms-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}

input,
button,
textarea {
  font-family: inherit;
}

input::-ms-clear {
  display: none;
}

button,
.button {
  cursor: pointer;
}

button::-moz-focus-inner {
  padding: 0;
  border: 0;
}

a,
a:visited {
  text-decoration: none;
}

a:hover {
  text-decoration: none;
}

ul li {
  list-style: none;
}

img {
  vertical-align: top;
}

h1,
h2,
h3,
h4,
h5,
h6,
a,
p,
span {
  font-size: inherit;
  font-weight: inherit;
  color: inherit
}

body {
  min-height: 100vh;
  width: 100vw;
  font-family: 'Steppe';
  font-weight: 400;
  font-size: 16px;
  color: var(--font-color);
  overflow-y: overlay;
  overflow-x: hidden;
  background: #f4f4f8;
}

html {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

#app {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#app .header {
  flex: 0 0 auto;
}

#app .main {
  flex: 1 0 auto;
}

#app .footer {
  flex: 0 0 auto;
}

@media (min-width: 768px) {
  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    border-radius: 100px;
  }

  ::-webkit-scrollbar-thumb {
    background: #8a8a8a;
    background-clip: content-box;
    border: 3px solid rgba(0, 0, 0, 0.0);
    border-radius: 100px;
  }

  ::-webkit-scrollbar-track-piece {
    background: rgba(0, 0, 0, 0.0);
  }

  ::-webkit-scrollbar-button {
    background: rgba(0, 0, 0, 0.0);
  }

  ::-webkit-scrollbar-corner {
    background: rgba(0, 0, 0, 0.0);
  }
}

:root {
  --font-color: #3E3E3E;
  --bg-color: #FFFFFF;
  --accent-color: #e6e9f6;
  --main-color: #E30611;
  --black-color: #1D2023;
  --border-radius: 4px;
}

input,
select {
  min-width: 272px;
  min-height: 56px;
  font-size: 16px;
  padding: 0 16px;
  display: block;
  border-radius: var(--border-radius);
  background: var(--bg-color);
  color: var(--font-color);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

button,
.button {
  min-width: 272px;
  min-height: 56px;
  font-size: 16px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: var(--border-radius);
  background: var(--main-color);
  color: var(--bg-color);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  font-weight: 600;
  transition: background 0.35s, color 0.2s;

  @media screen and (min-width: 768px) {
    &:hover {
      background: var(--bg-color);
      color: var(--font-color);
    }
  }
}

.container {
  width: 100%;
  max-width: 1344px;
  padding: 0 72px;
  margin: 0 auto;

  @media screen and (max-width: 768px) {
    padding: 0 24px;
  }
}

.main {
  overflow: hidden;
  position: relative;
}

.shadow {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.s {
  font-weight: 400;
  font-size: 20px;
  line-height: 24px;
}

.m {
  font-weight: 500;
  font-size: 50px;
  line-height: 60px;

  @media screen and (max-width: 768px) {
    font-size: 24px;
    line-height: 28px;
  }
}

.l {
  font-weight: 600;
  font-size: 72px;
  line-height: 86px;
  color: var(--black-color);

  @media screen and (max-width: 768px) {
    font-size: 40px;
    line-height: 50px;
  }
}
</style>
