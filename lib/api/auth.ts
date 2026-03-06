import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export interface AuthenticatedApiUser {
  id: string
  email?: string
}

export async function requireApiUser(request: NextRequest): Promise<AuthenticatedApiUser | NextResponse> {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    return NextResponse.json({ error: 'Missing Bearer token' }, { status: 401 })
  }

  const {
    data: { user },
    error,
  } = await supabaseServer.auth.getUser(token)

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return { id: user.id, email: user.email }
}
