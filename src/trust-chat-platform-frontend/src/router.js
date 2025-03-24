import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from './components/Home.vue'
import Chat from './components/Chat.vue'
import ApiKeySettings from './components/ApiKeySettings.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/chat/:modelId',
    name: 'Chat',
    component: Chat,
    props: true
  },
  {
    path: '/settings/api-keys',
    name: 'ApiKeySettings',
    component: ApiKeySettings
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
