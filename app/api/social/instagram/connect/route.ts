import { NextRequest, NextResponse } from 'next/server'
import { requireApiUser } from '@/lib/api/auth'
import { isRateLimited } from '@/lib/security/rateLimit'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const authUser = await requireApiUser(request)
  if (authUser instanceof NextResponse) return authUser

  const limit = isRateLimited(`ig-connect:${authUser.id}`, 10, 60_000)
  if (limit.limited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const username = String(body.username || '').trim().toLowerCase().replace('@', '')
    const timezone = String(body.timezone || '').trim()
    const initialDeviceHash = String(body.deviceHash || '').trim()

    if (!username || username.length < 3) {
      return NextResponse.json({ error: 'Valid Instagram username is required' }, { status: 400 })
    }

    const metadata = {
      trusted_timezone: timezone || null,
      trusted_device_hashes: initialDeviceHash ? [initialDeviceHash] : [],
      connected_mode: 'internal',
    }

    const { data: existingAccount } = await supabaseServer
      .from('social_accounts')
      .select('id')
      .eq('user_id', authUser.id)
      .eq('platform', 'instagram')
      .maybeSingle()

    if (existingAccount?.id) {
      const { error: updateError } = await supabaseServer
        .from('social_accounts')
        .update({
          username,
          status: 'connected',
          monitoring_state: 'active',
          connected_at: new Date().toISOString(),
          last_checked_at: new Date().toISOString(),
          security_score: 80,
          metadata,
        })
        .eq('id', existingAccount.id)

      if (updateError) throw updateError
    } else {
      const { error: insertError } = await supabaseServer.from('social_accounts').insert({
        user_id: authUser.id,
        platform: 'instagram',
        username,
        status: 'connected',
        monitoring_state: 'active',
        connected_at: new Date().toISOString(),
        last_checked_at: new Date().toISOString(),
        security_score: 80,
        metadata,
      })

      if (insertError) throw insertError
    }

    return NextResponse.json({ success: true, mode: 'internal', username })
  } catch (error) {
    console.error('Instagram internal connect error:', error)
    return NextResponse.json({ error: 'Failed to connect account' }, { status: 500 })
  }
}
