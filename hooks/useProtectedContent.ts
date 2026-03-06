import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface ProtectedContent {
  id: string
  user_id: string
  content_url: string
  platform: string
  created_at: string
}

export function useProtectedContent() {
  const [content, setContent] = useState<ProtectedContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContent = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setContent([])
        return
      }

      const { data, error } = await supabase
        .from('protected_content')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setContent(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContent()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchContent()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const addContent = async (contentUrl: string, platform: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      // Validate URL
      new URL(contentUrl)

      const { data, error } = await supabase
        .from('protected_content')
        .insert({
          user_id: session.user.id,
          content_url: contentUrl,
          platform,
        })
        .select()
        .single()

      if (error) throw error

      setContent(prev => [data, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding content')
      throw err
    }
  }

  const removeContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('protected_content')
        .delete()
        .eq('id', id)

      if (error) throw error

      setContent(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error removing content')
      throw err
    }
  }

  return {
    content,
    loading,
    error,
    addContent,
    removeContent,
    refetch: fetchContent,
  }
}