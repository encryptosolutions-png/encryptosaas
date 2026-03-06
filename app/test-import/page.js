'use client'

import { useEffect, useState } from 'react'

export default function TestImport() {
  const [status, setStatus] = useState('Testing import...')

  useEffect(() => {
    // dynamically import so we can catch configuration errors thrown at load time
    ;(async () => {
      try {
        const { supabase } = await import('@/lib/supabase/client')
        if (supabase) {
          setStatus('✅ Import successful! supabase object exists')
        } else {
          setStatus('❌ Import failed: supabase is undefined')
        }
      } catch (error) {
        setStatus('❌ Error: ' + error.message)
      }
    })()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Import Test</h1>
      <p>{status}</p>
    </div>
  )
}