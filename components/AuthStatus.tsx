'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import type { User } from '@supabase/supabase-js'

interface AuthStatusProps {
  className?: string
}

export function AuthStatus({ className = '' }: AuthStatusProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return null
  }

  if (!user) {
    return null
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="text-sm text-slate-300">{user.email}</span>
      <Button variant="secondary" size="sm" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  )
}
