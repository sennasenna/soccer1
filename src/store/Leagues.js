import { defineStore } from 'pinia'
import { supabase } from '../supabase'

export const LeaguesStore = defineStore('LeaguesStore', () => {
  async function fetch_leagues(){
    const { data, error } = await supabase.rpc('distinct_leagues')

    if (error) {
      console.error(`Supabase fetch ${type} error:`, error)
      return []
    }
    return data || []
  }

  return { fetch_leagues }

})