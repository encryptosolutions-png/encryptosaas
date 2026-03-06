export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      return Response.json({
        status: 'error',
        message: 'Missing Supabase credentials',
      })
    }

    // Test Supabase connectivity
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: key,
      },
    })

    return Response.json({
      status: 'ok',
      supabaseUrl: url,
      keySet: !!key,
      supabaseResponse: response.status,
    })
  } catch (error) {
    return Response.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Connection test failed',
    })
  }
}
