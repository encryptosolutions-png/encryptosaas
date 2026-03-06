// Browser-side Supabase client for client components
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

console.log('[Supabase Client] URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
console.log('[Supabase Client] Key:', supabaseAnonKey ? '✓ Set' : '✗ Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials:', { supabaseUrl, supabaseAnonKey })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

