<template>
  <div class="markets-container">
    <div class="markets-content">
      <!-- 上边表单区域 -->
      <div class="form-section">
        <div class="form-group">
          <label for="league">{{$t("markets.LEAGUE")}}</label>
          <select id="league" v-model="selectedLeague" @change="onLeagueChange">
            <option value="">{{$t("markets.SELECT LEAGUE")}}</option>
            <option v-for="oneleague in leagues" :key="oneleague.league" :value="oneleague.league">
              {{ $t('league.' + oneleague.league)}}
            </option>
          </select>
        </div>

        <div class="team-selection">
          <div class="form-group">
            <label for="homeTeam">{{$t("markets.HOME TEAM")}}</label>
            <select id="homeTeam" v-model="selectedHomeTeam" :disabled="!selectedLeague">
              <option value="">{{$t("markets.SELECT HOME TEAM")}}</option>
              <option v-for="team in leagueteams" :key="team.home_team" :value="team.home_team">
                {{ $t('teams.' + selectedLeague + '["' + team.home_team + '"]') }}
              </option>
            </select>
          </div>

          <div class="vs-divider">VS</div>

          <div class="form-group">
            <label for="awayTeam">{{$t("markets.AWAY TEAM")}}</label>
            <select id="awayTeam" v-model="selectedAwayTeam" :disabled="!selectedLeague">
              <option value="">{{$t("markets.SELECT AWAY TEAM")}}</option>
              <option v-for="team in leagueteams" :key="team.home_team" :value="team.home_team">
                {{ $t('teams.' + selectedLeague + '["' + team.home_team + '"]') }}
              </option>
            </select>
          </div>
        </div>

        <button
          class="calculate-btn"
          @click="calculate"
          :disabled="!canCalculate"
        >
          {{$t("markets.RUN")}}
        </button>
      </div>

      <!-- 下边结果区域 -->
      <div class="results-section">
        <div v-if="!calculationResult" class="placeholder-info">
          <div class="info-card">
            <h3>📊 {{$t("markets.Instructions")}}</h3>
            <ul>
              <li>{{$t("markets.STEP1")}}</li>
              <li>{{$t("markets.STEP2")}}</li>
              <li>{{$t("markets.STEP3")}}</li>
            </ul>
          </div>
        </div>

        <div v-if="calculationResult" class="result-section">
          <div class="match-info">
            <div class="league-name">{{ $t('league.' + selectedLeague) }}</div>
            <div class="teams">
              <span class="team">{{ $t('teams.' + selectedLeague + '["' + selectedHomeTeam + '"]') }}</span>
              <span class="vs">VS</span>
              <span class="team">{{ $t('teams.' + selectedLeague + '["' + selectedAwayTeam + '"]') }}</span>
            </div>

          </div>

          <div v-if="selectedHomeTeam === selectedAwayTeam" class="warning">
            ⚠️ {{$t('markets.Warning')}}
          </div>

          <div v-if="calculationResult" class="result-content">

            <!-- 赔率显示 -->
            <div class="odds-display">
              <!-- 胜平负 -->
              <div class="odds-row">
                <div class="odds-label">{{$t('markets.1X2')}}</div>
                <div class="odds-values">
                  <span class="odds-value home">{{ calculationResult.homeWinOdds }}</span>
                  <span class="odds-value draw">{{ calculationResult.drawOdds }}</span>
                  <span class="odds-value away">{{ calculationResult.awayWinOdds }}</span>
                </div>
              </div>

              <!-- 亚洲盘 -->
              <div class="odds-row">
                <div class="odds-label">{{ $t('markets.Asia Handicap') }}</div>
                <div class="odds-values">
                  <span class="odds-value">{{ calculationResult.homeHandicapOdds }}</span>
                  <span class="odds-value handicap-line">{{ calculationResult.handicapLine }}</span>
                  <span class="odds-value">{{ calculationResult.awayHandicapOdds }}</span>
                </div>
              </div>

              <!-- 大小球 -->
              <div class="odds-row">
                <div class="odds-label">{{ $t('markets.Goal Line') }}</div>
                <div class="odds-values">
                  <span class="odds-value">{{ calculationResult.overOdds }}</span>
                  <span class="odds-value total-line">{{ calculationResult.totalLine }}</span>
                  <span class="odds-value">{{ calculationResult.underOdds }}</span>
                </div>
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


import { LeaguesStore } from '@/store/Leagues'
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


import { LeagueTeamsStore } from '@/store/LeagueTeams'
const leagueteam_store = LeagueTeamsStore()

async function loadLeagueteams(league) {
  leagueteams.value = await leagueteam_store.fetch_leagueteams({"league_name": selectedLeague.value})
}

watch(() => selectedLeague, loadLeagueteams, { deep: true })


