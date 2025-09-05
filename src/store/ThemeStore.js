import { defineStore } from 'pinia'

export const ThemeStore = defineStore('ThemeStore', {
  state: () => ({
    dark: true,
  }),
  actions: {
    toggle() {
      this.dark = !this.dark
      this.applyTheme()
      localStorage.setItem('dark', this.dark ? 'true' : 'false')
    },
    applyTheme() {
      if (this.dark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    init() {
      // 先尝试用 localStorage
      const saved = localStorage.getItem('dark')
      if (saved !== null) {
        this.dark = saved === 'true'
      } else {
        // 否则用系统首选颜色
        this.dark = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      this.applyTheme()
    },
  },
})
