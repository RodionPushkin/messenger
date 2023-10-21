<template>
  <div :class="isMobile ? 'mobile' : ''" class="communication">
    <div v-show="showScreen || enableCamera" id="selfvideo" ref="selfvideo"
         :class="{'screencast': showScreen,'pos-1': position == 1,'pos-2': position == 2,'pos-3': position == 3,'pos-4': position == 4}" @click="changepos()"></div>
    <div id="videoconainer" ref="videoconainer" :class="{multiple: this.$store.getters.CONNECTIONS.length > 1}"></div>
    <div class="bar shadow">
      <div class="shadow" @click="toggleMic()" :class="enableMic ? 'active-mic' : ''">
        <svg v-if="!enableMic" class="feather feather-mic-off" fill="none" height="24" stroke="currentColor"
             stroke-linecap="round"
             stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"
             xmlns="http://www.w3.org/2000/svg">
          <line x1="1" x2="23" y1="1" y2="23"></line>
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
          <line x1="12" x2="12" y1="19" y2="23"></line>
          <line x1="8" x2="16" y1="23" y2="23"></line>
        </svg>
        <svg v-else class="feather feather-mic" fill="none" height="24" stroke="currentColor" stroke-linecap="round"
             stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"
             xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" x2="12" y1="19" y2="23"></line>
          <line x1="8" x2="16" y1="23" y2="23"></line>
        </svg>
      </div>
      <div class="shadow" @click="toggleCamera()" :class="enableCamera ? 'active-cam' : ''">
        <svg v-if="!enableCamera" class="feather feather-video-off" fill="none" height="24" stroke="currentColor"
             stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"
             xmlns="http://www.w3.org/2000/svg">
          <path
              d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path>
          <line x1="1" x2="23" y1="1" y2="23"></line>
        </svg>
        <svg v-else class="feather feather-video" fill="none" height="24" stroke="currentColor" stroke-linecap="round"
             stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"
             xmlns="http://www.w3.org/2000/svg">
          <polygon points="23 7 16 12 23 17 23 7"></polygon>
          <rect height="14" rx="2" ry="2" width="15" x="1" y="5"></rect>
        </svg>
      </div>
      <div v-if="countCameras > 1 && enableCamera" class="shadow" @click="rotateCamera()">
        <svg class="feather feather-rotate-cw" fill="none" height="24" stroke="currentColor" stroke-linecap="round"
             stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"
             xmlns="http://www.w3.org/2000/svg">
          <polyline points="23 4 23 10 17 10"></polyline>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
      </div>
      <div class="shadow" @click="toggleScreenCast()" :class="showScreen ? 'active-cast' : ''">
        <svg class="feather feather-monitor" fill="none" height="24" stroke="currentColor" stroke-linecap="round"
             stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"
             xmlns="http://www.w3.org/2000/svg">
          <rect height="14" rx="2" ry="2" width="20" x="2" y="3"></rect>
          <line x1="8" x2="16" y1="21" y2="21"></line>
          <line x1="12" x2="12" y1="17" y2="21"></line>
        </svg>
      </div>
      <div class="shadow complete" @click="completeCall()">
        <svg class="feather feather-phone-off" fill="none" height="24" stroke="currentColor" stroke-linecap="round"
             stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24"
             xmlns="http://www.w3.org/2000/svg">
          <path
              d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
          <line x1="23" x2="1" y1="1" y2="23"></line>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "communication.component",
  data() {
    return {
      isMobile: false,
      userMedia: null,
      stream: null,
      enableMic: true,
      cameraRotation: false,
      enableCamera: false,
      myVideo: null,
      countCameras: null,
      showScreen: false,
      selfAudioTrack: null,
      selfVideoTrack: null,
      position: 1,
    }
  },
  mounted() {
    console.log(this.$store.getters.CONNECTIONS)
    navigator.mediaDevices.enumerateDevices().then(res => {
      this.countCameras = res.filter(item => item.kind == "videoinput").length
    })
    this.userMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia
    this.isMobile = navigator.userAgentData.mobile
    this.stream = new MediaStream
    this.reload()
    setInterval(() => {
      this.stream.getVideoTracks().forEach(track => {
        if (track.readyState == "ended") {
          if (this.enableCamera) this.enableCamera = false
          if (this.showScreen) this.showScreen = false
          this.stream.removeTrack(track)
          this.selfVideoTrack = null
          this.reload()
        }
      })
    }, 500)
    console.log("id",this.$route.params.id)
    this.$peer.call(this.$route.params.id,this.stream)
    this.$peer.on('call',(call)=>{
      call.answer()
      this.$peer.on('stream',(stream)=>{

      })
    })
  },
  methods: {
    reload() {
      if (this.enableCamera && this.stream.getVideoTracks().length == 0) {
        this.userMedia.call(navigator, {
          video: this.enableCamera ? {
            width: {
              max: !this.isMobile ? 1920 : 1080,
              ideal: !this.isMobile ? 1280 : 720,
              min: !this.isMobile ? 640 : 0,
            },
            height: {
              max: !this.isMobile ? 1080 : 1920,
              ideal: !this.isMobile ? 720 : 1280,
              min: !this.isMobile ? 480 : 0,
            },
            facingMode: this.cameraRotation ? "environment" : "user",
            frameRate: {
              ideal: 60,
              min: 10
            }
          } : this.enableCamera
        }, (stream) => {
          this.reloadSelfCamera(stream)
        }, (e) => {
          if (this.enableCamera) {
            this.enableCamera = false
          }
          console.log(e)
        })
      }
      if (this.enableMic && this.stream.getAudioTracks().length == 0) {
        this.userMedia.call(navigator, {
          audio: this.enableMic ? {
            sampleRate: {
              ideal: 48000,
              min: 44100
            },
            channelCount: {
              ideal: 2,
              min: 1
            },
            volume: 1.0,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } : this.enableMic
        }, (stream) => {
          this.reloadSelfCamera(stream)
        }, (e) => {
          if (this.enableMic) {
            this.enableMic = false
          }
          console.log(e)
        })
      }
      if (this.showScreen && this.stream.getVideoTracks().length == 0) {
        navigator.mediaDevices.getDisplayMedia({
          audio: false,
          video: true
        }).then((stream) => {
          this.reloadSelfCamera(stream)
        }).catch((e) => {
          this.showScreen = false
          this.reload()
          this.selfVideoTrack = null
          console.log(e)
        })
      } else if (!this.enableCamera && !this.showScreen && !this.enableMic && this.myVideo) {
        this.myVideo.remove()
      }
    },
    toggleCamera() {
      this.showScreen = false
      this.enableCamera = !this.enableCamera
      if (this.stream && this.stream.getVideoTracks().length > 0) {
        this.stream.getVideoTracks().forEach(track => {
          track.stop()
          this.stream.removeTrack(track)
          this.selfVideoTrack = null
        })
      }
      this.reload()
    },
    toggleMic() {
      this.enableMic = !this.enableMic
      if (this.stream && this.stream.getAudioTracks().length > 0) {
        this.stream.getAudioTracks().forEach(track => {
          track.stop()
          this.stream.removeTrack(track)
          this.selfAudioTrack = null
        })
      }
      this.reload()
    },
    rotateCamera() {
      this.cameraRotation = !this.cameraRotation
      this.reload()
    },
    toggleScreenCast() {
      this.enableCamera = false
      this.showScreen = !this.showScreen
      if (this.stream && this.stream.getVideoTracks().length > 0) {
        this.stream.getVideoTracks().forEach(track => {
          track.stop()
          this.stream.removeTrack(track)
          this.selfVideoTrack = null
        })
      }
      this.reload()
    },
    reloadSelfCamera(stream) {
      // this.stream = new MediaStream
      if (stream.getAudioTracks().length > 0) {
        if (this.selfAudioTrack) this.selfAudioTrack.stop()
        this.selfAudioTrack = stream.getAudioTracks()[0]
      }
      if (stream.getVideoTracks().length > 0) {
        if (this.selfVideoTrack) this.selfVideoTrack.stop()
        this.selfVideoTrack = stream.getVideoTracks()[0]
      }
      if (this.selfVideoTrack) this.stream.addTrack(this.selfVideoTrack)
      if (this.selfAudioTrack) this.stream.addTrack(this.selfAudioTrack)
      if (this.myVideo != null) this.myVideo.remove()
      this.myVideo = document.createElement('video')
      this.myVideo.muted = true
      if (window.webkitURL) {
        this.myVideo.srcObject = this.stream;
      } else {
        this.myVideo.src = this.stream;
      }
      this.myVideo.addEventListener('loadedmetadata', () => {
        this.myVideo.play()
      })
      this.$refs.selfvideo.appendChild(this.myVideo)
    },
    completeCall() {
      this.stream.getTracks().forEach(track=>{
        track.stop()
        this.stream.removeTrack(track)
      })
      this.$emit('completeCall')
    },
    changepos(){
      this.position++
      if(this.position > 4){
        this.position = 1
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.communication {
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 9999;
  background: var(--color-font);

  #selfvideo {
    border-radius: var(--border-radius);
    overflow: hidden;
    position: absolute;
    aspect-ratio: 16/9;
    transform: scaleX(-1);
    cursor: pointer;

    &.screencast {
      transform: scaleX(1);
    }
    &.pos-1{
      left: auto;
      bottom: auto;
      top: 48px;
      right: 48px;
    }
    &.pos-2{
      left: auto;
      top: auto;
      bottom: 48px;
      right: 48px;
    }
    &.pos-3{
      right: auto;
      top: auto;
      bottom: 48px;
      left: 48px;
    }
    &.pos-4{
      right: auto;
      bottom: auto;
      top: 48px;
      left: 48px;
    }
  }

  #videoconainer {
    &.multiple {
      display: grid;
      grid-template-columns: 1fr 1fr;

    }
  }

  &.mobile {
    #selfvideo {
      aspect-ratio: 9/16;
    }
  }

  .bar {
    position: absolute;
    bottom: 128px;
    //width: calc(100vw - 96px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-main);
    display: flex;
    gap: 24px;
    border-radius: 36px;
    justify-content: center;
    align-items: center;

    > div {
      border-radius: 24px;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1/1;
      cursor: pointer;

      svg {
        height: 20px;
        aspect-ratio: 1/1;
      }
      &.active-mic{
        color: #19d77a;
      }
      &.active-cam{
        color: #1955d7;
      }
      &.active-cast{
        color: #5f19d7;
      }
      &.complete {
        background: red;
        color: var(--color-main);
        transition: 0.3s;
        transform: translateX(1px);
        @media screen and (min-width: 768px) {
          &:hover {
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
#selfvideo > video {
  aspect-ratio: 16/9;
  max-width: 300px;
  max-height: none;
  object-fit: cover;
}

.mobile {
  #selfvideo > video {
    aspect-ratio: 9/16;
    max-width: none;
    max-height: 300px;
    object-fit: cover;
  }
}

#videoconainer {
  &:not(.multiple) {
    video {
      height: 100vh;
      width: 100vw;
      object-fit: contain;
    }
  }
}
</style>
