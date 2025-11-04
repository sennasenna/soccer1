<template>
  <div class="comparison-container">
    <div class="comparison-content">
      <!-- 联赛选择区域 -->
      <div class="form-section">
        <div class="form-row">
          <div class="form-group">
            <label for="comparisonLeague">{{ $t("comparison.selectLeague") }}</label>
            <select id="comparisonLeague" v-model="selectedLeague" @change="onLeagueChange">
              <option value="">{{ $t("comparison.selectLeaguePlaceholder") }}</option>
              <option v-for="oneleague in leagues" :key="oneleague.league" :value="oneleague.league">
                {{ $t('league.' + oneleague.league) }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="bookmaker">{{ $t("comparison.selectBookmaker") }}</label>
            <select id="bookmaker" v-model="selectedBookmaker" @change="onBookmakerChange">
              <option value="">{{ $t("comparison.selectBookmakerPlaceholder") }}</option>
              <option v-for="bookmaker in bookmakers" :key="bookmaker.id" :value="bookmaker.id">
                {{ $t('bookmakers.' + bookmaker.id) }}
              </option>
            </select>
          </div>
        </div>

        <!-- 选择信息显示 -->
        <div v-if="selectedLeague || selectedBookmaker" class="selection-info">
          <div v-if="selectedLeague" class="info-item">
            <strong>{{ $t('comparison.selectedLeague') }}:</strong>
            <span>{{ $t('league.' + selectedLeague) }}</span>
          </div>
          <div v-if="selectedBookmaker" class="info-item">
            <strong>{{ $t('comparison.selectedBookmaker') }}:</strong>
            <span>{{ $t('bookmakers.' + selectedBookmaker) }}</span>
          </div>
          <div v-if="selectedLeague && selectedBookmaker" class="comparison-ready">
            <p>{{ $t('comparison.readyForComparison') }}</p>
          </div>
        </div>
      </div>

      <!-- 功能展示区域 -->
      <div class="features-section">
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-header">
              <span class="feature-icon">📊</span>
              <h4>{{ $t('comparison.feature1') }}</h4>
            </div>
            <p>{{ $t('comparison.feature1Desc') }}</p>
          </div>

          <div class="feature-card">
            <div class="feature-header">
              <span class="feature-icon">🔍</span>
              <h4>{{ $t('comparison.feature2') }}</h4>
            </div>
            <p>{{ $t('comparison.feature2Desc') }}</p>
          </div>

          <div class="feature-card">
            <div class="feature-header">
              <span class="feature-icon">📈</span>
              <h4>{{ $t('comparison.feature3') }}</h4>
            </div>
            <p>{{ $t('comparison.feature3Desc') }}</p>
          </div>

          <div class="feature-card">
            <div class="feature-header">
              <span class="feature-icon">💹</span>
              <h4>{{ $t('comparison.feature4') }}</h4>
            </div>
            <p>{{ $t('comparison.feature4Desc') }}</p>
          </div>
        </div>

        <!-- 即将推出提示 -->
        <div class="coming-soon-section">
          <div class="coming-soon-card">
            <span class="coming-soon-badge">{{ $t('comparison.comingSoon') }}</span>
            <p>{{ $t('comparison.comingSoonDesc') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { LeaguesStore } from '@/store/Leagues'

const selectedLeague = ref('')
const selectedBookmaker = ref('')
const leagues = ref([])

// 庄家数据
const bookmakers = ref([
  { id: 'bet365', name: 'Bet365' },
  { id: 'sbo', name: 'SBO' },
  { id: 'ibc', name: 'IBC' }
])

const league_store = LeaguesStore()
async function loadLeagues() {
  leagues.value = await league_store.fetch_leagues()
}

onMounted(loadLeagues)

const onLeagueChange = () => {
  console.log('Selected league for comparison:', selectedLeague.value)
}

const onBookmakerChange = () => {
  console.log('Selected bookmaker for comparison:', selectedBookmaker.value)
}
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

/* 表单区域 - 复用Markets组件的样式 */
.form-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dark .form-section {
  background: rgba(31, 41, 55, 0.95);
  border-color: rgba(75, 85, 99, 0.3);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.dark .form-group label {
  color: #f3f4f6;
}

.form-group select {
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  color: #333;
  transition: all 0.3s ease;
}

.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.dark .form-group select {
  background: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

/* 选择信息显示区域 */
.selection-info {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
  border-left: 4px solid #667eea;
}

.dark .selection-info {
  background: #1f2937;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 16px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item strong {
  color: #333;
  min-width: 80px;
}

.dark .info-item strong {
  color: #f3f4f6;
}

.info-item span {
  color: #666;
  font-weight: 500;
}

.dark .info-item span {
  color: #9ca3af;
}

.comparison-ready {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
}

.dark .comparison-ready {
  border-top-color: rgba(75, 85, 99, 0.3);
}

.comparison-ready p {
  color: #667eea;
  font-weight: 600;
  margin: 0;
  font-size: 16px;
}

/* 功能展示区域 */
.features-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dark .features-section {
  background: rgba(31, 41, 55, 0.95);
  border-color: rgba(75, 85, 99, 0.3);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.feature-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.dark .feature-card {
  background: #1f2937;
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.feature-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-card h4 {
  color: #333;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.dark .feature-card h4 {
  color: #f3f4f6;
}

.feature-card p {
  color: #666;
  margin: 0;
  line-height: 1.5;
  font-size: 14px;
}

.dark .feature-card p {
  color: #9ca3af;
}

/* 即将推出区域 */
.coming-soon-section {
  text-align: center;
}

.coming-soon-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 12px;
  padding: 30px;
  border: 2px dashed #667eea;
}

.dark .coming-soon-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
}

.coming-soon-badge {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 10px 24px;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 15px;
}

.coming-soon-card p {
  color: #666;
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
}

.dark .coming-soon-card p {
  color: #9ca3af;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .comparison-container {
    padding: 0 15px;
  }

  .form-section,
  .features-section {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .feature-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }

  .feature-card {
    padding: 20px;
  }

  .form-group select {
    max-width: 100%;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .info-item strong {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .comparison-content {
    gap: 20px;
  }

  .form-section,
  .features-section {
    padding: 15px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .feature-header {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .coming-soon-card {
    padding: 20px 15px;
  }
}
</style>