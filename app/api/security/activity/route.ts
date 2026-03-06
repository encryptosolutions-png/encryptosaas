import { NextRequest, NextResponse } from 'next/server'
import { requireApiUser } from '@/lib/api/auth'
import { isRateLimited } from '@/lib/security/rateLimit'
import { supabaseServer } from '@/lib/supabase/server'

const ALLOWED_TYPES = new Set(['LOGIN_SUCCESS', 'LOGIN_FAILURE', 'PASSWORD_CHANGE', 'SESSION_REFRESH'])

export async function POST(request: NextRequest) {
  const authUser = await requireApiUser(request)
  if (authUser instanceof NextResponse) return authUser

  const limit = isRateLimited(`security-activity:${authUser.id}`, 120, 60_000)
  if (limit.limited) {
    return NextResponse.json({ error: 'Too many telemetry events' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const eventType = String(body.eventType || '').toUpperCase()
    const deviceHash = String(body.deviceHash || '').trim()
    const timezone = String(body.timezone || '').trim()

    if (!ALLOWED_TYPES.has(eventType)) {
      return NextResponse.json({ error: 'Invalid eventType' }, { status: 400 })
    }

    const { data: account } = await supabaseServer
      .from('social_accounts')
      .select('id')
      .eq('user_id', authUser.id)
      .eq('platform', 'instagram')
      .eq('status', 'connected')
      .maybeSingle()

    if (!account) {
      return NextResponse.json({ error: 'Instagram account is not connected' }, { status: 400 })
    }

    const { error } = await supabaseServer.from('security_activity_events').insert({
      user_id: authUser.id,
      platform: 'instagram',
      event_type: eventType,
      device_hash: deviceHash || null,
      location_hint: timezone || null,
      metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : {},
    })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Security activity ingest error:', error)
    return NextResponse.json({ error: 'Failed to ingest activity event' }, { status: 500 })
  }
}
