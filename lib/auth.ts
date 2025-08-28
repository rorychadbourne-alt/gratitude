import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// For server components - simplified version
export function createServerSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get() {
          return undefined
        },
        set() {
          // No-op in development
        },
        remove() {
          // No-op in development
        },
      },
    }
  )
}