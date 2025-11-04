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
                  <span class="team-name">{{ match.homeTeam }}</span>
                </div>
                <div class="vs-separator">VS</div>
                <div class="team away-team">
                  <span class="team-name">{{ match.awayTeam }}</span>
                </div>
              </div>
            </div>

            <!-- 赔率信息 -->
            <div class="odds-info">
              <!-- 胜平负赔率 -->
              <div class="odds-group">
                <h4 class="odds-title">{{ $t('markets.winDrawWin') }}</h4>
                <div class="odds-row">
                  <div class="odd-item">
                    <span class="odd-label">{{ $t('markets.home') }}</span>
                    <span class="odd-value">{{ match.odds.winDrawWin.home }}</span>
                  </div>
                  <div class="odd-item">
                    <span class="odd-label">{{ $t('markets.draw') }}</span>
                    <span class="odd-value">{{ match.odds.winDrawWin.draw }}</span>
                  </div>
                  <div class="odd-item">
                    <span class="odd-label">{{ $t('markets.away') }}</span>
                    <span class="odd-value">{{ match.odds.winDrawWin.away }}</span>
                  </div>
                </div>
              </div>

              <!-- 盘口赔率 -->
              <div class="odds-group">
                <h4 class="odds-title">{{ $t('markets.handicap') }}</h4>
                <div class="odds-row">
                  <div class="odd-item">
                    <span class="odd-label">{{ match.odds.handicap.homeTeam }}</span>
                    <span class="odd-value">{{ match.odds.handicap.homeOdds }}</span>
                  </div>
                  <div class="odd-item">
                    <span class="odd-label">{{ match.odds.handicap.awayTeam }}</span>
                    <span class="odd-value">{{ match.odds.handicap.awayOdds }}</span>
                  </div>
                </div>
              </div>

              <!-- 大小球赔率 -->
              <div class="odds-group">
                <h4 class="odds-title">{{ $t('markets.goalLine') }}</h4>
                <div class="odds-row">
                  <div class="odd-item">
                    <span class="odd-label">{{ $t('markets.over') }} {{ match.odds.goalLine.line }}</span>
                    <span class="odd-value">{{ match.odds.goalLine.overOdds }}</span>
                  </div>
                  <div class="odd-item">
                    <span class="odd-label">{{ $t('markets.under') }} {{ match.odds.goalLine.line }}</span>
                    <span class="odd-value">{{ match.odds.goalLine.underOdds }}</span>
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
import { ref, onMounted, computed } from 'vue'
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

// 联赛名称映射 - 支持中英文
const leagueNameMapping = {
  'English Premier League': '英超',
  'Spain Primera Liga': '西甲',
  'Germany Bundesliga': '德甲',
  'Italy Serie A': '意甲',
  '英超': '英超',
  '西甲': '西甲',
  '德甲': '德甲',
  '意甲': '意甲'
}

