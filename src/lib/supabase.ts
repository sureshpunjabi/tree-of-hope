import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Use globalThis to ensure a true singleton across Next.js code-split chunks
const globalKey = '__toh_supabase_client__' as const

export function getSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') return null // SSR safety
  if (!supabaseUrl || !supabaseAnonKey) return null

  const g = globalThis as unknown as Record<string, SupabaseClient | undefined>
  if (!g[globalKey]) {
    g[globalKey] = createClient(supabaseUrl, supabaseAnonKey)
  }
  return g[globalKey]!
}

// Server-side Supabase client (uses service role key for admin operations)
export function getServiceSupabase() {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Get authenticated user from request (server-side)
export async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return null

  const token = authHeader.replace('Bearer ', '')
  if (!token || !supabaseUrl || !supabaseAnonKey) return null

  // Create a server-side client with the user's token
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data: { user }, error } = await client.auth.getUser(token)

  if (error || !user) return null
  return user
}
