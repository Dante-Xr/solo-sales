/**
 * Simple test page to diagnose 502 errors
 */

export default function HealthPage() {
  return (
    <div style={{
      padding: '40px',
      fontFamily: 'monospace',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>🏥 Health Check</h1>
      <p>If you can see this page, Next.js routing is working.</p>
      <p>Check the API endpoint: <Link href="/api/healthcheck" target="_blank">/api/healthcheck</Link></p>
      <p>Current time: {new Date().toISOString()}</p>
      <hr style={{ margin: '20px 0' }} />
      <h2>Next Steps:</h2>
      <ol>
        <li>Click the API link above to check environment variables</li>
        <li>If all variables show ✅, try visiting the <Link href="/zh">home page</Link></li>
        <li>If variables show ❌, configure them in Netlify dashboard</li>
      </ol>
    </div>
  )
}
import Link from "next/link"
