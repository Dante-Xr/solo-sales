/**
 * Minimal test page - no database, no external services
 */

import Link from "next/link"

export default function TestPage() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
      <h1>✅ Minimal Test Page</h1>
      <p>If you see this, Next.js server-side rendering works!</p>
      <p>Server time: {new Date().toISOString()}</p>
      <hr />
      <h2>Test Links:</h2>
      <ul>
        <li><Link href="/api/healthcheck">Health Check API</Link></li>
        <li><Link href="/zh/healthcheck">Health Check Page</Link></li>
        <li><Link href="/zh">Home Page (may fail if DB issue)</Link></li>
      </ul>
    </div>
  )
}
