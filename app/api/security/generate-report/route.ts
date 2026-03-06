import { NextRequest, NextResponse } from 'next/server'
import { requireApiUser } from '@/lib/api/auth'
import { generateRecoveryReportBody } from '@/lib/security/report'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const authUser = await requireApiUser(request)
  if (authUser instanceof NextResponse) return authUser

  try {
    const body = await request.json()
    const alertId = body.alertId as string | undefined
    const userConfirmed = Boolean(body.userConfirmed)

    if (!alertId) {
      return NextResponse.json({ error: 'alertId is required' }, { status: 400 })
    }

    const { data: alert, error: alertError } = await supabaseServer
      .from('security_alerts')
      .select('*')
      .eq('id', alertId)
      .eq('user_id', authUser.id)
      .single()

    if (alertError || !alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    const { data: account, error: accountError } = await supabaseServer
      .from('social_accounts')
      .select('username')
      .eq('user_id', authUser.id)
      .eq('platform', alert.platform)
      .maybeSingle()

    if (accountError) throw accountError

    const report = generateRecoveryReportBody({
      username: account?.username || 'unknown_user',
      incidentTime: new Date(alert.created_at).toISOString(),
      detectedIssue: alert.message,
      userConfirmed,
    })

    await supabaseServer
      .from('security_alerts')
      .update({ status: 'reported' })
      .eq('id', alert.id)

    return NextResponse.json(report)
  } catch (error) {
    console.error('Generate report error:', error)
    return NextResponse.json({ error: 'Failed to generate recovery report' }, { status: 500 })
  }
}
