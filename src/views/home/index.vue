<template>
  <div class="container-messenger" :class="{activated:this.$store.getters.USER.is_activated}">
    <aside class="folders">
      <ul>
        <li>
          <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.88818 12.9824H21.8882" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3.88818 6.98242H21.8882" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3.88818 18.9824H21.8882" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </li>
        <li v-for="(folder,index) in folder.list" :class="{active: index == folder.selected}" :key="index" @click="selectFolder(index)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{folder}}
        </li>
      </ul>
    </aside>
    <aside class="chats">
      <input type="text" placeholder="поиск" ref="search" v-model="searchText" @input="search">
      <ul>
        <li v-if="finded.length == 0 || searchText.length == 0" v-for="(chat,index) in chats.list[folder.selected]" :class="{active: index == chat.selected}" :key="index" @click="selectChat(chat)">
          <div>
            <img v-if="chat.avatar" :src="chat.avatar" alt="">
            <img v-else src="@/assets/1.png" alt="">
            <p class="title">{{chat.title}}</p>
          </div>
          <p class="online" v-if="new Date().getTime() < new Date(chat.online).getTime()+5*60000"></p>
          <div>
            <p class="content">{{chat.last_message_content}}</p>
            <p class="time">{{new Intl.DateTimeFormat("ru", {dateStyle: "medium",timeStyle: "short"}).format(new Date(chat.last_message_created))}}</p>
          </div>
        </li>

        <li v-else v-for="(chat,index) in finded" :key="index+''+chat.id" @click="selectChat(chat)">
          <div>
            <img v-if="chat.avatar" :src="chat.avatar" alt="">
            <img v-else src="@/assets/1.png" alt="">
            <p class="title">{{chat.title}}</p>
          </div>
        </li>
      </ul>
    </aside>
    <div class="messanger" v-if="chats.selected">
      <div class="messanger__header">
        <img v-if="chats.selected.avatar" :src="chats.selected.avatar" alt="">
        <img src="@/assets/1.png" alt="">
        <p class="title">{{chats.selected.title}}</p>
        <svg @click="callTo" width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.4003 17.0519V20.0519C22.4015 20.3304 22.3444 20.6061 22.2328 20.8613C22.1213 21.1165 21.9576 21.3455 21.7524 21.5338C21.5472 21.7221 21.3049 21.8654 21.0411 21.9546C20.7772 22.0439 20.4977 22.077 20.2203 22.0519C17.1432 21.7176 14.1873 20.6661 11.5903 18.9819C9.17415 17.4466 7.12566 15.3981 5.59032 12.9819C3.9003 10.3731 2.84857 7.40293 2.52032 4.31193C2.49533 4.0354 2.5282 3.75669 2.61682 3.49356C2.70545 3.23042 2.84789 2.98862 3.03509 2.78355C3.22228 2.57849 3.45013 2.41464 3.70411 2.30245C3.9581 2.19027 4.23266 2.13219 4.51032 2.13193H7.51032C7.99563 2.12716 8.46612 2.29901 8.83409 2.61547C9.20206 2.93192 9.4424 3.37138 9.51032 3.85193C9.63695 4.812 9.87177 5.75466 10.2103 6.66193C10.3449 7.01986 10.374 7.40885 10.2942 7.78281C10.2145 8.15678 10.0292 8.50004 9.76032 8.77193L8.49032 10.0419C9.91388 12.5455 11.9868 14.6184 14.4903 16.0419L15.7603 14.7719C16.0322 14.5031 16.3755 14.3178 16.7494 14.238C17.1234 14.1583 17.5124 14.1874 17.8703 14.3219C18.7776 14.6605 19.7203 14.8953 20.6803 15.0219C21.1661 15.0905 21.6097 15.3351 21.9269 15.7094C22.244 16.0837 22.4125 16.5615 22.4003 17.0519Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="messanger__body" ref="body">
        <ul ref="messages">
          <li v-for="(item,index) in chats.messages" :key="index" :class="{right: item.id_chat_from == user.chat}">
            {{item.content}}
          </li>
        </ul>
      </div>
      <div class="messanger__footer">
        <textarea ref="message" placeholder="Сообщение" @keyup.enter="sendMessage"></textarea>
        <svg @click="sendMessage" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 2L11 13" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "home",
  data() {
    return {
      text: '',
      user: this.$store.getters.USER,
      folder: {
        selected: 0,
        list: [
          ''
        ]
      },
      chats: {
        page: 0,
        selected: undefined,
        messages: [],
        list: {
          0: {}
        },
      },
      finded: [

      ],
      searchText: ''
    }
  },
  mounted() {
    this.loadData()
    this.folder.list = [
      '', ...this.$store.getters.FOLDER
    ]
    this.$emitter.on("longpool", type => {
      console.log(type)
      this.loadData()
    });
    this.$emitter.on("update", type => {
      console.log(type)
      this.loadData()
    });
    setInterval(()=>{
      if(this.chats.selected){
        this.$api.get(`messages/${this.chats.selected.id}`).then(res=>{
          this.chats.messages = []
          this.chats.messages = res.messages
        })
      }
    },200)
    // this.$refs.body.scrollTo(0, this.$refs.messages.scrollHeight);
  },
  methods: {
    loadData() {
      this.$api.get(`chat?page=${this.chats.page}&folder=${this.folder.selected}`).then(res => {
        console.log(res)
        this.chats.list[res.folder] = res.chats
        // let chats = []
        // if(this.chats.list[String(res.folder)]){
        //   Object.keys(this.chats.list[String(res.folder)]).forEach(key=>{
        //     console.log(String(key),String(res.folder),typeof this.chats.list[String(res.folder)][String(key)],this.chats.list[String(res.folder)][String(key)])
        //     chats.push(...this.chats.list[String(res.folder)][String(key)])
        //   })
        //   this.chats.list[String(res.folder)] = chats
        // }
      })
      if(this.chats.selected){
        this.$api.get(`messages/${this.chats.selected.id}`).then(res=>{
          this.chats.messages = []
          this.chats.messages = res.messages
          setTimeout(()=>{
            this.$refs.body.scrollTo(0, this.$refs.messages.scrollHeight);
          },100)
        })
      }
    },
    selectFolder(){
      this.loadData()
    },
    selectChat(id) {
      this.chats.selected = id
      this.loadData()
    },
    call() {
      this.$store.dispatch('SET_CONNECT_TO', this.text)
      console.log(this.$peer);
      this.$peer.call(this.text)
    },
    copy() {
      navigator.clipboard.writeText(this.$store.getters.PEERID)
    },
    sendMessage(){
      if(this.$refs.message.value.replaceAll(' ','').replaceAll('\n','').length > 0){
        this.$api.post(`messages/${this.chats.selected.id}`,{},{
          content: this.$refs.message.value,
        }).then(()=>{
          this.$refs.message.value = ""
          this.loadData()
        })
      }
    },
    search(){
      if(this.$refs.search.value.replaceAll(' ','').length > 0){
        this.$api.get(`user/search?text=${this.$refs.search.value}`).then(res=>{
          this.finded = res.users
        })
      }
    },
    callTo(){
      this.$api.get(`user/callinfo/${this.chats.selected.id}`).then(res=>{
        console.log(res.callinfo[0].peer)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container-messenger {
  flex: 1 0 auto;
  display: grid;
  grid-template-columns: 80px 340px 1fr;
  &.activated{
    .chats{
      max-height: 100vh;
    }
    .messanger{
      max-height: 100vh;
      &__header{
        top: 0;
      }
    }
  }
  .folders{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px 6px;
    background: #537CD2;
    ul{
      display: flex;
      flex-direction: column;
      gap: 12px;
      text-align: center;
      li{
        &:first-child{
          margin-bottom: 36px;
        }
      }
    }
  }
  .chats{width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-y: overlay;
    max-height: calc(100vh - 36px);
    background: var(--color-accent-30);
    padding: 12px;
    ul{
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 20px;
      li{
        position: relative;
        background: var(--color-main-30);
        padding: 12px;
        border-radius: var(--border-radius);
        cursor: pointer;
        img{
          width: 56px;
          aspect-ratio: 1/1;
          border: 2px solid var(--color-accent);
          border-radius: 50%;
          background: var(--color-main);
        }
        .online{
          position: absolute;
          top: 12px;
          right: 12px;
          display: block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-accent);
        }
        div{
          display: flex;
          align-items: center;
          &:last-of-type{
            margin-top: 6px;
          }
          .title{
            font-size: 18px;
            margin-left: 12px;
          }
          .time{
            font-size: 10px;
            margin-left: auto;
          }
        }
      }
    }
  }
  .messanger{
    display: grid;
    grid-template-columns: 1fr;
    height: 100%;
    max-height: calc(100vh - 36px);
    position: relative;
    border-left: 2px solid var(--color-accent);
    &__header{
      position: fixed;
      top: 0;
      height: 72px;
      display: flex;
      align-items: center;
      padding: 0 12px;
      top: 36px;
      width: calc(100vw - 340px - 80px);
      background: #fff;
      svg{
        margin-left: auto;
        cursor: pointer;
        margin-right: 24px;
      }
      img{
        width: 56px;
        aspect-ratio: 1/1;
        border: 2px solid var(--color-accent);
        border-radius: 50%;
        background: var(--color-main);
      }
      .title{
        font-size: 18px;
        margin-left: 12px;
      }
    }
    &__body{
      padding: 84px 12px 112px 12px;
      flex: 1 0 auto;
      overflow-y: auto;
      overflow-y: overlay;
      height: 100%;
      ul{
        display: flex;
        flex-direction: column-reverse;
        justify-content: flex-end;
        gap: 12px;
        *:last-child{
          margin-top: auto;
        }
        li{
          padding: 12px;
          border-radius: var(--border-radius);
          background: var(--color-accent-30);
          margin-right: auto;
          &.right{
            background: var(--color-additional);
            margin-left: auto;
            margin-right: 0;
          }
        }
      }
    }
    &__footer{
      border-top: 2px solid var(--color-accent);
      position: fixed;
      bottom: 0;
      height: 100px;
      display: flex;
      width: calc(100vw - 340px - 80px);
      z-index: 999999;
      background: #fff;
      textarea{
        width: 100%;
        height: 100%;
        padding: 12px 60px 12px 12px;
        resize: none;
        background: var(--main-color);
        color: var(--font-color);
      }
      svg{
        position: absolute;
        top: 12px;
        right: 12px;
        cursor: pointer;
      }
    }
  }
}
</style>
