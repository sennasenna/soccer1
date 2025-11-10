import { defineStore } from 'pinia'
import { supabase } from '@/supabase'

export const ScheduleStore = defineStore('schedule', () => {

  // 获取所有赛程数据
  const fetchSchedule = async (filters = {}) => {
    try {
      const now = new Date().toISOString()

      let query = supabase
        .from('schedule')
        .select('*')
        .gte('match_time', now) // 只获取未来的比赛
        .order('match_time', { ascending: true })

      // 如果有联赛筛选条件
      if (filters.league) {
        query = query.eq('league', filters.league)
      }

      // 如果有日期筛选条件
      if (filters.date) {
        const startDate = new Date(filters.date)
        const endDate = new Date(filters.date)
        endDate.setDate(endDate.getDate() + 1) // 包含当天的所有时间

        // 如果筛选的日期是过去或今天，则从当前时间开始
        const filterStart = startDate < new Date() ? new Date() : startDate

        query = query
          .gte('match_time', filterStart.toISOString())
          .lt('match_time', endDate.toISOString())
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching schedule:', error)
        return []
      }

      return data || []
    } catch (err) {
      console.error('Unexpected error:', err)
      return []
    }
  }

  // 根据联赛获取赛程
  const fetchScheduleByLeague = async (league) => {
    return await fetchSchedule({ league })
  }

  // 根据日期获取赛程
  const fetchScheduleByDate = async (date) => {
    return await fetchSchedule({ date })
  }

  // 获取未来赛程（从当前时间开始）
  const fetchUpcomingSchedule = async (days = 7) => {
    try {
      const now = new Date().toISOString()
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)
      const futureDateISO = futureDate.toISOString()

      const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .gte('match_time', now)
        .lt('match_time', futureDateISO)
        .order('match_time', { ascending: true })

      if (error) {
        console.error('Error fetching upcoming schedule:', error)
        return []
      }

      return data || []
    } catch (err) {
      console.error('Unexpected error:', err)
      return []
    }
  }

  // 获取未来赛程中包含的所有联赛
  const fetchUpcomingLeagues = async (days = 30) => {
    try {
      const now = new Date().toISOString()
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)
      const futureDateISO = futureDate.toISOString()

      const { data, error } = await supabase
        .from('schedule')
        .select('league')
        .gte('match_time', now)
        .lt('match_time', futureDateISO)
        .order('league', { ascending: true })

      if (error) {
        console.error('Error fetching upcoming leagues:', error)
        return []
      }

      // 去重并返回联赛列表
      const uniqueLeagues = [...new Set(data?.map(item => item.league) || [])]
      return uniqueLeagues.map(league => ({ league }))
    } catch (err) {
      console.error('Unexpected error:', err)
      return []
    }
  }

  // 获取指定联赛和庄家的赛程及赔率数据（inner join）
  const fetchScheduleWithOdds = async (league, bookmakerId) => {
    try {
      const now = new Date().toISOString()

      // 使用 Supabase RPC 调用执行 inner join 查询
      const { data, error } = await supabase.rpc('get_schedule_with_odds', {
        p_league: league,
        p_bookmaker_id: bookmakerId,
        p_current_time: now
      })

      if (error) {
        console.error('Error fetching schedule with odds:', error)
        return []
      }

      console.log('Schedule with odds data:', data)
      return data || []
    } catch (err) {
      console.error('Unexpected error:', err)
      return []
    }
  }

  // 获取所有可用的庄家列表
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

      // 庄家ID映射
      const bookmakerMapping = {
        1: 'bet365',
        2: 'sbo',
        3: 'ibc'
      }

      return uniqueBookmakerIds.map(bookmakerId => ({
        id: bookmakerId,
        code: bookmakerMapping[bookmakerId] || `bookmaker${bookmakerId}`,
        name: (bookmakerMapping[bookmakerId] || `bookmaker${bookmakerId}`).toUpperCase()
      }))
    } catch (err) {
      console.error('Unexpected error:', err)
      return []
    }
  }

  return {
    fetchSchedule,
    fetchScheduleByLeague,
    fetchScheduleByDate,
    fetchUpcomingSchedule,
    fetchUpcomingLeagues,
    fetchScheduleWithOdds,
    fetchAvailableBookmakers
  }
})