// 假数据 - 未来赛程和赔率
const mockMatchesData = {
  '英超': [
    {
      id: 1,
      date: '2024-11-09',
      time: '20:00',
      homeTeam: '曼城',
      awayTeam: '利物浦',
      odds: {
        winDrawWin: { home: '1.85', draw: '3.60', away: '4.20' },
        handicap: { homeTeam: '曼城 -0.5', homeOdds: '1.95', awayTeam: '利物浦 +0.5', awayOdds: '1.85' },
        goalLine: { line: '2.5', overOdds: '1.80', underOdds: '2.00' }
      }
    },
    {
      id: 2,
      date: '2024-11-10',
      time: '22:00',
      homeTeam: '阿森纳',
      awayTeam: '切尔西',
      odds: {
        winDrawWin: { home: '2.10', draw: '3.40', away: '3.20' },
        handicap: { homeTeam: '阿森纳 0', homeOdds: '1.90', awayTeam: '切尔西 0', awayOdds: '1.90' },
        goalLine: { line: '2.5', overOdds: '1.75', underOdds: '2.05' }
      }
    },
    {
      id: 3,
      date: '2024-11-11',
      time: '01:30',
      homeTeam: '曼联',
      awayTeam: '热刺',
      odds: {
        winDrawWin: { home: '2.05', draw: '3.50', away: '3.30' },
        handicap: { homeTeam: '曼联 0', homeOdds: '1.88', awayTeam: '热刺 0', awayOdds: '1.92' },
        goalLine: { line: '2.75', overOdds: '1.82', underOdds: '1.98' }
      }
    }
  ],
  '西甲': [
    {
      id: 4,
      date: '2024-11-09',
      time: '23:00',
      homeTeam: '皇家马德里',
      awayTeam: '巴塞罗那',
      odds: {
        winDrawWin: { home: '1.75', draw: '3.80', away: '4.50' },
        handicap: { homeTeam: '皇马 -0.75', homeOdds: '2.00', awayTeam: '巴萨 +0.75', awayOdds: '1.80' },
        goalLine: { line: '3.0', overOdds: '1.85', underOdds: '1.95' }
      }
    },
    {
      id: 5,
      date: '2024-11-10',
      time: '03:00',
      homeTeam: '马德里竞技',
      awayTeam: '塞维利亚',
      odds: {
        winDrawWin: { home: '1.65', draw: '3.60', away: '5.20' },
        handicap: { homeTeam: '马竞 -1.0', homeOdds: '2.05', awayTeam: '塞维利亚 +1.0', awayOdds: '1.75' },
        goalLine: { line: '2.25', overOdds: '1.78', underOdds: '2.02' }
      }
    }
  ],
  '德甲': [
    {
      id: 6,
      date: '2024-11-09',
      time: '22:30',
      homeTeam: '拜仁慕尼黑',
      awayTeam: '多特蒙德',
      odds: {
        winDrawWin: { home: '1.55', draw: '4.20', away: '5.80' },
        handicap: { homeTeam: '拜仁 -1.25', homeOdds: '2.10', awayTeam: '多特 +1.25', awayOdds: '1.70' },
        goalLine: { line: '3.5', overOdds: '1.92', underOdds: '1.88' }
      }
    },
    {
      id: 7,
      date: '2024-11-10',
      time: '01:00',
      homeTeam: '勒沃库森',
      awayTeam: 'RB莱比锡',
      odds: {
        winDrawWin: { home: '1.95', draw: '3.70', away: '3.60' },
        handicap: { homeTeam: '药厂 -0.5', homeOdds: '1.93', awayTeam: '莱比锡 +0.5', awayOdds: '1.87' },
        goalLine: { line: '3.0', overOdds: '1.88', underOdds: '1.92' }
      }
    }
  ],
  '意甲': [
    {
      id: 8,
      date: '2024-11-09',
      time: '19:30',
      homeTeam: '尤文图斯',
      awayTeam: 'AC米兰',
      odds: {
        winDrawWin: { home: '1.95', draw: '3.40', away: '3.80' },
        handicap: { homeTeam: '尤文图斯 -0.25', homeOdds: '1.88', awayTeam: 'AC米兰 +0.25', awayOdds: '1.92' },
        goalLine: { line: '2.25', overOdds: '1.85', underOdds: '1.95' }
      }
    },
    {
      id: 9,
      date: '2024-11-09',
      time: '21:45',
      homeTeam: '国际米兰',
      awayTeam: '罗马',
      odds: {
        winDrawWin: { home: '1.75', draw: '3.60', away: '4.50' },
        handicap: { homeTeam: '国米 -0.75', homeOdds: '2.00', awayTeam: '罗马 +0.75', awayOdds: '1.80' },
        goalLine: { line: '2.5', overOdds: '1.82', underOdds: '1.98' }
      }
    },
    {
      id: 10,
      date: '2024-11-10',
      time: '01:00',
      homeTeam: '那不勒斯',
      awayTeam: '佛罗伦萨',
      odds: {
        winDrawWin: { home: '1.80', draw: '3.50', away: '4.20' },
        handicap: { homeTeam: '那不勒斯 -0.5', homeOdds: '1.93', awayTeam: '佛罗伦萨 +0.5', awayOdds: '1.87' },
        goalLine: { line: '2.75', overOdds: '1.78', underOdds: '2.02' }
      }
    }
  ]
}

