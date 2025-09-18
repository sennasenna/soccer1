<template>
  <header class="topbar">
    <!-- 左侧Logo区域 -->
    <div class="logo-section">
      <div class="logo-icon">⚽</div>
      <span class="logo-text">{{$t("header.Markets")}}</span>
    </div>

    <!-- 右侧控制区域 -->
    <div class="controls">
      <!-- 多语言选择器 -->
      <select
        v-model="currentLanguage"
        @change="changeLanguage($event.target.value)"
        class="language-selector"
      >
        <option value="zh">中文</option>
        <option value="en">English</option>
      </select>

      <!-- 主题切换按钮 -->
      <button
        @click="toggleTheme"
        class="theme-toggle"
        :title="themeStore.dark ? $t('header.Switch to Light Mode') : $t('header.Switch to Dark Mode')"
      >
        <!-- 太阳图标 (浅色模式) -->
        <svg v-if="!themeStore.dark" class="theme-icon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
        </svg>
        <!-- 月亮图标 (深色模式) -->
        <svg v-else class="theme-icon" fill="currentColor" viewBox="0 0 24 24">
          <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, watch } from 'vue'

/* -- 主题切换 -- */
import { ThemeStore } from '@/store/ThemeStore'
const themeStore = ThemeStore()
themeStore.init()
const toggleTheme = themeStore.toggle

/* -- 语言切换 -- */
import { useI18n } from 'vue-i18n'
import { LanguageStore } from '@/store/LanguageStore'

const currentLanguage = ref(localStorage.getItem('locale') || 'zh')
const { locale } = useI18n()
const language_store = LanguageStore()
const changeLanguage = language_store.changeLanguage

watch(
  () => language_store.currentLocale,
  (newLang) => {
    locale.value = newLang
  },
  { immediate: true } // 页面加载时立即同步一次
)

</script>

<style scoped>
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  transition: all 0.3s ease;
}

/* 暗色主题 */
.dark .topbar {
  background: rgba(31, 41, 55, 0.95);
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
  color: white;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #667eea;
}

.dark .logo-text {
  color: #9ca3af;
}

.controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.language-selector {
  padding: 8px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  background: white;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.language-selector:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.dark .language-selector {
  background: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.theme-toggle {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  background: #e5e7eb;
  transform: scale(1.05);
}

.dark .theme-toggle {
  background: #4b5563;
  color: #f3f4f6;
}

.dark .theme-toggle:hover {
  background: #6b7280;
}

.theme-icon {
  width: 20px;
  height: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .topbar {
    padding: 0 20px;
    height: 56px;
  }

  .logo-text {
    display: none; /* 在手机端隐藏logo文字 */
  }

  .logo-icon {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .controls {
    gap: 12px;
  }

  .language-selector {
    padding: 6px 8px;
    font-size: 12px;
    min-width: 60px;
  }

  .theme-toggle {
    width: 36px;
    height: 36px;
  }

  .theme-icon {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .topbar {
    padding: 0 15px;
  }

  .controls {
    gap: 8px;
  }
}
</style>