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
      <p>Check the API endpoint: <a href="/zh/healthcheck">/zh/healthcheck</a></p>
      <p>Current time: {new Date().toISOString()}</p>
    </div>
  )
}
