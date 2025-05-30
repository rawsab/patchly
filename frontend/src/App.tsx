import React, { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [repoUrl, setRepoUrl] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl }),
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError('Failed to connect to backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: 24 }}>
      <h1>Codebase Security Auditor</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input
          type="text"
          value={repoUrl}
          onChange={e => setRepoUrl(e.target.value)}
          placeholder="GitHub repo URL"
          style={{ width: '80%', padding: 8 }}
          required
        />
        <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>
          {loading ? 'Scanning...' : 'Scan'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 24 }}>
          <h2>Scan Result</h2>
          {result.error ? (
            <div style={{ color: 'red' }}>
              <strong>Error:</strong> {result.error.message}
              <br />
              <em>Step: {result.error.step}</em>
            </div>
          ) : (
            <>
              <div>
                <strong>Language:</strong> {result.language}
              </div>
              <div style={{ marginTop: 16 }}>
                <strong>Vulnerabilities:</strong>
                {result.scan_results && result.scan_results.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid #ccc', padding: 8 }}>CVE ID</th>
                        <th style={{ border: '1px solid #ccc', padding: 8 }}>Package</th>
                        <th style={{ border: '1px solid #ccc', padding: 8 }}>Severity</th>
                        <th style={{ border: '1px solid #ccc', padding: 8 }}>Description</th>
                        <th style={{ border: '1px solid #ccc', padding: 8 }}>Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.scan_results.map((vuln: any, idx: number) => (
                        <tr key={idx}>
                          <td style={{ border: '1px solid #ccc', padding: 8 }}><strong>{vuln.cve_id}</strong></td>
                          <td style={{ border: '1px solid #ccc', padding: 8 }}>{vuln.package}</td>
                          <td style={{ border: '1px solid #ccc', padding: 8 }}>{vuln.severity}</td>
                          <td style={{ border: '1px solid #ccc', padding: 8 }}>{vuln.description}</td>
                          <td style={{ border: '1px solid #ccc', padding: 8 }}>
                            {vuln.references && vuln.references.length > 0 ? (
                              <a href={vuln.references[0]} target="_blank" rel="noopener noreferrer">
                                Link
                              </a>
                            ) : (
                              'N/A'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div>No vulnerabilities found.</div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
