// Toggle between mock (for UI development) and real Supabase
// To use real Supabase, comment the mock line and uncomment the real client below

export { supabase } from './supabase-mock.js'

// import { createClient } from '@supabase/supabase-js'
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
// export const supabase = createClient(supabaseUrl, supabaseAnonKey)
