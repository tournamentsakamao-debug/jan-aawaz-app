import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

// These values come from Supabase Dashboard > Settings > API
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

// Secure storage for tokens
const storage = {
  getItem: async (key) => await SecureStore.getItemAsync(key),
  setItem: async (key, value) => await SecureStore.setItemAsync(key, value),
  removeItem: async (key) => await SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // For mobile
  },
  global: {
    headers: { 
      'x-app-name': 'JanAawaz',
      'x-platform': Platform.OS
    },
  },
})

// Helper: Check maintenance mode before any API call
export const isAppAvailable = async (userRole = 'citizen') => {
  const { data } = await supabase
    .from('admin_settings')
    .select('app_maintenance_mode')
    .single()
  return !data?.app_maintenance_mode || ['admin','app_owner'].includes(userRole)
}
