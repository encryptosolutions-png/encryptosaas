import { NextRequest, NextResponse } from 'next/server'
import { requireApiUser } from '@/lib/api/auth'
import { isRateLimited } from '@/lib/security/rateLimit'
import { monitorAllAccounts, monitorUserAccounts } from '@/services/accountMonitor.js'

export async function POST(request: NextRequest) {
  const monitorSecret = request.headers.get('x-monitor-secret')
  if (monitorSecret && monitorSecret === process.env.MONITOR_CRON_SECRET) {
    try {
      const result = await monitorAllAccounts()
      return NextResponse.json({ mode: 'global', ...result })
    } catch (error) {
      console.error('Global security scan error:', error)
      return NextResponse.json({ error: 'Failed to run global security scan' }, { status: 500 })
    }
  }

  const authUser = await requireApiUser(request)
  if (authUser instanceof NextResponse) return authUser

  const limit = isRateLimited(`security-scan:${authUser.id}`, 20, 5 * 60_000)
  if (limit.limited) {
    return NextResponse.json({ error: 'Too many scan requests' }, { status: 429 })
  }

  try {
    const result = await monitorUserAccounts(authUser.id)
    return NextResponse.json({ mode: 'user', ...result })
  } catch (error) {
    console.error('Security scan error:', error)
    return NextResponse.json({ error: 'Failed to run security scan' }, { status: 500 })
  }
}
