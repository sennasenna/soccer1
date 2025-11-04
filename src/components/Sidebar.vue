<template>
  <aside class="sidebar">
    <div class="sidebar-content">
      <div class="sidebar-header">
        <div class="logo-icon">⚽</div>
        <span class="sidebar-title">{{ $t('sidebar.title') }}</span>
      </div>

      <nav class="sidebar-nav">
        <button
          class="nav-button"
          :class="{ active: currentView === 'calculator' }"
          @click="switchView('calculator')"
        >
          <span class="nav-icon">📊</span>
          <span class="nav-text">{{ $t('sidebar.calculator') }}</span>
        </button>

        <button
          class="nav-button"
          :class="{ active: currentView === 'comparison' }"
          @click="switchView('comparison')"
        >
          <span class="nav-icon">⚖️</span>
          <span class="nav-text">{{ $t('sidebar.comparison') }}</span>
        </button>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { ViewStore } from '@/store/ViewStore'

const viewStore = ViewStore()
const currentView = computed(() => viewStore.currentView)

const switchView = (view) => {
  viewStore.setCurrentView(view)
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 999;
  transition: all 0.3s ease;
}

.dark .sidebar {
  background: rgba(31, 41, 55, 0.95);
  border-right: 1px solid rgba(75, 85, 99, 0.3);
}

.sidebar-content {
  padding: 30px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .sidebar-header {
  border-bottom-color: rgba(75, 85, 99, 0.3);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.dark .sidebar-title {
  color: #f3f4f6;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  font-size: 16px;
  width: 100%;
}

.nav-button:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transform: translateX(5px);
}

.nav-button.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.dark .nav-button {
  color: #9ca3af;
}

.dark .nav-button:hover {
  background: rgba(102, 126, 234, 0.2);
  color: #a5b4fc;
}

.nav-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.nav-text {
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 220px;
  }

  .sidebar-content {
    padding: 20px 15px;
  }

  .sidebar-header {
    margin-bottom: 30px;
    padding-bottom: 15px;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .sidebar-title {
    font-size: 16px;
  }

  .nav-button {
    padding: 12px 15px;
    font-size: 14px;
    gap: 12px;
  }

  .nav-icon {
    font-size: 18px;
    width: 20px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 200px;
  }

  .nav-text {
    display: none; /* 在最小屏幕上只显示图标 */
  }

  .nav-button {
    justify-content: center;
    padding: 15px;
  }
}
</style>