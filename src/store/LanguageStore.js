import { defineStore } from 'pinia'
import { ref } from 'vue'


export const LanguageStore = defineStore('LanguageStore', () => {
    const currentLocale = ref(localStorage.getItem('locale') || 'en')
    const changeLanguage = (newLocale) => {
        currentLocale.value = newLocale
        localStorage.setItem('locale', newLocale)
  }

  return { currentLocale, changeLanguage }

})