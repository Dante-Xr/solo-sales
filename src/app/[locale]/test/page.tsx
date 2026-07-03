/**
 * Minimal test page - no database, no external services
 */

export default function TestPage() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
      <h1>✅ Minimal Test Page</h1>
      <p>If you see this, Next.js server-side rendering works!</p>
      <p>Server time: {new Date().toISOString()}</p>
      <hr />
      <h2>Test Links:</h2>
      <ul>
        <li><a href="/api/healthcheck">Health Check API</a></li>
        <li><a href="/zh/healthcheck">Health Check Page</a></li>
        <li><a href="/zh">Home Page (may fail if DB issue)</a></li>
      </ul>
    </div>
  )
}
