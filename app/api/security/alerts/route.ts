import { NextRequest, NextResponse } from 'next/server'
import { requireApiUser } from '@/lib/api/auth'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const authUser = await requireApiUser(request)
  if (authUser instanceof NextResponse) return authUser

  try {
    const { data, error } = await supabaseServer
      .from('security_alerts')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ alerts: data || [] })
  } catch (fetchError) {
    console.error('Security alerts fetch error:', fetchError)
    return NextResponse.json({ error: 'Failed to load security alerts' }, { status: 500 })
  }
}