import { MarketsStore } from '@/store/Markets'
import {Converter} from "@/store/Odds.js";
const markets_store = MarketsStore()

const canCalculate = computed(() => {
  const flag = selectedLeague.value && selectedHomeTeam.value && selectedAwayTeam.value && (selectedAwayTeam.value != selectedHomeTeam.value)
  if (!flag){
    calculationResult.value = null
  }
  return flag

})
async function calculate(){

  //if (!canCalculate.value) return

  markets.value = await markets_store.fetch_xgs({"league": selectedLeague.value, home_team:selectedHomeTeam.value, away_team:selectedAwayTeam.value})

  const converter = new Converter([markets.value[0].xg1, markets.value[0].xg2])
  // 计算三种玩法的赔率
  const euroOdds = converter.getEuroOdds()        // 欧洲赔率（平局）
  const asianOdds = converter.getAsianOdds() // 亚洲盘口（使用真实的盘口线）
  const totalOdds = converter.getTotalOdds()   // 大小球（使用真实的大小球线）


  // 胜平负赔率计算
  const homeWinOdds = (euroOdds[0]).toFixed(2)
  const drawOdds = (euroOdds[1]).toFixed(2)
  const awayWinOdds = (euroOdds[2]).toFixed(2)

  // 亚盘数据
  const homeHandicapOdds = (asianOdds[1]).toFixed(2)
  const handicapLine = (asianOdds[0]).toFixed(2)
  const awayHandicapOdds = (asianOdds[2]).toFixed(2)

  // 大小球数据
  const overOdds = (totalOdds[1]).toFixed(2)
  const totalLine = (totalOdds[0]).toFixed(2)
  const underOdds = (totalOdds[2]).toFixed(2)

  const update_time = new Date(markets.value[0].update_time).toLocaleString()


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
    update_time
  }

}


</script>

<style scoped>
.markets-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.markets-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
  min-height: 70vh;
}

/* 表单区域 */
.form-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  height: fit-content;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dark .form-section {
  background: rgba(31, 41, 55, 0.95);
  border-color: rgba(75, 85, 99, 0.3);
}

.form-group {
  margin-bottom: 25px;
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

.form-group select:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.dark .form-group select {
  background: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.dark .form-group select:disabled {
  background: #1f2937;
  color: #6b7280;
}

/* 队伍选择区域 */
.team-selection {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 15px;
  align-items: end;
  margin: 30px 0;
}

.vs-divider {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 12px 16px;
  border-radius: 25px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 25px;
  font-size: 14px;
}

.calculate-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.calculate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.calculate-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* 结果区域 */
.results-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dark .results-section {
  background: rgba(31, 41, 55, 0.95);
  border-color: rgba(75, 85, 99, 0.3);
}

.placeholder-info {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.info-card {
  text-align: center;
}

.info-card h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
}

.dark .info-card h3 {
  color: #f3f4f6;
}

.info-card ul {
  list-style: none;
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
}

.info-card li {
  padding: 10px 0;
  color: #666;
  font-size: 16px;
}

.dark .info-card li {
  color: #9ca3af;
}

/* 比赛信息 */
.match-info {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.dark .match-info {
  background: #1f2937;
}

.league-name {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.dark .league-name {
  color: #9ca3af;
}

.teams {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.team {
  font-weight: bold;
  font-size: 18px;
  color: #333;
}

.dark .team {
  color: #f3f4f6;
}

.vs {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
}

.open-time {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.dark .open-time {
  color: #9ca3af;
}

.open-time {
  display: flex;
  justify-content: flex-end; /* 将子元素整体推到右侧 */
}

.warning {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.dark .warning {
  background: #451a03;
  border-color: #92400e;
  color: #fbbf24;
}

/* 赔率显示 */
.odds-display {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.odds-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 20px;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.dark .odds-row {
  background: #1f2937;
}

.odds-label {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.dark .odds-label {
  color: #f3f4f6;
}

.odds-values {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.odds-value {
  background: #667eea;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: bold;
  min-width: 60px;
  text-align: center;
  font-size: 14px;
}

.odds-value.handicap-line,
.odds-value.total-line {
  background: #28a745;
}

.odds-value.home {
  background: #dc3545;
}

.odds-value.draw {
  background: #ffc107;
  color: #212529;
}

.odds-value.away {
  background: #007bff;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .markets-content {
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .markets-container {
    padding: 0 15px;
  }

  .form-section,
  .results-section {
    padding: 20px;
  }

  .odds-row {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 15px;
  }

  .teams {
    gap: 15px;
  }

  .team {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .form-section,
  .results-section {
    padding: 15px;
  }

  .odds-values {
    flex-direction: column;
    align-items: stretch;
  }

  .odds-value {
    min-width: auto;
  }
}
</style>