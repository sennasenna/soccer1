<template>
  <div class="comparison-container">
    <div class="comparison-content">
      <!-- 占位区域 -->
      <div class="placeholder-section">
        <div class="placeholder-card">
          <h2 class="placeholder-title">
            <span class="icon">⚖️</span>
            {{ $t('comparison.title') }}
          </h2>
          <p class="placeholder-description">
            {{ $t('comparison.description') }}
          </p>
          <div class="feature-list">
            <div class="feature-item">
              <span class="feature-icon">📊</span>
              <span>{{ $t('comparison.feature1') }}</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🔍</span>
              <span>{{ $t('comparison.feature2') }}</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📈</span>
              <span>{{ $t('comparison.feature3') }}</span>
            </div>
          </div>
          <div class="coming-soon">
            <span class="badge">{{ $t('comparison.comingSoon') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 组件逻辑将在后续添加
</script>

<style scoped>
.comparison-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.comparison-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
  min-height: 70vh;
}

.placeholder-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.placeholder-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dark .placeholder-card {
  background: rgba(31, 41, 55, 0.95);
  border-color: rgba(75, 85, 99, 0.3);
}

.placeholder-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #333;
  margin-bottom: 20px;
  font-size: 28px;
}

.dark .placeholder-title {
  color: #f3f4f6;
}

.icon {
  font-size: 32px;
}

.placeholder-description {
  color: #666;
  font-size: 16px;
  margin-bottom: 30px;
  line-height: 1.6;
}

.dark .placeholder-description {
  color: #9ca3af;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.feature-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 10px;
  color: #333;
  font-size: 15px;
}

.dark .feature-item {
  background: #1f2937;
  color: #f3f4f6;
}

.feature-icon {
  font-size: 20px;
}

.coming-soon {
  margin-top: 20px;
}

.badge {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .comparison-container {
    padding: 0 15px;
  }

  .placeholder-card {
    padding: 30px 20px;
  }

  .placeholder-title {
    font-size: 24px;
  }

  .icon {
    font-size: 28px;
  }

  .placeholder-description {
    font-size: 15px;
  }

  .feature-item {
    font-size: 14px;
    padding: 12px 15px;
  }
}

@media (max-width: 480px) {
  .placeholder-card {
    padding: 25px 15px;
  }

  .placeholder-title {
    font-size: 22px;
    flex-direction: column;
    gap: 8px;
  }

  .feature-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
}
</style>