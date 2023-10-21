import { createRouter, createWebHistory } from 'vue-router'

const title = 'videochat'
import apiModule from '../api'
import store from '../store'

const api = new apiModule('/api/')
const authGuard = async (to, from, next) => {
  let isAuthorized = false
  if (localStorage.token) {
    await api.user_self().then(res => {
      if ("message" in res) {
        console.log(res)
      } else {
        store.dispatch('SET_USER',res.user)
        isAuthorized = true
      }
    }).catch(err => {
      console.log(err)
      if (err == "logout") {
        api.user_logout()
      }
    })
  }
  if (isAuthorized) {
    if (to.path == "/signin" || to.path == "/signup") {
      next('/')
    } else {
      next()
    }
  } else {
    if (to.path == "/signin" || to.path == "/signup") {
      next()
    } else {
      next('/signin')
    }
  }
};
const routes = [
  {
    path: '/',
    name: 'home',
    meta: { title: 'главная' },
    beforeEnter: authGuard,
    component: () => import('../views/home/index.vue')
  },
  {
    path: '/signup',
    name: 'signup',
    meta: { title: 'регистрация' },
    beforeEnter: authGuard,
    component: () => import('../views/signup/index.vue')
  },
  {
    path: '/signin',
    name: 'signin',
    meta: { title: 'вход' },
    beforeEnter: authGuard,
    component: () => import('../views/signin/index.vue')
  },
  {
    path: '/room/:id',
    name: 'room',
    meta: { title: 'комната' },
    beforeEnter: authGuard,
    component: () => import('../views/room/index.vue')
  },
  { path: '/:pathMatch(.*)*', meta: { title: 'ошибка 404' }, component: () => import('../views/404/index.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
router.beforeResolve((to, from, next) => {
  document.querySelector("title").textContent = `${title} - ${to.meta.title}`
  next()
})

export default router
