import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Get counts from database
    const [socialResult, scamResult, contentResult] = await Promise.all([
      supabaseServer.from('social_accounts').select('id', { count: 'exact', head: true }),
      supabaseServer.from('scam_checks').select('id', { count: 'exact', head: true }),
      supabaseServer.from('protected_content').select('id', { count: 'exact', head: true }),
    ])

    const totalSocialAccounts = socialResult.count || 0
    const totalScamChecks = scamResult.count || 0
    const totalProtectedContent = contentResult.count || 0

    // Calculate security score (same logic as frontend)
    const socialScore = Math.min(totalSocialAccounts * 20, 40)
    const contentScore = Math.min(totalProtectedContent * 20, 30)
    const scamScore = Math.min(totalScamChecks * 5, 30)
    const securityScore = socialScore + contentScore + scamScore

    return NextResponse.json({
      totalSocialAccounts,
      totalScamChecks,
      totalProtectedContent,
      securityScore,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
