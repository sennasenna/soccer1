import {defineStore} from "pinia";
import {supabase} from "@/supabase.js";

export const LeagueTeamsStore = defineStore('LeagueTeamsStore', () => {
  async function fetch_leagueteams({league_name}){
    const { data, error } = await supabase.rpc('distinct_teams_in_league',{p_league: league_name})

    if (error) {
      console.error(`Supabase fetch ${type} error:`, error)
      return []
    }
    return data || []
  }

  return { fetch_leagueteams }

})