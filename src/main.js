import './assets/main.css'
import './index.css'  // 这里 index.css 应该包含 @tailwind 指令

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import i18n from './i18n'
import { ThemeStore } from './store/ThemeStore'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(i18n)
const themeStore = ThemeStore()
themeStore.init()
app.mount('#app')