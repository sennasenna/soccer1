import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { ThemeStore } from './store/ThemeStore'
import './index.css'  // 这里 index.css 应该包含 @tailwind 指令
import i18n from './i18n'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(i18n)
// 主题初始化，必须在挂载前执行
const themeStore = ThemeStore()
themeStore.init()

app.mount('#app')