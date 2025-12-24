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
                {{ $t("bookmakers." + bookmaker.name) }}
              </option>
            </select>
          </div>
        </div>

  
        <!-- 确定按钮 -->
        <div class="action-section">
          
          <button
            class="fetch-data-btn"
            @click="fetchComparisonData"
            :disabled="isLoading || !selectedLeague || !selectedBookmaker"
          >
            <span v-if="!isLoading">{{ $t('comparison.fetchData') }}</span>
            <span v-else>{{ $t('comparison.loading') }}...</span>
          </button>
        </div>
      </div>

      <!-- 赔率比较内容区域 -->
      <div v-if="selectedLeague && selectedBookmaker && hasData" class="odds-comparison-section">
        <!-- 赛程列表 -->
        <div class="matches-list">
          <div v-for="match in upcomingMatches" :key="match.id" class="match-card">
            <!-- 比赛信息 -->
            <div class="match-info">
              <div class="match-time">
                {{ formatDate(match.dateTime) }}
              </div>
              <div class="match-teams">
                <div class="team home-team">
                  <span class="team-name">{{ getTeamName(match.rawLeague, match.rawHomeTeam) }}</span>
                </div>
                <div class="vs-separator">VS</div>
                <div class="team away-team">
                  <span class="team-name">{{ getTeamName(match.rawLeague, match.rawAwayTeam) }}</span>
                </div>
              </div>
            </div>

            <!-- 赔率信息 -->
            <div class="odds-info">

              <!-- 胜平负赔率 -->
              <div class="odds-group">
                <div class="market-header">
                  <span class="market-label">{{ $t('markets.marketType1x2') }}</span>
                </div>
                <div class="odds-row">
                  <div class="odd-item">
                    <span class="odd-label">{{ $t('markets.home') }}</span>
                    <div class="odd-values">
                      <span class="odd-value">{{ match.odds.winDrawWin.home }}</span>
                      <span class="model-odds" :title="$t('markets.modelOdds')" v-if="match.modelOdds">{{ match.modelOdds.winDrawWin.home }}</span>
                      <span class="margin-value" :title="$t('markets.margin')" v-if="match.modelOdds">{{ calculateMargin(match.odds.winDrawWin.home, match.modelOdds.winDrawWin.home) }}</span>
                    </div>
                  </div>
                  <div class="odd-item">
                    <span class="odd-label">{{ $t('markets.draw') }}</span>
                    <div class="odd-values">
                      <span class="odd-value">{{ match.odds.winDrawWin.draw }}</span>
                      <span class="model-odds" :title="$t('markets.modelOdds')" v-if="match.modelOdds">{{ match.modelOdds.winDrawWin.draw }}</span>
                      <span class="margin-value" :title="$t('markets.margin')" v-if="match.modelOdds">{{ calculateMargin(match.odds.winDrawWin.draw, match.modelOdds.winDrawWin.draw) }}</span>
                    </div>
                  </div>
                  <div class="odd-item">
                    <span class="odd-label">{{ $t('markets.away') }}</span>
                    <div class="odd-values">
                      <span class="odd-value">{{ match.odds.winDrawWin.away }}</span>
                      <span class="model-odds" :title="$t('markets.modelOdds')" v-if="match.modelOdds">{{ match.modelOdds.winDrawWin.away }}</span>
                      <span class="margin-value" :title="$t('markets.margin')" v-if="match.modelOdds">{{ calculateMargin(match.odds.winDrawWin.away, match.modelOdds.winDrawWin.away) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 盘口赔率 -->
              <div class="odds-group">
                <div class="market-header">
                  <span class="market-label">{{ $t('markets.marketTypeHandicap') }}</span>
                </div>
                <div class="odds-row">
                  <div class="odd-item">
                    <span class="odd-label">{{ match.odds.handicap.homeTeam }}</span>
                    <div class="odd-values">
                      <span class="odd-value">{{ match.odds.handicap.homeOdds }}</span>
                      <span class="model-odds" :title="$t('markets.modelOdds')" v-if="match.modelOdds">{{ match.modelOdds.handicap.homeOdds }}</span>
                      <span class="margin-value" :title="$t('markets.margin')" v-if="match.modelOdds">{{ calculateMargin(match.odds.handicap.homeOdds, match.modelOdds.handicap.homeOdds) }}</span>
                    </div>
                  </div>
                  <div class="odd-item">
                    <span class="odd-label">{{ match.odds.handicap.awayTeam }}</span>
                    <div class="odd-values">
                      <span class="odd-value">{{ match.odds.handicap.awayOdds }}</span>
                      <span class="model-odds" :title="$t('markets.modelOdds')" v-if="match.modelOdds">{{ match.modelOdds.handicap.awayOdds }}</span>
                      <span class="margin-value" :title="$t('markets.margin')" v-if="match.modelOdds">{{ calculateMargin(match.odds.handicap.awayOdds, match.modelOdds.handicap.awayOdds) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 大小球赔率 -->
              <div class="odds-group">
                <div class="market-header">
                  <span class="market-label">{{ $t('markets.marketTypeOverunder') }}</span>
                </div>
                <div class="odds-row">
                  <div class="odd-item">
                    <span class="odd-label">{{ $t('markets.over') }} {{ match.odds.goalLine.line }}</span>
                    <div class="odd-values">
                      <span class="odd-value">{{ match.odds.goalLine.overOdds }}</span>
                      <span class="model-odds" :title="$t('markets.modelOdds')" v-if="match.modelOdds">{{ match.modelOdds.goalLine.overOdds }}</span>
                      <span class="margin-value" :title="$t('markets.margin')" v-if="match.modelOdds">{{ calculateMargin(match.odds.goalLine.overOdds, match.modelOdds.goalLine.overOdds) }}</span>
                    </div>
                  </div>
                  <div class="odd-item">
                    <span class="odd-label">{{ $t('markets.under') }} {{ match.odds.goalLine.line }}</span>
                    <div class="odd-values">
                      <span class="odd-value">{{ match.odds.goalLine.underOdds }}</span>
                      <span class="model-odds" :title="$t('markets.modelOdds')" v-if="match.modelOdds">{{ match.modelOdds.goalLine.underOdds }}</span>
                      <span class="margin-value" :title="$t('markets.margin')" v-if="match.modelOdds">{{ calculateMargin(match.odds.goalLine.underOdds, match.modelOdds.goalLine.underOdds) }}</span>
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
import { useI18n } from 'vue-i18n'
import { ScheduleStore } from '@/store/Schedule'
import { OddsStore, Converter } from '@/store/Odds_without_pho.js'

const selectedLeague = ref('')
const selectedBookmaker = ref('')
const leagues = ref([])
const bookmakers = ref([]) // 庄家数据（从odds表动态获取）
const scheduleWithOddsData = ref([]) // 存储合并后的赛程和赔率数据
const isLoading = ref(false) // 加载状态
const hasData = ref(false) // 是否已加载数据

// Store 实例
const scheduleStore = ScheduleStore()
const oddsStore = OddsStore()

// i18n
const { t } = useI18n()

// 获取球队名称的翻译
const getTeamName = (league, teamName) => {
  try {
    // 使用方括号访问法处理包含点号的团队名称
    return t(`teams.${league}.${teamName}`)
  } catch (error) {
    // 如果找不到翻译，返回原始名称
    return teamName
  }
}



// 获取比较数据的主函数
const fetchComparisonData = async () => {
  if (!selectedLeague.value || !selectedBookmaker.value) {
    return
  }

  isLoading.value = true
  hasData.value = false
  scheduleWithOddsData.value = []

  try {
    // 获取庄家ID
    const bookmakerId = parseInt(selectedBookmaker.value)
    if (isNaN(bookmakerId)) {
      console.error('Invalid bookmaker format:', selectedBookmaker.value)
      return
    }

    // 使用 inner join 查询一次性获取赛程和赔率数据
    console.log('正在通过 inner join 查询加载赛程和赔率数据...')
    const data = await scheduleStore.fetchScheduleWithOdds(selectedLeague.value, bookmakerId)

    scheduleWithOddsData.value = data
    console.log('数据加载完成:', data.length, '场比赛有完整数据')

    if (data.length > 0) {
      hasData.value = true
      console.log('数据获取完成！')
    } else {
      console.log('没有找到匹配的数据')
    }

  } catch (error) {
    console.error('获取比较数据时出错:', error)
  } finally {
    isLoading.value = false
  }
}

// 根据选择的联赛和庄家过滤数据
const upcomingMatches = computed(() => {
  if (!hasData.value || scheduleWithOddsData.value.length === 0) {
    return []
  }

  // 将合并后的数据转换为组件需要的格式
  const formattedMatches = scheduleWithOddsData.value.map(match => {
    const matchTime = new Date(match.match_time)

    // 使用 xG 数据计算模型赔率
    let modelOdds = null
    if (match.xg1 !== null && match.xg2 !== null) {
      try {
        // 创建 Converter 实例
        const converter = new Converter([match.xg1, match.xg2])

        // 计算三种玩法的赔率
        const euroOdds = converter.getEuroOdds(0)        // 欧洲赔率（平局）
        const asianOdds = converter.getAsianOdds(match.handicap) // 亚洲盘口（使用真实的盘口线）
        const totalOdds = converter.getTotalOdds(match.overunder)   // 大小球（使用真实的大小球线）

        modelOdds = {
          winDrawWin: {
            home: euroOdds[0].toFixed(2),
            draw: euroOdds[1].toFixed(2),
            away: euroOdds[2].toFixed(2)
          },
          handicap: {
            homeTeam: `${getTeamName(match.league, match.home_team)} ${asianOdds[0] >= 0 ? '+' : ''}${asianOdds[0].toFixed(1)}`,
            homeOdds: asianOdds[1].toFixed(2),
            awayTeam: `${getTeamName(match.league, match.away_team)} ${asianOdds[0] <= 0 ? '+' : ''}${(-asianOdds[0]).toFixed(1)}`,
            awayOdds: asianOdds[2].toFixed(2)
          },
          goalLine: {
            line: totalOdds[0].toFixed(1),
            overOdds: totalOdds[1].toFixed(2),
            underOdds: totalOdds[2].toFixed(2)
          }
        }
      } catch (error) {
        console.error('Error calculating model odds:', error)
      }
    }

    // 格式化真实庄家赔率数据
    const realOdds = {
      winDrawWin: {
        home: match.win ? match.win.toFixed(2) : '-',
        draw: match.draw ? match.draw.toFixed(2) : '-',
        away: match.lose ? match.lose.toFixed(2): '-'
      },
      handicap: {
        homeTeam: match.handicap !== null ? match.handicap>= 0 ? `${getTeamName(match.league, match.home_team)} +${match.handicap.toFixed(2)}` : `${getTeamName(match.league, match.home_team)} ${match.handicap.toFixed(2)}` : "-",
        homeOdds: match.home ? match.home.toFixed(2): '-',
        awayTeam: match.handicap !== null ? match.handicap>= 0 ? `${getTeamName(match.league, match.away_team)} -${match.handicap.toFixed(2)}` : `${getTeamName(match.league, match.away_team)} +${Math.abs(match.handicap).toFixed(2)}` : "-",
        awayOdds: match.away ? match.away.toFixed(2): '-'
      },
      goalLine: {
        line: match.overunder !== null ? match.overunder.toFixed(2): '-',
        overOdds: match.over ? match.over.toFixed(2): '-',
        underOdds: match.under ? match.under.toFixed(2): '-'
      },
      createdAt: match.odds_created_at,
      bookmakerId: match.bookmaker_id
    }

    return {
      id: match.match_id,
      dateTime: matchTime.toISOString().replace('T', ' ').substring(0, 19), // 格式化为 YYYY-MM-DD HH:MM:SS
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      league: match.league,
      // 保存原始数据用于国际化显示
      rawHomeTeam: match.home_team,
      rawAwayTeam: match.away_team,
      rawLeague: match.league,
      // 包含真实赔率和模型赔率
      odds: realOdds,
      modelOdds: modelOdds
    }
  })

  // 按比赛时间排序
  const sortedMatches = formattedMatches.sort((a, b) => {
    const dateTimeA = new Date(a.dateTime)
    const dateTimeB = new Date(b.dateTime)
    return dateTimeA - dateTimeB
  })

  return sortedMatches
})



// 加载未来赛程中的联赛数据
async function loadLeagues() {
  leagues.value = await scheduleStore.fetchUpcomingLeagues(30) // 获取未来30天内的联赛
}

// 加载可用的庄家数据
async function loadBookmakers() {
  const bookmakerData = await scheduleStore.fetchAvailableBookmakers()
  bookmakers.value = bookmakerData.map(item => ({
    id: item.id,
    name: item.name
  }))

}

// 组件挂载时只加载基础数据（联赛和庄家列表）
onMounted(async () => {
  await loadLeagues()
  await loadBookmakers()
})

const onLeagueChange = () => {
  // 重置数据状态，等待用户点击确定按钮
  hasData.value = false
  scheduleWithOddsData.value = []
}

const onBookmakerChange = () => {
  // 重置数据状态，等待用户点击确定按钮
  hasData.value = false
  scheduleWithOddsData.value = []
}

// 日期时间格式化函数
const formatDate = (dateTimeStr) => {
  // dateTime 格式已经是 YYYY-MM-DD HH:MM:SS，直接返回
  return dateTimeStr
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



/* 确定按钮区域 */
.action-section {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.action-section > div:first-child {
  /* 左边空区域，隐藏但占位 */
}

.action-section > .fetch-data-btn {
  /* 按钮跨越整个action-section的宽度 */
  grid-column: 1 / -1;
  width: 100%;
}

.fetch-data-btn {
  padding: 15px 30px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.fetch-data-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.fetch-data-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.fetch-data-btn:active:not(:disabled) {
  transform: translateY(0);
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
  color: #667eea;
  font-weight: 600;
  font-size: 16px;
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

/* 庄家标签 - 已删除bookmaker-label容器，保留label-tag备用 */
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