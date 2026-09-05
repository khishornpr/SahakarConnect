import { createClient } from '@supabase/supabase-js'
import { supabase as mockSupabase } from './supabase-mock.js'

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_URL) ||
  globalThis.process?.env?.VITE_SUPABASE_URL ||
  ''

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_ANON_KEY) ||
  globalThis.process?.env?.VITE_SUPABASE_ANON_KEY ||
  ''

const useMockEnv =
  (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_USE_MOCK) ||
  globalThis.process?.env?.VITE_USE_MOCK

// Use real client only when explicitly configured with valid non-placeholder credentials and VITE_USE_MOCK !== 'true'
const isPlaceholder =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('placeholder') ||
  supabaseUrl.includes('your-supabase-url')

console.log('[SUPABASE DEBUG] useMockEnv:', useMockEnv, 'typeof:', typeof useMockEnv)
console.log('[SUPABASE DEBUG] isPlaceholder:', isPlaceholder)
console.log('[SUPABASE DEBUG] supabaseUrl:', supabaseUrl)
console.log('[SUPABASE DEBUG] supabaseAnonKey exists:', !!supabaseAnonKey, 'length:', supabaseAnonKey?.length)

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
    console.warn('[Supabase] Failed to initialize live client, using mock database fallback:', err)
    console.error('[SUPABASE DEBUG] Full error object:', err)
  }
}

console.log('[SUPABASE DEBUG] Final client type:', client === mockSupabase ? 'MOCK' : 'REAL')

export const supabase = client
export { mockSupabase }


