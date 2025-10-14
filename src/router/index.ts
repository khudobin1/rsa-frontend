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
      meta: {
        title: 'Зашифрование RSA',
      },
    },
    {
      path: '/decrypt',
      component: DecryptView,
      meta: {
        title: 'Расшифрование RSA',
      },
    },
  ],
})

router.afterEach((to) => {
  document.title = (to.meta.title as string) || 'Алгоритм RSA'
})

export default router
