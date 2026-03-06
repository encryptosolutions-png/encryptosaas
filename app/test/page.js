'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function Test() {
  const [message, setMessage] = useState('Testing...')

  useEffect(() => {
    async function test() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          setMessage('❌ ' + error.message)
        } else {
          setMessage('✅ Supabase connected!')
        }
      } catch (err) {
        setMessage('❌ ' + err.message)
      }
    }
    test()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Import Test</h1>
      <p>{message}</p>
    </div>
  )
}