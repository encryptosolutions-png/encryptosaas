import { NextRequest, NextResponse } from 'next/server'
import { getScamDetector } from '@/lib/scamDetector'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message too long (max 5000 characters)' },
        { status: 400 }
      )
    }

    // Analyze the message using local ML model
    const detector = getScamDetector()
    const analysis = detector.analyzeMessage(message)

    return NextResponse.json({
      ...analysis,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Scam detection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
