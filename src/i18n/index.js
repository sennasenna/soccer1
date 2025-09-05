import { createI18n } from 'vue-i18n'

// 导入语言文件
import zh from './locales/zh.json'
import en from './locales/en.json'


const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages: {
    zh,
    en
  },
  numberFormats: {
    'en': {
      currency: {
        style: 'currency',
        currency: 'USD'
      }
    },
    'zh': {
      currency: {
        style: 'currency',
        currency: 'CNY'
      }
    }
  },
  datetimeFormats: {
    'en': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    },
    'zh': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    }
  }
})

export default i18n