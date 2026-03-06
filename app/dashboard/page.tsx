'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { MetricWidget } from '@/components/ui/MetricWidget'
import { AlertIcon, GraphIcon, ShieldIcon, UserIcon } from '@/components/ui/Icons'
import { supabase } from '@/lib/supabase/client'
import { useSocialAccounts } from '@/hooks/useSocialAccounts'
import { useScamChecks } from '@/hooks/useScamChecks'
import { useProtectedContent } from '@/hooks/useProtectedContent'

interface DashboardStats {
  totalSocialAccounts: number
  totalScamChecks: number
  totalProtectedContent: number
  securityScore: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const { accounts: socialAccounts, loading: accountsLoading, error: accountsError } = useSocialAccounts()
  const { checks: scamChecks, loading: checksLoading, error: checksError } = useScamChecks()
  const { content: protectedContent, loading: contentLoading, error: contentError } = useProtectedContent()

  const hasError = accountsError || checksError || contentError

  const stats: DashboardStats = {
    totalSocialAccounts: socialAccounts.length,
    totalScamChecks: scamChecks.length,
    totalProtectedContent: protectedContent.length,
    securityScore: 0,
  }

  const socialScore = Math.min(socialAccounts.length * 20, 40)
  const contentScore = Math.min(protectedContent.length * 20, 30)
  const scamScore = Math.min(scamChecks.length * 5, 30)
  stats.securityScore = socialScore + contentScore + scamScore

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  const getSecurityColor = (score: number) => {
    if (score >= 80) return 'text-emerald-300'
    if (score >= 60) return 'text-yellow-300'
    return 'text-rose-300'
  }

  const getSecurityLevel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  if (loading || accountsLoading || checksLoading || contentLoading) {
    return <LoadingSpinner />
  }

  if (hasError) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-slate-400">Error loading dashboard data</p>
        </div>
        <Card>
          <div className="py-8 text-center">
            <p className="mb-4 text-rose-300">{accountsError || checksError || contentError}</p>
            <p className="text-slate-400">
              Please make sure the database tables are set up correctly in Supabase. Run the SQL commands from `DATABASE_SETUP.sql`.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="mt-1 text-slate-400">Welcome back{user?.email ? `, ${user.email}` : ''}. Here is your security posture.</p>
        </div>
      </div>

      <Card className="relative overflow-hidden border-cyan-300/30">
        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-300/10 blur-2xl" />
        <div className="relative space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Security Score</p>
          <div className="text-6xl font-bold text-white">{stats.securityScore}</div>
          <div className={`text-2xl font-semibold ${getSecurityColor(stats.securityScore)}`}>
            {getSecurityLevel(stats.securityScore)} Security
          </div>
          <p className="mx-auto max-w-2xl text-slate-400">
            Score is based on connected accounts, protected content coverage, and recent scam analysis activity.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <MetricWidget
          label="Social Accounts"
          value={stats.totalSocialAccounts}
          icon={<UserIcon className="h-4 w-4" />}
          href="/dashboard/social"
          linkLabel="Manage Accounts"
        />
        <MetricWidget
          label="Scam Checks"
          value={stats.totalScamChecks}
          icon={<AlertIcon className="h-4 w-4" />}
          href="/dashboard/scam-detector"
          linkLabel="Run Check"
        />
        <MetricWidget
          label="Protected Assets"
          value={stats.totalProtectedContent}
          icon={<ShieldIcon className="h-4 w-4" />}
          href="/dashboard/protected-content"
          linkLabel="View Assets"
        />
      </div>

      <Card title="Quick Actions" subtitle="Jump into your most used workflows">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Link href="/dashboard/social" className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-200 hover:border-cyan-300 hover:text-cyan-200">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-300">
              <UserIcon className="h-4 w-4" />
              Accounts
            </span>
            Add and monitor social handles.
          </Link>
          <Link href="/dashboard/scam-detector" className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-200 hover:border-cyan-300 hover:text-cyan-200">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-300">
              <AlertIcon className="h-4 w-4" />
              Detector
            </span>
            Analyze suspicious messages instantly.
          </Link>
          <Link href="/dashboard/protected-content" className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-200 hover:border-cyan-300 hover:text-cyan-200">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-300">
              <GraphIcon className="h-4 w-4" />
              Library
            </span>
            Track your protected content registry.
          </Link>
          <Link href="/dashboard/security/account-protection" className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-200 hover:border-cyan-300 hover:text-cyan-200">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-300">
              <ShieldIcon className="h-4 w-4" />
              Account Protection
            </span>
            Connect Instagram and monitor suspicious access.
          </Link>
          <Link href="/dashboard/security/protected-content" className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-200 hover:border-cyan-300 hover:text-cyan-200">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-300">
              <ShieldIcon className="h-4 w-4" />
              Content Monitoring
            </span>
            Scan for unauthorized reposts and copyright misuse.
          </Link>
          <Link href="/dashboard/security/message-scanner" className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-200 hover:border-cyan-300 hover:text-cyan-200">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-300">
              <AlertIcon className="h-4 w-4" />
              Message Scanner
            </span>
            Simulate scam, phishing, and hate-message analysis.
          </Link>
        </div>
      </Card>
    </div>
  )
}
