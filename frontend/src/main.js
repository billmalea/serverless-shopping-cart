import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Products from './pages/Products.vue'
import Cart from './pages/Cart.vue'
import Callback from './pages/Callback.vue'

const routes = [
  { path: '/', component: Products },
  { path: '/cart', component: Cart },
  { path: '/callback', component: Callback }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App).use(router).mount('#app')
