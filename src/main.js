import { v4 as uuidv4 } from 'uuid';
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import api from "./api";
import config from "../config.json"
import './clear.scss'
import './theme.scss'
import './style.scss'
import mitt from 'mitt';
const emitter = mitt();

const app = createApp(App).mixin({
  data() {
    return {
      componentId: uuidv4()
    }
  },
})
app.config.globalProperties.$api = new api('/api/')
app.config.globalProperties.$peer = new Peer(undefined, {
  host: config.PEER_HOST,
  secure: config.PEER_SECURE,
  port: config.PEER_PORT,
  path: config.PEER_PATH,
  token: localStorage.getItem('token')
})
app.config.globalProperties.$emitter = emitter;
app.use(store).use(router).mount('#app')
