import { defineStore } from 'pinia'
import { supabase } from '@/supabase'

export const OddsStore = defineStore('odds', () => {

  // 获取指定比赛的赔率数据
  const fetchOddsByMatchId = async (matchId, bookmakerId = null) => {
    try {
      let query = supabase
        .from('odds')
        .select('*')
        .eq('match_id', matchId)

      // 如果指定了庄家ID，则过滤庄家
      if (bookmakerId) {
        query = query.eq('bookmaker_id', bookmakerId)
      }

      // 按创建时间降序排列，获取最新的赔率
      query = query.order('created_at', { ascending: false })

      const { data, error } = await query.limit(1) // 只获取最新的一条记录

      if (error) {
        console.error('Error fetching odds:', error)
        return null
      }

      return data && data.length > 0 ? data[0] : null
    } catch (err) {
      console.error('Unexpected error:', err)
      return null
    }
  }

  // 获取多个比赛的赔率数据
  const fetchOddsForMatches = async (matches, bookmakerId) => {
    try {
      if (!matches || matches.length === 0) return []

      const matchIds = matches.map(match => match.match_id || match.id)

      let query = supabase
        .from('odds')
        .select('*')
        .in('match_id', matchIds)
        .eq('bookmaker_id', bookmakerId)

      const { data, error } = await query

      if (error) {
        console.error('Error fetching odds for matches:', error)
        return []
      }

      // 按match_id分组，只保留每个比赛的最新赔率
      const oddsMap = {}
      if (data) {
        data.forEach(odd => {
          const matchId = odd.match_id
          if (!oddsMap[matchId] || new Date(odd.created_at) > new Date(oddsMap[matchId].created_at)) {
            oddsMap[matchId] = odd
          }
        })
      }

      return oddsMap
    } catch (err) {
      console.error('Unexpected error:', err)
      return {}
    }
  }

  // 获取指定庄家的所有赔率
  const fetchOddsByBookmaker = async (bookmakerId, limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('odds')
        .select('*')
        .eq('bookmaker_id', bookmakerId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching odds by bookmaker:', error)
        return []
      }

      return data || []
    } catch (err) {
      console.error('Unexpected error:', err)
      return []
    }
  }

  // 将赔率数据转换为组件需要的格式
  const formatOddsData = (oddsRecord) => {
    if (!oddsRecord) return null

    return {
      winDrawWin: {
        home: oddsRecord.win.toFixed(2),
        draw: oddsRecord.draw.toFixed(2),
        away: oddsRecord.lose.toFixed(2)
      },
      handicap: {
        homeTeam: oddsRecord.handicap >= 0 ? `主队 +${oddsRecord.handicap.toFixed(1)}` : `主队 ${oddsRecord.handicap.toFixed(1)}`,
        homeOdds: oddsRecord.home.toFixed(2),
        awayTeam: oddsRecord.handicap >= 0 ? `客队 -${oddsRecord.handicap.toFixed(1)}` : `客队 +${Math.abs(oddsRecord.handicap).toFixed(1)}`,
        awayOdds: oddsRecord.away.toFixed(2)
      },
      goalLine: {
        line: oddsRecord.overunder.toFixed(1),
        overOdds: oddsRecord.over.toFixed(2),
        underOdds: oddsRecord.under.toFixed(2)
      },
      createdAt: oddsRecord.created_at,
      bookmakerId: oddsRecord.bookmaker_id
    }
  }

  // 获取 odds 表中所有的庄家
  const fetchAvailableBookmakers = async () => {
    try {
      const { data, error } = await supabase
        .from('odds')
        .select('bookmaker_id')
        .not('bookmaker_id', 'is', null)

      if (error) {
        console.error('Error fetching bookmakers:', error)
        return []
      }

      // 去重并返回庄家列表
      const uniqueBookmakerIds = [...new Set(data?.map(item => item.bookmaker_id) || [])]
      return uniqueBookmakerIds.map(bookmakerId => ({
        id: bookmakerId,
        code: getBookmakerCode(bookmakerId)
      }))
    } catch (err) {
      console.error('Unexpected error:', err)
      return []
    }
  }

  // 庄家ID映射（可以根据实际数据库中的bookmaker_id进行调整）
  const bookmakerMapping = {
    1: 'bet365',
    2: 'sbo',
    3: 'ibc'
  }

  // 根据bookmaker_id获取庄家代码
  const getBookmakerCode = (bookmakerId) => {
    return bookmakerMapping[bookmakerId] || `bookmaker${bookmakerId}`
  }

  const getBookmakerId = (bookmakerCode) => {
    const idMap = {
      'bet365': 1,
      'sbo': 2,
      'ibc': 3
    }
    return idMap[bookmakerCode]
  }

  return {
    fetchOddsByMatchId,
    fetchOddsForMatches,
    fetchOddsByBookmaker,
    fetchAvailableBookmakers,
    formatOddsData,
    bookmakerMapping,
    getBookmakerCode,
    getBookmakerId
  }
})