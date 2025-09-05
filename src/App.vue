<template>

  <div class="container">
    <div class="content">
    <div class="form-section">
      <div class="form-group">
        <label for="league">SELECT LEAGUE</label>
        <select id="league" v-model="selectedLeague" @change="onLeagueChange">
          <option value="">please select a league</option>
          <option v-for="oneleague in leagues" :key="oneleague.league"  :value="oneleague.league" >
            {{ oneleague.league }}
          </option>
        </select>
      </div>

      <div class="team-selection">
        <div class="form-group">
          <label for="homeTeam">HOME TEAM</label>
          <select id="homeTeam" v-model="selectedHomeTeam" :disabled="!selectedLeague">
            <option value="">please select home team</option>
            <option v-for="team in leagueteams" :key="team.home_team" :value="team.home_team">
              {{ team.home_team }}
            </option>
          </select>
        </div>

        <div class="vs-divider">VS</div>

        <div class="form-group">
          <label for="awayTeam">AWAY TEAM</label>
          <select id="awayTeam" v-model="selectedAwayTeam" :disabled="!selectedLeague">
            <option value="">please select away team</option>
            <option v-for="team in leagueteams" :key="team.home_team" :value="team.home_team">
              {{ team.home_team }}
            </option>
          </select>
        </div>
      </div>

      <button
        class="calculate-btn"
        @click="calculate"
        :disabled="!canCalculate"
      >
        RUN
      </button>
    </div>

    <div v-if="!calculationResult" class="placeholder-info">
      <div class="info-card">
        <h3>📊 Instructions</h3>
        <ul>
          <li>1 select one league</li>
          <li>2 select home team and away team</li>
          <li>3 click "run" to get result</li>
        </ul>
      </div>

    </div>

    <div v-if="calculationResult" class="result-section">
      <h3 class="result-title">计算结果</h3>

      <div class="match-info">
        <div style="text-align: center; color: #666;">
          {{ selectedLeague }}
        </div>
        <div class="teams">
          <span class="team">{{ selectedHomeTeam }}</span>
          <span class="vs">VS</span>
          <span class="team">{{ selectedAwayTeam }}</span>
        </div>

      </div>

      <div v-if="selectedHomeTeam === selectedAwayTeam" class="warning">
        ⚠️ Warning：home team and away team should be diff team！
      </div>

      <div class="result-content">

        <!-- 三行玩法显示 -->
        <div class="odds-display">
          <!-- 胜平负 -->
          <div class="odds-row">
            <div class="odds-label">1X2</div>
            <div class="odds-values">
              <span class="odds-value">{{ calculationResult.homeWinOdds }}</span>
              <span class="odds-value">&nbsp;&nbsp;</span>
              <span class="odds-value">{{ calculationResult.drawOdds }}</span>
              <span class="odds-value">&nbsp;&nbsp;</span>
              <span class="odds-value">{{ calculationResult.awayWinOdds }}</span>
            </div>
          </div>

          <!-- 亚洲盘 -->
          <div class="odds-row">
            <div class="odds-label">Asia Handicap</div>
            <div class="odds-values">
              <span class="odds-value">{{ calculationResult.homeHandicapOdds }}</span>
              <span class="odds-value">&nbsp;&nbsp;</span>
              <span class="odds-value handicap-line">{{ calculationResult.handicapLine }}</span>
              <span class="odds-value">&nbsp;&nbsp;</span>
              <span class="odds-value">{{ calculationResult.awayHandicapOdds }}</span>
            </div>
          </div>

          <!-- 大小球 -->
          <div class="odds-row">
            <div class="odds-label">Goal Line</div>
            <div class="odds-values">
              <span class="odds-value">{{ calculationResult.overOdds }}</span>
              <span class="odds-value">&nbsp;&nbsp;</span>
              <span class="odds-value total-line">{{ calculationResult.totalLine }}</span>
              <span class="odds-value">&nbsp;&nbsp;</span>
              <span class="odds-value">{{ calculationResult.underOdds }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
  </div>

</template>

<script setup>

import { ref, computed, onMounted, watch } from 'vue'

const selectedLeague = ref('')
const selectedHomeTeam = ref('')
const selectedAwayTeam = ref('')
const calculationResult = ref(null)
const leagues = ref([])
const leagueteams = ref([])
const markets = ref([])


import { LeaguesStore } from './store/Leagues'
const league_store = LeaguesStore()
async function loadLeagues() {
  leagues.value = await league_store.fetch_leagues()
}
onMounted(loadLeagues)
const onLeagueChange = () => {
  selectedHomeTeam.value = ''
  selectedAwayTeam.value = ''
  calculationResult.value = null
}


import { LeagueTeamsStore } from './store/LeagueTeams'
const leagueteam_store = LeagueTeamsStore()

async function loadLeagueteams(league) {
  leagueteams.value = await leagueteam_store.fetch_leagueteams({"league_name": selectedLeague.value})
}

watch(() => selectedLeague, loadLeagueteams, { deep: true })


import { MarketsStore } from './store/Markets'
const markets_store = MarketsStore()

const canCalculate = computed(() => {
  return selectedLeague.value && selectedHomeTeam.value && selectedAwayTeam.value
})
async function calculate(){
  if (!canCalculate.value) return

  console.log("home_team", selectedHomeTeam.value)
  console.log("away_team", selectedAwayTeam.value)
  markets.value = await markets_store.fetch_markets({"league": selectedLeague.value, home_team:selectedHomeTeam.value, away_team:selectedAwayTeam.value})
  console.log(markets.value)
  console.log(markets.value[0].league)
  console.log(markets.value[0].home_team)
  console.log(markets.value[0].away_team)
  // 胜平负赔率计算
  const homeWinOdds = (markets.value[0].win).toFixed(2)
  const drawOdds = (markets.value[0].draw).toFixed(2)
  const awayWinOdds = (markets.value[0].lose).toFixed(2)

  // 亚盘数据
  const homeHandicapOdds = (markets.value[0].home).toFixed(2)
  const handicapLine = (markets.value[0].handicap).toFixed(2) // -1.0 到 1.0
  const awayHandicapOdds = (markets.value[0].away).toFixed(2)

  // 大小球数据
  const overOdds = (markets.value[0].over).toFixed(2)
  const totalLine = (markets.value[0].overunder).toFixed(2) // 2.0 到 3.5
  const underOdds = (markets.value[0].under).toFixed(2)

  calculationResult.value = {

    // 胜平负赔率
    homeWinOdds,
    drawOdds,
    awayWinOdds,
    // 亚盘
    homeHandicapOdds,
    handicapLine,
    awayHandicapOdds,
    // 大小球
    overOdds,
    totalLine,
    underOdds,
    timestamp: new Date().toLocaleString('zh-CN')
  }
}



/* -- 语言切换 -- */
import { useI18n } from 'vue-i18n'
import { LanguageStore } from './store/LanguageStore'

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

/*  -- 主题状态 --  */
import { ThemeStore } from './store/ThemeStore'

const themeStore = ThemeStore()
themeStore.init()
const toggleTheme = themeStore.toggle

</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100%;
}

