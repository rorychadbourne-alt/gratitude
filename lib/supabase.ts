import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create one instance
const supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Export the instance directly
export const supabase = supabaseInstance

// Also export the createClient function for compatibility
export function createClient() {
  return supabaseInstance
}

// Default export as well
export default supabaseInstance