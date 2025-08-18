import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
type Country = {
  id: number
  code: string
  name: string
  phone_code: number
  nationality: string
}

type State = {
  id: number
  code: string
  name: string
  short_name: string
}

type LocationCoords = {
  lattitude: number
  latitude: number
  longitude: number
  time_zone: {
    id: number
    name: string
    standard_name: string
    symbol: string
  }
}

type Currency = {
  id: number
  name: string
  code: string
  symbol: string
}

type AddressInfo = {
  address_1: string
  address_2?: string
  city: string
  zip_code: string
}

type ContactInfo = {
  phone_1: {
    country_id: number
    number: string
    display_number: string
  }
  phone_2?: {
    country_id: number
    number: string
    display_number: string
  } | null
  email: string
}

type WorkingHours = {
  day_of_week: string
  start_time: string
  end_time: string
  offline_start_time: string
  offline_end_time: string
  off_peak_start_time: string
  off_peak_end_time: string
  is_closed: boolean
}

export type Database = {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string
          code: string
          name: string
          display_name: string
          description: string
          online_booking_start_date: string
          enable_parallel_services_at_center: boolean
          country: Country
          state: State
          location: LocationCoords
          currency: Currency
          address_info: AddressInfo
          contact_info: ContactInfo
          working_hours: WorkingHours[]
          additional_info: Record<string, unknown> | null
          culture_code_at_center: string | null
          is_fbe_enabled: boolean | null
          is_hc_call_center: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          display_name: string
          description: string
          online_booking_start_date: string
          enable_parallel_services_at_center?: boolean
          country: Country
          state: State
          location: LocationCoords
          currency: Currency
          address_info: AddressInfo
          contact_info: ContactInfo
          working_hours: WorkingHours[]
          additional_info?: Record<string, unknown> | null
          culture_code_at_center?: string | null
          is_fbe_enabled?: boolean | null
          is_hc_call_center?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          display_name?: string
          description?: string
          online_booking_start_date?: string
          enable_parallel_services_at_center?: boolean
          country?: Country
          state?: State
          location?: LocationCoords
          currency?: Currency
          address_info?: AddressInfo
          contact_info?: ContactInfo
          working_hours?: WorkingHours[]
          additional_info?: Record<string, unknown> | null
          culture_code_at_center?: string | null
          is_fbe_enabled?: boolean | null
          is_hc_call_center?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      location_configs: {
        Row: {
          id: string
          location_id: string
          user_id: string | null
          budget: number | null
          custom_settings: Record<string, unknown> | null
          notes: string | null
          is_active: boolean
          primary_lat: number | null
          primary_lng: number | null
          radius_miles: number | null
          coordinate_list: Array<{ lat: number; lng: number; radius?: number }> | null
          landing_page_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          location_id: string
          user_id?: string | null
          budget?: number | null
          custom_settings?: Record<string, unknown> | null
          notes?: string | null
          is_active?: boolean
          primary_lat?: number | null
          primary_lng?: number | null
          radius_miles?: number | null
          coordinate_list?: Array<{ lat: number; lng: number; radius?: number }> | null
          landing_page_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          user_id?: string | null
          budget?: number | null
          custom_settings?: Record<string, unknown> | null
          notes?: string | null
          is_active?: boolean
          primary_lat?: number | null
          primary_lng?: number | null
          radius_miles?: number | null
          coordinate_list?: Array<{ lat: number; lng: number; radius?: number }> | null
          landing_page_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }

    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 