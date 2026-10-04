import { THEME } from '@/shared/config'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import './styles/main.css'
import './styles/base.scss'

import App from './App.vue'
import router from './router'

document.documentElement.setAttribute(THEME.ATTRIBUTE, THEME.DEFAULT)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
