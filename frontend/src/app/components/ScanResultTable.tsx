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
  return (
    <div className="mt-8 mb-18 w-full flex flex-col items-center justify-center">
      <h2
        className="text-xl font-semibold mb-4 flex items-center gap-2 justify-center"
        style={{ letterSpacing: '-0.025em', color: '#202020' }}
      >
        <ShieldCheck size={22} className="text-blue-600" />
        Scan Result
      </h2>
      <div className="mb-4 text-center">
        <strong>Language:</strong> <span className="text-gray-700">{result.language}</span>
      </div>
      <div className="w-full flex flex-col items-center justify-center">
        <strong className="text-center">Vulnerabilities:</strong>
        {result.scan_results && result.scan_results.length > 0 ? (
          <div className="overflow-x-auto mt-2 w-full flex justify-center">
            <div className="w-full rounded-2xl border border-[#D1D5E8] bg-[#F3F5FF] p-2">
              <table
                className="w-full bg-transparent text-left"
                style={{ letterSpacing: '-0.025em' }}
              >
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="px-3 py-2 font-bold min-w-[120px]">CVE ID</th>
                    <th className="px-3 py-2 font-bold">Package</th>
                    <th className="px-3 py-2 font-bold min-w-[110px]">Severity</th>
                    <th className="px-3 py-2 font-bold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {result.scan_results.map((vuln: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-300 last:border-b-0">
                      <td className="px-3 py-2 font-semibold text-blue-700 align-top">
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
                      <td className="px-3 py-2 align-top">{vuln.package}</td>
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
