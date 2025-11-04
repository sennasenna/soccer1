<template>
  <div class="app-container">
    <Sidebar />
    <div class="main-area">
      <TopBar />
      <main class="main-content">
        <!-- 根据当前视图显示不同组件 -->
        <Markets v-if="viewStore.currentView === 'calculator'" />
        <Comparison v-else-if="viewStore.currentView === 'comparison'" />
      </main>
    </div>
  </div>
</template>


<script setup>
import { onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import TopBar from '@/components/TopBar.vue'
import Markets from '@/components/Markets.vue'
import Comparison from '@/components/Comparison.vue'
import { ViewStore } from '@/store/ViewStore'

const viewStore = ViewStore()

// 初始化视图状态
onMounted(() => {
  viewStore.initView()
})
</script>


<style>
/* 全局样式 - 不使用 scoped */
.app-container {
  min-height: 100vh;
  background-color: #ffffff;
  color: #1f2937;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 暗色主题样式 */
.dark .app-container {
  background-color: #111827;
  color: #f3f4f6;
}

.main-area {
  margin-left: 260px; /* 为侧边栏留出空间 */
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.main-content {
  padding-top: 80px; /* 为固定的TopBar留出空间 */
  padding-bottom: 40px;
  background: transparent;
  min-height: calc(100vh - 80px);
}

/* 确保body也支持暗色主题 */
body {
  margin: 0;
  padding: 0;
  background-color: #ffffff;
  transition: background-color 0.3s ease;
}

.dark body {
  background-color: #111827;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.dark ::-webkit-scrollbar-track {
  background: #1e293b;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #475569;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* 响应式设计 - 侧边栏 */
@media (max-width: 768px) {
  .main-area {
    margin-left: 220px; /* 移动端侧边栏变窄 */
  }
}

@media (max-width: 480px) {
  .main-area {
    margin-left: 200px; /* 最小屏幕侧边栏 */
  }
}
</style>