body {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
</style>
<style scoped>
.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  background: white;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  overflow: hidden;
  min-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

/* 电脑版适配 */
@media (min-width: 768px) {
  .container {
    max-width: 1200px;
  }

  .content {
    display: block;
  }
}

.header {
  background: linear-gradient(135deg, #2c5530 0%, #1a3a1f 100%);
  color: white;
  text-align: center;
  padding: 30px;
}

.header h1 {
  margin: 0;
  font-size: 2.5em;
  font-weight: bold;
}

.content {
  padding: 40px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 手机版布局 */
@media (max-width: 767px) {
  #app {
    padding: 10px;
    align-items: stretch;
  }

  .container {
    min-height: calc(100vh - 20px);
  }

  .content {
    padding: 20px;
  }

  .team-selection {
    display: block;
  }

  .vs-divider {
    display: none;
  }
}

/* 电脑版团队选择布局 */
@media (min-width: 768px) {
  .team-selection {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 20px;
    align-items: end;
    max-width: 100%;
  }

  .vs-divider {
    color: #ff6b6b;
    font-weight: bold;
    font-size: 1.8em;
    text-align: center;
    margin-bottom: 20px;
    min-width: 50px;
    flex-shrink: 0;
  }
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
  font-size: 1.1em;
}

select {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
  box-sizing: border-box;
  max-width: 100%;
}

select:focus {
  border-color: #667eea;
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.calculate-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  margin: 30px auto;
  min-width: 200px;
}

.calculate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(238, 90, 36, 0.3);
}

.calculate-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.result-section {
  margin-top: 40px;
  padding: 25px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
  border-radius: 12px;
  border-left: 5px solid #667eea;
}

.result-title {
  font-size: 1.5em;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

.result-content {
  font-size: 1.2em;
  color: #555;
  line-height: 1.8;
}

.match-info {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.teams {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
}

.team {
  font-weight: bold;
  font-size: 1.3em;
  color: #2c5530;
}

.vs {
  color: #ff6b6b;
  font-weight: bold;
  font-size: 1.5em;
}

.warning {
  background: #fff3cd;
  color: #856404;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ffeaa7;
  margin-bottom: 15px;
}

/* 信息卡片样式 */
.placeholder-info {
  margin-top: 30px;
}

.info-card {
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
  border-left: 5px solid #667eea;
}

.info-card h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 1.3em;
}

.info-card ul {
  margin: 0;
  padding-left: 20px;
}

.info-card li {
  margin-bottom: 8px;
  line-height: 1.5;
  color: #555;
}

/* 电脑版特殊样式 */
@media (min-width: 1024px) {
  .header h1 {
    font-size: 3em;
  }

  .form-group label {
    font-size: 1.2em;
  }

  select {
    font-size: 18px;
    padding: 15px 18px;
  }

  .calculate-btn {
    font-size: 20px;
    padding: 18px 40px;
    min-width: 250px;
  }
}

/* 中等屏幕尺寸优化 */
@media (min-width: 768px) and (max-width: 1023px) {
  select {
    font-size: 17px;
    padding: 14px 16px;
  }
}

</style>
