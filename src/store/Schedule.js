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

  return {
    fetchSchedule,
    fetchScheduleByLeague,
    fetchScheduleByDate,
    fetchUpcomingSchedule
  }
})