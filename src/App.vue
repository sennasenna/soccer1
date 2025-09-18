<template>
  <div class="min-h-screen">
    <TopBar />
    <main class="main-content">
      <Markets />
    </main>
  </div>
</template>


<script setup>
import TopBar from '@/components/TopBar.vue'
import Markets from '@/components/Markets.vue'
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

.main-content {
  padding-top: 80px; /* 为固定的TopBar留出空间 */
  padding-bottom: 40px;
  background: transparent;
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
</style>