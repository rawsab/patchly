import React from 'react';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import ErrorMessage from './ErrorMessage';

type ScanResultTableProps = {
  result: any;
};

export default function ScanResultTable({ result }: ScanResultTableProps) {
  if (!result) return null;
  if (result.error) {
    return (
      <ErrorMessage
        error={
          <>
            <strong>Error:</strong> {result.error.message}
            {result.error.step && (
              <>
                <br />
                <strong>Step:</strong> {result.error.step}
              </>
            )}
          </>
        }
      />
    );
  }

  // Determine highest severity
  const getHighestSeverity = (results: any[]) => {
    if (!results || results.length === 0) return 'none';
    const severities = results.map((v) => v.severity);
    if (severities.includes('critical')) return 'critical';
    if (severities.includes('high')) return 'high';
    if (severities.includes('moderate')) return 'moderate';
    return 'none';
  };

  const highestSeverity = result.scan_results ? getHighestSeverity(result.scan_results) : 'none';

  const getShieldColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-red-500';
      case 'moderate':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="mt-2 mb-18 w-full flex flex-col items-center justify-center">
      <h2
        className="text-xl font-semibold mb-3 flex items-center gap-2 justify-center"
        style={{ letterSpacing: '-0.025em', color: '#202020' }}
      >
        <ShieldCheck size={22} className={getShieldColor(highestSeverity)} />
        Scan Result
      </h2>
      <div className="mb-3 text-center">
        <span
          className="inline-block rounded-full px-4 py-1.5 text-sm font-medium border bg-[#f3f5ff80] border-[#d1d5e8b8] text-[#4C4E5B]"
          style={{ letterSpacing: '-0.025em' }}
        >
          <strong>Language:</strong>{' '}
          {result.language === 'nodejs'
            ? 'JavaScript (NodeJS)'
            : result.language === 'python'
              ? 'Python'
              : result.language}
        </span>
      </div>
      <div className="w-full flex flex-col items-center justify-center">
        {result.scan_results && result.scan_results.length > 0 ? (
          <div className="overflow-x-auto mt-2 w-full flex justify-center">
            <div className="w-full rounded-2xl border border-[#D1D5E8] bg-[#F3F5FF] p-2">
              <table
                className="w-full bg-transparent text-left"
                style={{ letterSpacing: '-0.025em' }}
              >
                <thead>
                  <tr className="border-b border-gray-300">
                    <th
                      className="px-3 py-2 font-bold"
                      style={{ minWidth: '140px', maxWidth: '250px', width: 'auto' }}
                    >
                      CVE ID
                    </th>
                    <th className="px-3 py-2 font-bold">Package</th>
                    <th className="px-3 py-2 font-bold min-w-[110px]">Severity</th>
                    <th className="px-3 py-2 font-bold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {result.scan_results.map((vuln: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-300 last:border-b-0">
                      <td
                        className="px-3 py-2 font-semibold text-blue-700 align-top"
                        style={{
                          minWidth: result.language === 'python' ? '170px' : '120px',
                          maxWidth: '250px',
                          width: 'auto',
                        }}
                      >
                        {vuln.references && vuln.references.length > 0 ? (
                          <a
                            href={vuln.references[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-700 inline-flex items-center gap-1 group"
                            style={{ textDecoration: 'none' }}
                          >
                            <ArrowUpRight
                              size={16}
                              className="mr-1 transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1"
                              color="#687BED"
                            />
                            <span
                              style={{
                                fontFamily: 'IBM Plex Mono, monospace',
                                fontSize: '0.93em',
                                color: '#687BED',
                              }}
                            >
                              {vuln.cve_id}
                            </span>
                          </a>
                        ) : (
                          <span
                            style={{
                              fontFamily: 'IBM Plex Mono, monospace',
                              fontSize: '0.93em',
                              color: '#7A86CE',
                            }}
                          >
                            {vuln.cve_id}
                          </span>
                        )}
                      </td>
                      <td
                        className="px-3 py-2 align-top"
                        style={{
                          wordBreak: 'break-word',
                          hyphens: 'auto',
                          minWidth: '145px',
                          maxWidth: '300px',
                          whiteSpace: 'normal',
                        }}
                      >
                        {vuln.package}
                      </td>
                      <td className="px-3 py-2 align-top min-w-[110px]">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium border
                            ${
                              vuln.severity === 'critical'
                                ? 'bg-red-100 text-red-700 border-red-300'
                                : vuln.severity === 'high'
                                  ? 'bg-red-50 text-red-500 border-red-200'
                                  : vuln.severity === 'moderate'
                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    : 'bg-gray-100 text-gray-700 border-gray-300'
                            }
                          `}
                          style={{ letterSpacing: '-0.025em' }}
                        >
                          {vuln.severity}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm align-top">{vuln.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-green-700 mt-2 text-center">No vulnerabilities found.</div>
        )}
      </div>
    </div>
  );
}
