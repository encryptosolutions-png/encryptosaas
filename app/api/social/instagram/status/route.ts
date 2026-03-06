import { NextRequest, NextResponse } from 'next/server'
import { requireApiUser } from '@/lib/api/auth'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const authUser = await requireApiUser(request)
  if (authUser instanceof NextResponse) return authUser

  try {
    const { data: account, error: accountError } = await supabaseServer
      .from('social_accounts')
      .select('id, platform, username, status, monitoring_state, connected_at, last_checked_at, security_score, metadata')
      .eq('user_id', authUser.id)
      .eq('platform', 'instagram')
      .maybeSingle()

    if (accountError) throw accountError

    const { data: alerts, error: alertError } = await supabaseServer
      .from('security_alerts')
      .select('id, alert_type, severity, message, created_at, status')
      .eq('user_id', authUser.id)
      .eq('platform', 'instagram')
      .order('created_at', { ascending: false })
      .limit(10)

    if (alertError) throw alertError

    const connectionState = !account
      ? 'NOT_CONNECTED'
      : account.status === 'connected' && account.monitoring_state === 'active'
      ? 'MONITORING_ACTIVE'
      : account.status === 'connected'
      ? 'CONNECTED'
      : 'CONNECTING'

    return NextResponse.json({
      mode: 'internal',
      connectionState,
      account,
      alerts: alerts || [],
    })
  } catch (error) {
    console.error('Instagram status error:', error)
    return NextResponse.json({ error: 'Failed to fetch account status' }, { status: 500 })
  }
}
