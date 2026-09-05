import { createClient } from '@supabase/supabase-js'
import { supabase as mockSupabase } from './supabase-mock.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const useMockEnv = import.meta.env.VITE_USE_MOCK

console.log('[SUPABASE DEBUG] supabaseUrl:', supabaseUrl)

// Use real client only when explicitly configured with valid non-placeholder credentials and VITE_USE_MOCK !== 'true'
const isPlaceholder =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('placeholder') ||
  supabaseUrl.includes('your-supabase-url')

let client = mockSupabase

if (useMockEnv !== 'true' && !isPlaceholder) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  } catch (err) {
    console.error('[Supabase] Failed to initialize live client, using mock database fallback:', err)
  }
}

console.log('[SUPABASE DEBUG] Final client type:', client === mockSupabase ? 'MOCK' : 'REAL')

export const supabase = client
export { mockSupabase }


