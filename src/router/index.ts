import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/EncryptView.vue'
import EncryptView from '@/views/EncryptView.vue'
import DecryptView from '@/views/DecryptView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/encrypt',
    },
    {
      path: '/encrypt',
      component: EncryptView,
    },
    {
      path: '/decrypt',
      component: DecryptView,
    },
  ],
})

export default router