// 根据选择的联赛和庄家过滤数据
const upcomingMatches = computed(() => {
  if (!selectedLeague.value || !selectedBookmaker.value) {
    return []
  }

  // 使用联赛名称映射来获取正确的中文键名
  const mappedLeagueName = leagueNameMapping[selectedLeague.value] || selectedLeague.value
  console.log("mappedLeagueName: ", mappedLeagueName)
  const leagueMatches = mockMatchesData[mappedLeagueName] || []
  console.log("leagueMatches: ", leagueMatches)

  // 按比赛时间排序（日期+时间）
  const sortedMatches = leagueMatches.sort((a, b) => {
    const dateTimeA = new Date(`${a.date} ${a.time}`)
    const dateTimeB = new Date(`${b.date} ${b.time}`)
    return dateTimeA - dateTimeB
  })

  // 根据不同庄家调整赔率（模拟庄家赔率差异）
  return sortedMatches.map(match => {
    const adjustedMatch = { ...match }

    if (selectedBookmaker.value === 'bet365') {
      // Bet365 赔率调整
      adjustedMatch.odds = adjustOddsForBookmaker(match.odds, 'bet365')
    } else if (selectedBookmaker.value === 'sbo') {
      // SBO 赔率调整
      adjustedMatch.odds = adjustOddsForBookmaker(match.odds, 'sbo')
    } else if (selectedBookmaker.value === 'ibc') {
      // IBC 赔率调整
      adjustedMatch.odds = adjustOddsForBookmaker(match.odds, 'ibc')
    }

    return adjustedMatch
  })
})

// 根据庄家调整赔率的函数
function adjustOddsForBookmaker(originalOdds, bookmakerId) {
  const adjustedOdds = JSON.parse(JSON.stringify(originalOdds))

  if (bookmakerId === 'bet365') {
    // Bet365 通常给出稍高的赔率
    adjustedOdds.winDrawWin.home = (parseFloat(originalOdds.winDrawWin.home) + 0.05).toFixed(2)
    adjustedOdds.winDrawWin.away = (parseFloat(originalOdds.winDrawWin.away) + 0.10).toFixed(2)
  } else if (bookmakerId === 'sbo') {
    // SBO 专注于亚洲盘口
    adjustedOdds.handicap.homeOdds = (parseFloat(originalOdds.handicap.homeOdds) + 0.02).toFixed(2)
    adjustedOdds.handicap.awayOdds = (parseFloat(originalOdds.handicap.awayOdds) - 0.02).toFixed(2)
  } else if (bookmakerId === 'ibc') {
    // IBC 大小球赔率较好
    adjustedOdds.goalLine.overOdds = (parseFloat(originalOdds.goalLine.overOdds) + 0.03).toFixed(2)
    adjustedOdds.goalLine.underOdds = (parseFloat(originalOdds.goalLine.underOdds) + 0.02).toFixed(2)
  }

  return adjustedOdds
}

const league_store = LeaguesStore()
async function loadLeagues() {
  leagues.value = await league_store.fetch_leagues()
}

onMounted(loadLeagues)

const onLeagueChange = () => {
  console.log('Selected league for comparison:', selectedLeague.value)
  // 调试信息：检查联赛映射
  const mappedName = leagueNameMapping[selectedLeague.value] || selectedLeague.value
  console.log('Mapped league name:', mappedName)
  console.log('Available matches:', mockMatchesData[mappedName]?.length || 0)
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

.odds-title {
  color: #333;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 15px 0;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .odds-title {
  color: #f3f4f6;
  border-bottom-color: rgba(75, 85, 99, 0.3);
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