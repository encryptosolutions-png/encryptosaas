import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/dashboard/security/account-protection?info=internal_mode_enabled', request.url))
}
