import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface SocialAccount {
  id: string
  user_id: string
  platform: string
  username: string
  followers?: number
  created_at: string
  updated_at: string
}

export function useSocialAccounts() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setAccounts([])
        return
      }

      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setAccounts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching accounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchAccounts()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const addAccount = async (platform: string, username: string, followers?: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('social_accounts')
        .insert({
          user_id: session.user.id,
          platform,
          username,
          followers,
        })
        .select()
        .single()

      if (error) throw error

      setAccounts(prev => [data, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding account')
      throw err
    }
  }

  const updateAccount = async (id: string, updates: Partial<Pick<SocialAccount, 'username' | 'followers'>>) => {
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setAccounts(prev => prev.map(acc => acc.id === id ? data : acc))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating account')
      throw err
    }
  }

  const removeAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', id)

      if (error) throw error

      setAccounts(prev => prev.filter(acc => acc.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error removing account')
      throw err
    }
  }

  return {
    accounts,
    loading,
    error,
    addAccount,
    updateAccount,
    removeAccount,
    refetch: fetchAccounts,
  }
}