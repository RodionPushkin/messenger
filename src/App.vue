<template>
<!--  <callComponent v-if="this.$store.getters.ISCALLING" @accept="accept" @decline="decline" />-->
<!--  <communicationComponent  @completeCall="completeCall" />-->
<!--  <headerComponent></headerComponent>-->
  <header class="header">
    <p v-if="this.$store.getters.USER && !this.$store.getters.USER.is_activated">Ваш аккаунт не активирован! Не пришло письмо на почту? <a @click="sendEmail">отправить еще раз</a></p>
  </header>
  <mainComponent>
    <router-view></router-view>
  </mainComponent>
<!--  <footerComponent></footerComponent>-->
</template>

<script>
import headerComponent from "@/components/header.component.vue";
import mainComponent from "@/components/main.component.vue";
import footerComponent from "@/components/footer.component.vue";
import callComponent from "@/components/call.component.vue";
import communicationComponent from "@/components/communication.component.vue";
import store from "@/store";

export default {
  components: { communicationComponent, callComponent, headerComponent, mainComponent, footerComponent },
  data() {
    return {
      // callInfo: null,
      connectionTimer: undefined
    }
  },
  mounted() {
    try {
      setTimeout(()=>{
        if(this.$route.query.eal){
          this.$api.get(`user/activate/${this.$route.query.eal}`).then(()=>{
            this.$api.user_self().then(res => {
              if (res.message) {
                console.log(res)
              } else {
                store.dispatch('SET_USER',res.user)
                store.dispatch('SET_CHAT',res.chat)
                store.dispatch('SET_FOLDER',res.folder)
                store.dispatch('SET_AVATAR',res.avatar)
                this.$peer._options.token = localStorage.getItem('token')
                this.$peer.disconnect()
                this.$peer.reconnect()
              }
              this.$router.push('/')
            }).catch(err => {
              console.log(err)
              if (err == "logout") {
                this.$api.user_logout()
              }
            })
          })
        }
      },300)
    }catch (e) {

    }
    try {
      this.connect()
    }catch (e) {

    }
    setInterval(()=>{
      if(localStorage.getItem('token')){
        try {
          this.$api.user_refresh().then(()=>{
            if(localStorage.getItem('token')){
              this.$peer._options.token = localStorage.getItem('token')
              this.$peer.disconnect()
              this.$peer.reconnect()
            }
          })
        }catch (e) {

        }
      }
    },1000*60*3)
    try {
      this.$peer.on('open', (id) => {
        console.log(id);
        this.$store.dispatch('SET_PEER_ID', id)
        console.log('waiting for calls')
        // this.$peer.on('call', (call) => {
        //   if (!this.callInfo) {
        //     this.$store.dispatch('SET_IS_CALLING', true)
        //     this.callInfo = call
        //   }
        //   call.on('stream', (stream) => {
        //
        //   })
        // })
      })
    }catch (e) {

    }
    this.$peer.on('disconnected', () => {
      try {
        this.$peer.reconnect()
      }catch (e) {

      }
    })
    this.$peer.on('error', (err) => {
      console.log("peer error", err)
      try {
        this.$peer.reconnect()
      }catch (e) {

      }
    })
  },
  methods: {
    sendEmail(){
      try {
        this.$api.post('/utils/send_activation_link').then(res=>{
          console.log(res)
        })
      }catch (e) {

      }
    },
    connect(type){
      try {
        this.$api.get(`utils/connection${type ? '?type='+type : ''}`).then(res=>{
          this.$emitter.emit("update", 'longpool');
          clearTimeout(this.connectionTimer)
          if(localStorage.getItem('token')){
            this.connectionTimer = setTimeout(()=>{this.connect('reload')},15000)
          }else{
            this.connectionTimer = setTimeout(()=>{this.connect('reload')},1000)
          }
        }).catch(()=>{
          clearTimeout(this.connectionTimer)
          if(localStorage.getItem('token')){
            this.connectionTimer = setTimeout(()=>{this.connect('reload')},15000)
          }else{
            this.connectionTimer = setTimeout(()=>{this.connect('reload')},1000)
          }
        })
      }catch {

      }
    }
    // decline() {
    //   if (this.callInfo) {
    //     this.$store.dispatch('SET_IS_CALLING', false)
    //     this.callInfo.close()
    //     this.callInfo = null
    //   }
    // },
    // accept() {
    //   if (this.callInfo) {
    //     console.log(this.callInfo)
    //     this.$store.dispatch('SET_IS_CALLING', false)
    //     this.callInfo.answer()
    //     let connections = Array.from(this.$store.getters.CONNECTIONS)
    //     connections.push(this.callInfo)
    //     console.log(1, connections)
    //     this.$store.dispatch('SET_CONNECTIONS', connections)
    //     this.$store.dispatch('SET_SHOW_COMMUNICATION', true)
    //     this.$router.push(`/room/${this.callInfo.peer}`)
    //     console.log(this.$store.getters.PEER.connections)
    //   }
    // },
    // completeCall() {
    //   this.$store.dispatch('SET_SHOW_COMMUNICATION', false)
    //   this.$store.dispatch('SET_IS_CALLING', false)
    //   this.$store.dispatch('SET_CONNECTIONS', [])
    //   this.$router.push('/')
    // }
  }
}
</script>
<style scoped lang="scss">
.header{
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--color-main);
  background: var(--color-accent);
  p{
    padding: 12px 0;
  }
  a{
    cursor: pointer;
    text-decoration: underline;
    &:hover{
      color: var(--color-additional);
    }
  }
}
</style>
