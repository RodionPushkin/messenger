<template>
  <div class="call" ref="call">
    <div class="bar">
      <p class="m">{{text}}</p>
      <div class="decline" @click="$emit('decline')">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-phone-off"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
      </div>
      <div class="accept" @click="$emit('accept')">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-phone-call"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "call.component",
  data(){
    return{
      text: null
    }
  },
  mounted() {
    this.text = 'ислам'
    let audio = new Audio();
    audio.loop = true
    audio.src = '/sounds/call.mp3';
    audio.src = '/sounds/call.wav';
    audio.volume = 0.15
    this.$refs.call.appendChild(audio)
    audio.play()
    setTimeout(()=>{
      this.$emit('decline')
    },210000)
  }
}
</script>

<style lang="scss" scoped>
.call{
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: stretch;
  gap: 24px;
  z-index: 999;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(22px);
  padding: 48px;
  padding-bottom: 128px;
  audio{
    display: none;
  }
  p{
    color: var(--black-color);
    text-align: center;
    position: absolute;
    top: 20vh;
    left: 0;
    width: 100%;
  }
  .bar{
    display: flex;
    justify-content: space-between;
    gap: 12px;
    >div{
      height: 64px;
      aspect-ratio: 1/1;
      border-radius: 50%;
      color: var(--bg-color);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      cursor: pointer ;
    }
    .decline{
      background: var(--main-color);
    }
    .accept{
      background: #5cff5c;
    }
  }
  @media screen and (min-width: 768px) {
    justify-content: center;
    align-items: center;
    .bar{
      padding: 24px;
      border-radius: var(--border-radius);
      background: var(--bg-color);
      width: auto;
      gap: 48px;
      align-items: center;
      >div{
        height: 48px;
      }
      p{
        position: static;
        width: auto;
      }
    }
  }
}
</style>