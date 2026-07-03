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
      <p>Check the API endpoint: <a href="/api/healthcheck" target="_blank">/api/healthcheck</a></p>
      <p>Current time: {new Date().toISOString()}</p>
      <hr style={{ margin: '20px 0' }} />
      <h2>Next Steps:</h2>
      <ol>
        <li>Click the API link above to check environment variables</li>
        <li>If all variables show ✅, try visiting the <a href="/zh">home page</a></li>
        <li>If variables show ❌, configure them in Netlify dashboard</li>
      </ol>
    </div>
  )
}
