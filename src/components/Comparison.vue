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

      <!-- 赔率比较内容区域 -->
      <div v-if="selectedLeague && selectedBookmaker" class="odds-comparison-section">
        <div class="section-header">
          <h3>{{ $t('comparison.upcomingMatches') }}</h3>
          <p>{{ $t('comparison.bookmakerOdds', { bookmaker: $t('bookmakers.' + selectedBookmaker) }) }}</p>
        </div>

        <!-- 赛程列表 -->
        <div class="matches-list">
          <div v-for="match in upcomingMatches" :key="match.id" class="match-card">
            <!-- 比赛信息 -->
            <div class="match-info">
              <div class="match-time">
                <div class="date">{{ formatDate(match.date) }}</div>
                <div class="time">{{ match.time }}</div>
              </div>
              <div class="match-teams">
                <div class="team home-team">
                  <span class="team-name">{{ $t('teams.' + match.rawLeague + '["' + match.rawHomeTeam + '"]', match.rawHomeTeam) }}</span>
                </div>
                <div class="vs-separator">VS</div>
                <div class="team away-team">
                  <span class="team-name">{{ $t('teams.' + match.rawLeague + '["' + match.rawAwayTeam + '"]', match.rawAwayTeam) }}</span>
                </div>
              </div>
            </div>

            <!-- 赔率信息 -->
            <div class="odds-info">
              <!-- 庄家名称标签 -->
              <div class="bookmaker-label">
                <span class="label-tag">{{ $t('bookmakers.' + selectedBookmaker) }}</span>
              </div>

              <!-- 胜平负赔率 -->
              <div class="odds-group">
                <div class="market-header">
                  <span class="market-label">{{ $t('markets.marketType') }}</span>
                  <span class="market-name">{{ $t('bookmakers.' + selectedBookmaker) }}</span>
                </div>
                <div class="odds-row">
                  <div class="odd-item">
                    <span class="odd-label">{{ $t('markets.home') }}</span>
                    <div class="odd-values">
                      <span class="odd-value">{{ match.odds.winDrawWin.home }}</span>
                      <span class="model-odds" :title="$t('markets.modelOdds')">{{ (parseFloat(match.odds.winDrawWin.home) - 0.10).toFixed(2) }}</span>
                      <span class="margin-value" :title="$t('markets.margin')">{{ calculateMargin(match.odds.winDrawWin.home, (parseFloat(match.odds.winDrawWin.home) - 0.10).toFixed(2)) }}</span>
                    </div>
                  </div>
                  <div class="odd-item">
                    <span class="odd-label">{{ $t('markets.draw') }}</span>
                    <div class="odd-values">
                      <span class="odd-value">{{ match.odds.winDrawWin.draw }}</span>
                      <span class="model-odds" :title="$t('markets.modelOdds')">{{ (parseFloat(match.odds.winDrawWin.draw) - 0.05).toFixed(2) }}</span>
                      <span class="margin-value" :title="$t('markets.margin')">{{ calculateMargin(match.odds.winDrawWin.draw, (parseFloat(match.odds.winDrawWin.draw) - 0.05).toFixed(2)) }}</span>
                    </div>
                  </div>
                  <div class="odd-item">
                    <span class="odd-label">{{ $t('markets.away') }}</span>
                    <div class="odd-values">
                      <span class="odd-value">{{ match.odds.winDrawWin.away }}</span>
                      <span class="model-odds" :title="$t('markets.modelOdds')">{{ (parseFloat(match.odds.winDrawWin.away) + 0.10).toFixed(2) }}</span>
                      <span class="margin-value" :title="$t('markets.margin')">{{ calculateMargin(match.odds.winDrawWin.away, (parseFloat(match.odds.winDrawWin.away) + 0.10).toFixed(2)) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 盘口赔率 -->
              <div class="odds-group">
                <div class="market-header">
                  <span class="market-label">{{ $t('markets.marketType') }}</span>
                  <span class="market-name">{{ $t('bookmakers.' + selectedBookmaker) }}</span>
                </div>
                <div class="odds-row">
                  <div class="odd-item">
                    <span class="odd-label">{{ match.odds.handicap.homeTeam }}</span>
                    <div class="odd-values">
                      <span class="odd-value">{{ match.odds.handicap.homeOdds }}</span>
                      <span class="model-odds" :title="$t('markets.modelOdds')">{{ (parseFloat(match.odds.handicap.homeOdds) - 0.08).toFixed(2) }}</span>
                      <span class="margin-value" :title="$t('markets.margin')">{{ calculateMargin(match.odds.handicap.homeOdds, (parseFloat(match.odds.handicap.homeOdds) - 0.08).toFixed(2)) }}</span>
                    </div>
                  </div>
                  <div class="odd-item">
                    <span class="odd-label">{{ match.odds.handicap.awayTeam }}</span>
                    <div class="odd-values">
                      <span class="odd-value">{{ match.odds.handicap.awayOdds }}</span>
                      <span class="model-odds" :title="$t('markets.modelOdds')">{{ (parseFloat(match.odds.handicap.awayOdds) - 0.06).toFixed(2) }}</span>
                      <span class="margin-value" :title="$t('markets.margin')">{{ calculateMargin(match.odds.handicap.awayOdds, (parseFloat(match.odds.handicap.awayOdds) - 0.06).toFixed(2)) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 大小球赔率 -->
              <div class="odds-group">
                <div class="market-header">
                  <span class="market-label">{{ $t('markets.marketType') }}</span>
                  <span class="market-name">{{ $t('bookmakers.' + selectedBookmaker) }}</span>
                </div>
                <div class="odds-row">
                  <div class="odd-item">
                    <span class="odd-label">{{ $t('markets.over') }} {{ match.odds.goalLine.line }}</span>
                    <div class="odd-values">
                      <span class="odd-value">{{ match.odds.goalLine.overOdds }}</span>
                      <span class="model-odds" :title="$t('markets.modelOdds')">{{ (parseFloat(match.odds.goalLine.overOdds) - 0.04).toFixed(2) }}</span>
                      <span class="margin-value" :title="$t('markets.margin')">{{ calculateMargin(match.odds.goalLine.overOdds, (parseFloat(match.odds.goalLine.overOdds) - 0.04).toFixed(2)) }}</span>
                    </div>
                  </div>
                  <div class="odd-item">
                    <span class="odd-label">{{ $t('markets.under') }} {{ match.odds.goalLine.line }}</span>
                    <div class="odd-values">
                      <span class="odd-value">{{ match.odds.goalLine.underOdds }}</span>
                      <span class="model-odds" :title="$t('markets.modelOdds')">{{ (parseFloat(match.odds.goalLine.underOdds) - 0.03).toFixed(2) }}</span>
                      <span class="margin-value" :title="$t('markets.margin')">{{ calculateMargin(match.odds.goalLine.underOdds, (parseFloat(match.odds.goalLine.underOdds) - 0.03).toFixed(2)) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 未选择时的提示区域 -->
      <div v-else class="prompt-section">
        <div class="prompt-card">
          <div class="prompt-icon">🎯</div>
          <h3>{{ $t('comparison.selectPromptTitle') }}</h3>
          <p>{{ $t('comparison.selectPromptDesc') }}</p>
          <div class="prompt-steps">
            <div class="step">
              <span class="step-number">1</span>
              <span>{{ $t('comparison.step1') }}</span>
            </div>
            <div class="step">
              <span class="step-number">2</span>
              <span>{{ $t('comparison.step2') }}</span>
            </div>
            <div class="step">
              <span class="step-number">3</span>
              <span>{{ $t('comparison.step3') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { ScheduleStore } from '@/store/Schedule'
import { OddsStore } from '@/store/Odds'

const selectedLeague = ref('')
const selectedBookmaker = ref('')
const leagues = ref([])
const scheduleData = ref([])
const oddsData = ref({}) // 存储赔率数据

// Store 实例
const scheduleStore = ScheduleStore()
const oddsStore = OddsStore()

// 庄家数据
const bookmakers = ref([
  { id: 'bet365', name: 'Bet365' },
  { id: 'sbo', name: 'SBO' },
  { id: 'ibc', name: 'IBC' }
])


// 获取赛程数据
const loadScheduleData = async () => {
  if (selectedLeague.value) {
    scheduleData.value = await scheduleStore.fetchScheduleByLeague(selectedLeague.value)
  } else {
    scheduleData.value = await scheduleStore.fetchUpcomingSchedule(7) // 获取未来7天的赛程
  }
}

// 加载赔率数据
const loadOddsData = async () => {
  if (!selectedBookmaker.value || scheduleData.value.length === 0) {
    oddsData.value = {}
    return
  }

  const bookmakerId = oddsStore.getBookmakerId(selectedBookmaker.value)
  if (!bookmakerId) {
    console.error('Unknown bookmaker:', selectedBookmaker.value)
    oddsData.value = {}
    return
  }

  oddsData.value = await oddsStore.fetchOddsForMatches(scheduleData.value, bookmakerId)
}

// 监听联赛变化，重新加载赛程数据
watch(selectedLeague, loadScheduleData, { immediate: true })

// 监听庄家变化，重新加载赔率数据
watch(selectedBookmaker, loadOddsData, { immediate: true })

// 监听赛程数据变化，重新加载赔率数据
watch(scheduleData, loadOddsData, { immediate: true })

// 根据选择的联赛和庄家过滤数据
const upcomingMatches = computed(() => {
  if (!selectedLeague.value || !selectedBookmaker.value) {
    return []
  }

  // 过滤对应联赛的赛程数据
  let filteredMatches = scheduleData.value.filter(match =>
    match.league === selectedLeague.value
  )

  // 将 schedule 数据转换为组件需要的格式
  const formattedMatches = filteredMatches.map(match => {
    const matchTime = new Date(match.match_time)
    const realOdds = oddsData.value[match.match_id]

    return {
      id: match.match_id,
      date: matchTime.toISOString().split('T')[0], // 格式化为 YYYY-MM-DD
      time: matchTime.toTimeString().split(' ')[0].substring(0, 5), // 格式化为 HH:MM
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      league: match.league,
      // 保存原始数据用于国际化显示
      rawHomeTeam: match.home_team,
      rawAwayTeam: match.away_team,
      rawLeague: match.league,
      // 使用真实赔率数据，如果没有则使用示例赔率
      odds: realOdds ? oddsStore.formatOddsData(realOdds) : generateSampleOdds(match.home_team, match.away_team)
    }
  })

  // 按比赛时间排序
  const sortedMatches = formattedMatches.sort((a, b) => {
    const dateTimeA = new Date(`${a.date} ${a.time}`)
    const dateTimeB = new Date(`${b.date} ${b.time}`)
    return dateTimeA - dateTimeB
  })

  return sortedMatches
})

// 生成示例赔率数据（暂时使用，后续可以连接真实的赔率API）
function generateSampleOdds(homeTeam, awayTeam) {
  // 基于队伍名称生成随机赔率（保持一致性）
  const homeTeamHash = homeTeam.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const awayTeamHash = awayTeam.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const matchHash = homeTeamHash + awayTeamHash

  // 使用哈希值生成稳定的"随机"赔率
  const seed = matchHash % 100

  const baseHomeOdds = 1.5 + (seed % 50) / 100  // 1.50 - 2.00
  const baseDrawOdds = 3.0 + (seed % 60) / 100  // 3.00 - 3.60
  const baseAwayOdds = 2.5 + (seed % 70) / 100  // 2.50 - 3.20

  const handicapLine = ((seed % 11) - 5) / 2  // -2.5 到 2.5
  const goalLine = 2.0 + (seed % 8) / 4  // 2.0 到 3.75

  return {
    winDrawWin: {
      home: baseHomeOdds.toFixed(2),
      draw: baseDrawOdds.toFixed(2),
      away: baseAwayOdds.toFixed(2)
    },
    handicap: {
      homeTeam: handicapLine >= 0 ? `主队 +${handicapLine.toFixed(1)}` : `主队 ${handicapLine.toFixed(1)}`,
      homeOdds: (1.85 + (seed % 20) / 100).toFixed(2),
      awayTeam: handicapLine >= 0 ? `客队 -${handicapLine.toFixed(1)}` : `客队 +${Math.abs(handicapLine).toFixed(1)}`,
      awayOdds: (1.85 + (seed % 20) / 100).toFixed(2)
    },
    goalLine: {
      line: goalLine.toFixed(1),
      overOdds: (1.80 + (seed % 25) / 100).toFixed(2),
      underOdds: (1.95 + (seed % 25) / 100).toFixed(2)
    }
  }
}


// 加载未来赛程中的联赛数据
async function loadLeagues() {
  leagues.value = await scheduleStore.fetchUpcomingLeagues(30) // 获取未来30天内的联赛
}

// 组件挂载时加载联赛和赛程数据
onMounted(async () => {
  await loadLeagues()
  await loadScheduleData()
})

const onLeagueChange = () => {
  console.log('Selected league for comparison:', selectedLeague.value)
  // 赛程数据会通过 watch 自动加载
}

const onBookmakerChange = () => {
  console.log('Selected bookmaker for comparison:', selectedBookmaker.value)
}

// 日期格式化函数
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

// 计算margin值
const calculateMargin = (bookmakerOdds, modelOdds) => {
  const margin = parseFloat(bookmakerOdds) / parseFloat(modelOdds)
  // margin值通常小于等于1，当大于1时显示出来，否则显示"-"
  return margin > 1.0 ? margin.toFixed(2) : '-'
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

/* 赔率比较内容区域 */
.odds-comparison-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dark .odds-comparison-section {
  background: rgba(31, 41, 55, 0.95);
  border-color: rgba(75, 85, 99, 0.3);
}

.section-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .section-header {
  border-bottom-color: rgba(75, 85, 99, 0.3);
}

.section-header h3 {
  color: #333;
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 700;
}

.dark .section-header h3 {
  color: #f3f4f6;
}

.section-header p {
  color: #666;
  margin: 0;
  font-size: 16px;
}

.dark .section-header p {
  color: #9ca3af;
}

/* 赛程列表 */
.matches-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.match-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.match-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.12);
  border-color: rgba(102, 126, 234, 0.3);
}

.dark .match-card {
  background: #1f2937;
  border-color: rgba(75, 85, 99, 0.3);
}

/* 比赛信息 */
.match-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .match-info {
  border-bottom-color: rgba(75, 85, 99, 0.3);
}

.match-time {
  text-align: left;
}

.match-time .date {
  color: #667eea;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 5px;
}

.match-time .time {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.dark .match-time .time {
  color: #9ca3af;
}

.match-teams {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
  margin: 0 30px;
}

.team {
  flex: 1;
  text-align: center;
}

.team-name {
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.dark .team-name {
  color: #f3f4f6;
}

.vs-separator {
  color: #999;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
}

/* 赔率信息 */
.odds-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

/* 庄家标签 */
.bookmaker-label {
  grid-column: 1 / -1;
  text-align: center;
  margin-bottom: 15px;
}

.label-tag {
  display: inline-block;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.dark .label-tag {
  background: linear-gradient(135deg, #8b9dc3, #a78bda);
  box-shadow: 0 4px 15px rgba(139, 157, 195, 0.3);
}

.odds-group {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.dark .odds-group {
  background: #374151;
  border-color: rgba(75, 85, 99, 0.3);
}

/* 玩法标签头部 */
.market-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .market-header {
  border-bottom-color: rgba(75, 85, 99, 0.3);
}

.market-label {
  color: #667eea;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
}

.dark .market-label {
  color: #8b9dc3;
  background: rgba(139, 157, 195, 0.1);
}

.market-name {
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.dark .market-name {
  color: #f3f4f6;
}

.odds-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.odd-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.odd-values {
  display: flex;
  align-items: center;
  gap: 8px;
}

.odd-item:hover {
  background: #e9ecef;
}

.dark .odd-item {
  background: #1f2937;
}

.dark .odd-item:hover {
  background: #374151;
}

.odd-label {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.dark .odd-label {
  color: #9ca3af;
}

.odd-value {
  color: #333;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea, #764ba2);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dark .odd-value {
  background: linear-gradient(135deg, #8b9dc3, #a78bda);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.model-odds {
  color: #28a745;
  font-size: 13px;
  font-weight: 600;
  background: linear-gradient(135deg, #28a745, #20c997);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  cursor: help;
  border-bottom: 1px dashed rgba(40, 167, 69, 0.3);
  padding-bottom: 1px;
}

.dark .model-odds {
  background: linear-gradient(135deg, #48bb78, #38b2ac);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  border-bottom-color: rgba(72, 187, 120, 0.3);
}

.margin-value {
  color: #ff6b6b;
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, #ff6b6b, #ffa94d);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  cursor: help;
  border-bottom: 1px dashed rgba(255, 107, 107, 0.3);
  padding-bottom: 1px;
  min-width: 20px;
  text-align: center;
}

.dark .margin-value {
  background: linear-gradient(135deg, #fa5252, #fd7e14);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  border-bottom-color: rgba(250, 82, 82, 0.3);
}

/* 提示区域 */
.prompt-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.prompt-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-align: center;
  max-width: 450px;
}

.dark .prompt-card {
  background: rgba(31, 41, 55, 0.95);
  border-color: rgba(75, 85, 99, 0.3);
}

.prompt-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.prompt-card h3 {
  color: #333;
  margin: 0 0 15px 0;
  font-size: 22px;
  font-weight: 700;
}

.dark .prompt-card h3 {
  color: #f3f4f6;
}

.prompt-card p {
  color: #666;
  margin: 0 0 30px 0;
  font-size: 16px;
  line-height: 1.6;
}

.dark .prompt-card p {
  color: #9ca3af;
}

.prompt-steps {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.step {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 10px;
  text-align: left;
}

.dark .step {
  background: #1f2937;
}

.step-number {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.step span:last-child {
  color: #333;
  font-size: 15px;
  font-weight: 500;
}

.dark .step span:last-child {
  color: #f3f4f6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .comparison-container {
    padding: 0 15px;
  }

  .form-section,
  .odds-comparison-section {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .match-info {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .match-teams {
    margin: 0;
    gap: 10px;
  }

  .vs-separator {
    padding: 6px 10px;
    font-size: 12px;
  }

  .odds-info {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .odds-group {
    padding: 15px;
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

  .section-header h3 {
    font-size: 20px;
  }

  .section-header p {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .comparison-content {
    gap: 20px;
  }

  .form-section,
  .odds-comparison-section {
    padding: 15px;
  }

  .match-card {
    padding: 20px 15px;
  }

  .match-teams {
    flex-direction: column;
    gap: 8px;
  }

  .team-name {
    font-size: 15px;
  }

  .vs-separator {
    font-size: 11px;
    padding: 4px 8px;
  }

  .odds-group {
    padding: 12px;
  }

  .odds-title {
    font-size: 14px;
    margin-bottom: 12px;
  }

  .odd-item {
    padding: 6px 10px;
  }

  .odd-label {
    font-size: 13px;
  }

  .odd-value {
    font-size: 14px;
  }

  .prompt-card {
    padding: 30px 20px;
  }

  .prompt-card h3 {
    font-size: 18px;
  }

  .prompt-card p {
    font-size: 14px;
  }

  .step {
    padding: 12px 15px;
  }

  .step-number {
    width: 25px;
    height: 25px;
    font-size: 12px;
  }

  .step span:last-child {
    font-size: 14px;
  }
}
</style>