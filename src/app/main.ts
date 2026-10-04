import { VueQueryPlugin } from '@tanstack/vue-query'
import { THEME } from '@/shared/config'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import './styles/main.css'
import './styles/base.scss'

import App from './App.vue'
import { createQueryClient } from './providers'
import router from './router'

document.documentElement.setAttribute(THEME.ATTRIBUTE, THEME.DEFAULT)

const app = createApp(App)

app.use(createPinia())
app.use(VueQueryPlugin, { queryClient: createQueryClient() })
app.use(router)

async function mount(): Promise<void> {
  if (import.meta.env.MODE === 'e2e') {
    const { worker } = await import('@mocks/browser')
    await worker.start()
  }
  app.mount('#app')
}

void mount()
