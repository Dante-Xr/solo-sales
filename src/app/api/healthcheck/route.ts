/**
 * Health check API endpoint for debugging 502 errors
 */

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const checks = {
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? '✅ Configured' : '❌ Missing',
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? '✅ Configured' : '❌ Missing',
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? '✅ Configured' : '❌ Missing',
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? '✅ Configured' : '❌ Missing',
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ? '✅ Configured' : '❌ Missing',
      },
      timestamp: new Date().toISOString(),
      status: 'ok'
    }

    return NextResponse.json(checks, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
