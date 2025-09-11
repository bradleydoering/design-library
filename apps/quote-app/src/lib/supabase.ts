import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iaenowmeacxkccgnmfzc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZW5vd21lYWN4a2NjZ25tZnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDkwNTgsImV4cCI6MjA2OTU4NTA1OH0.HGmLRGJnXHOMeSF8f_xzyF1LT8V5knrxl58brQ_IuQI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for rate cards
export interface RateLine {
  line_code: string
  line_name: string
  unit: 'unit' | 'sqft' | 'item' | 'point'
  base_price: number
  price_per_unit: number
  notes?: string
  active: boolean
  created_at: string
  updated_at: string
  updated_by?: string
}

export interface ProjectMultiplier {
  code: string
  name: string
  basis: 'percent_of_labour' | 'percent_of_sell'
  default_percent: number
  created_at: string
  updated_at: string
  updated_by?: string
}

// API Functions for Rate Cards
export const RateCardsAPI = {
  /**
   * Get all active rate lines
   */
  async getRateLines(): Promise<Record<string, RateLine>> {
    const { data, error } = await supabase
      .from('rate_lines')
      .select('*')
      .eq('active', true)
      .order('line_code')

    if (error) {
      console.error('Error fetching rate lines:', error)
      throw new Error(`Failed to load rate lines: ${error.message}`)
    }

    // Convert to Record for easy lookup
    const rateLines: Record<string, RateLine> = {}
    data?.forEach(rate => {
      rateLines[rate.line_code] = rate
    })

    return rateLines
  },

  /**
   * Get all project multipliers
   */
  async getProjectMultipliers(): Promise<Record<string, ProjectMultiplier>> {
    const { data, error } = await supabase
      .from('project_multipliers')
      .select('*')
      .order('code')

    if (error) {
      console.error('Error fetching project multipliers:', error)
      throw new Error(`Failed to load project multipliers: ${error.message}`)
    }

    // Convert to Record for easy lookup
    const multipliers: Record<string, ProjectMultiplier> = {}
    data?.forEach(mult => {
      multipliers[mult.code] = mult
    })

    return multipliers
  },

  /**
   * Update rate line pricing
   */
  async updateRateLine(lineCode: string, updates: Partial<Pick<RateLine, 'base_price' | 'price_per_unit' | 'line_name' | 'notes'>>): Promise<boolean> {
    const { error } = await supabase
      .from('rate_lines')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('line_code', lineCode)

    if (error) {
      console.error(`Error updating rate line ${lineCode}:`, error)
      return false
    }

    return true
  },

  /**
   * Update project multiplier percentage
   */
  async updateProjectMultiplier(code: string, defaultPercent: number): Promise<boolean> {
    const { error } = await supabase
      .from('project_multipliers')
      .update({
        default_percent: defaultPercent,
        updated_at: new Date().toISOString()
      })
      .eq('code', code)

    if (error) {
      console.error(`Error updating project multiplier ${code}:`, error)
      return false
    }

    return true
  },

  /**
   * Add new rate line
   */
  async addRateLine(rateLine: Omit<RateLine, 'created_at' | 'updated_at' | 'updated_by'>): Promise<boolean> {
    const { error } = await supabase
      .from('rate_lines')
      .insert(rateLine)

    if (error) {
      console.error('Error adding rate line:', error)
      return false
    }

    return true
  },

  /**
   * Deactivate rate line (soft delete)
   */
  async deactivateRateLine(lineCode: string): Promise<boolean> {
    const { error } = await supabase
      .from('rate_lines')
      .update({
        active: false,
        updated_at: new Date().toISOString()
      })
      .eq('line_code', lineCode)

    if (error) {
      console.error(`Error deactivating rate line ${lineCode}:`, error)
      return false
    }

    return true
  }
}