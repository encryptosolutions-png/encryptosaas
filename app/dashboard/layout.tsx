'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { LoadingPage } from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { AlertIcon, GraphIcon, LinkIcon, LogoutIcon, ShieldIcon, UserIcon } from '@/components/ui/Icons'
import { supabase } from '@/lib/supabase/client'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)
        } else {
          router.push('/login')
          return
        }
      } catch (error) {
        console.error('Error checking session:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <LoadingPage />
  }

  if (!user) {
    return null
  }

  const navLinks = [
    { href: '/dashboard', label: 'Overview', icon: GraphIcon },
    { href: '/dashboard/social', label: 'Social Accounts', icon: UserIcon },
    { href: '/dashboard/scam-detector', label: 'Scam Detector', icon: AlertIcon },
    { href: '/dashboard/protected-content', label: 'Protected Content', icon: ShieldIcon },
    { href: '/dashboard/security/account-protection', label: 'Security: Account Protection', icon: LinkIcon },
    { href: '/dashboard/security/protected-content', label: 'Security: Content Monitoring', icon: ShieldIcon },
    { href: '/dashboard/security/message-scanner', label: 'Security: Message Scanner', icon: AlertIcon },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-slate-800 bg-slate-950/95 lg:block">
        <div className="border-b border-slate-800 p-6">
          <h1 className="text-2xl font-bold text-cyan-300">EnCrypto</h1>
          <p className="mt-1 text-xs text-slate-500">Creator Security Platform</p>
        </div>

        <nav className="space-y-2 px-4 py-6">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? 'border border-cyan-300/40 bg-cyan-300/10 text-cyan-200'
                    : 'border border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-4">
          <div className="mb-3 rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-slate-400">
            <p className="truncate text-sm font-medium text-slate-200">{user.email}</p>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout} className="w-full">
            <LogoutIcon className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="lg:ml-72">
        <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
          <div className="flex items-center justify-between px-5 py-4 lg:px-8">
            <h2 className="text-xl font-semibold text-white">Security Dashboard</h2>
            <div className="hidden items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 sm:flex">
              <LinkIcon className="h-4 w-4 text-cyan-300" />
              {user.email}
            </div>
          </div>
        </header>

        <div className="px-5 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}
