import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          age: number
          gender: string
          dietary_preference: string
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          age: number
          gender: string
          dietary_preference: string
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          age?: number
          gender?: string
          dietary_preference?: string
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      health_conditions: {
        Row: {
          id: string
          user_id: string
          condition_name: string
          medications: string | null
          allergies: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          condition_name: string
          medications?: string | null
          allergies?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          condition_name?: string
          medications?: string | null
          allergies?: string | null
          created_at?: string
        }
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          recommended_foods: string[]
          foods_to_avoid: string[]
          supplements: string[]
          explanations: Record<string, string>
          warnings: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recommended_foods: string[]
          foods_to_avoid: string[]
          supplements: string[]
          explanations: Record<string, string>
          warnings: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recommended_foods?: string[]
          foods_to_avoid?: string[]
          supplements?: string[]
          explanations?: Record<string, string>
          warnings?: string[]
          created_at?: string
        }
      }
    }
  }
}