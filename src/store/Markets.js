import { defineStore } from 'pinia'
import { supabase } from '../supabase'

export const MarketsStore = defineStore('MarketsStore', () => {
  async function fetch_markets({league, home_team, away_team}){
    console.log(league, home_team, away_team)
    const { data, error } = await supabase.rpc('get_markets',{league: league, team1: home_team, team2: away_team})

    if (error) {
      console.error(`Supabase fetch ${type} error:`, error)
      return []
    }
    return data || []
  }

  return { fetch_markets }

})