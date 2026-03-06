import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface ScamCheck {
  id: string
  user_id: string
  message: string
  result: 'safe' | 'suspicious' | 'scam'
  risk_level: number
  created_at: string
}

export function useScamChecks() {
  const [checks, setChecks] = useState<ScamCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChecks = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setChecks([])
        return
      }

      const { data, error } = await supabase
        .from('scam_checks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setChecks(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching checks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChecks()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchChecks()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const addCheck = async (message: string, result: 'safe' | 'suspicious' | 'scam', riskLevel: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('scam_checks')
        .insert({
          user_id: session.user.id,
          message,
          result,
          risk_level: riskLevel,
        })
        .select()
        .single()

      if (error) throw error

      setChecks(prev => [data, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding check')
      throw err
    }
  }

  return {
    checks,
    loading,
    error,
    addCheck,
    refetch: fetchChecks,
  }
}