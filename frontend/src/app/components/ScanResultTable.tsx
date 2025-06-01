import React, { useState } from 'react';
import {
  ShieldCheck,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  Filter,
  ChevronUp,
  ChevronDown,
  ListFilter,
} from 'lucide-react';
import ErrorMessage from './ErrorMessage';
import { getSeverityWeight } from '../utils/severityMap';

type ScanResultTableProps = {
  result: any;
};

type SortDirection = 'asc' | 'desc' | null;
type SortColumn = 'cve_id' | 'package' | 'severity' | 'description' | null;

export default function ScanResultTable({ result }: ScanResultTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

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

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to descending
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (column: SortColumn) => {
    return (
      <div className="relative w-4 h-4">
        <div
          className={`absolute inset-0 transition-all duration-200 ${sortColumn === column ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <div
            className={`transition-transform duration-200 ${sortDirection === 'asc' ? 'rotate-0' : '-rotate-180'}`}
          >
            <ChevronDown size={16} />
          </div>
        </div>
        <div
          className={`absolute inset-0 transition-all duration-200 ${sortColumn === column ? 'opacity-0 scale-95' : 'opacity-40 scale-100'}`}
        >
          <ListFilter size={16} />
        </div>
      </div>
    );
  };

  const sortedResults = result.scan_results
    ? [...result.scan_results].sort((a, b) => {
        if (!sortColumn || !sortDirection) return 0;

        let comparison = 0;
        switch (sortColumn) {
          case 'cve_id':
            comparison = String(a.cve_id || '').localeCompare(String(b.cve_id || ''));
            break;
          case 'package':
            comparison = String(a.package || '').localeCompare(String(b.package || ''));
            break;
          case 'severity':
            const severityA = getSeverityWeight(String(a.severity || ''));
            const severityB = getSeverityWeight(String(b.severity || ''));
            comparison = severityA - severityB;
            break;
          case 'description':
            comparison = String(a.description || '').localeCompare(String(b.description || ''));
            break;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      })
    : [];

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
                      className="px-3 py-2 font-bold cursor-pointer transition-colors hover:bg-gradient-to-b hover:from-[#F3F5FF] hover:to-white"
                      style={{
                        minWidth: result.language === 'python' ? '170px' : '120px',
                        maxWidth: '250px',
                        width: 'auto',
                      }}
                      onClick={() => handleSort('cve_id')}
                    >
                      <div className="flex items-center gap-2">
                        CVE ID
                        {getSortIcon('cve_id')}
                      </div>
                    </th>
                    <th
                      className="px-3 py-2 font-bold cursor-pointer transition-colors hover:bg-gradient-to-b hover:from-[#F3F5FF] hover:to-white"
                      onClick={() => handleSort('package')}
                    >
                      <div className="flex items-center gap-2">
                        Package
                        {getSortIcon('package')}
                      </div>
                    </th>
                    <th
                      className="px-3 py-2 font-bold cursor-pointer transition-colors hover:bg-gradient-to-b hover:from-[#F3F5FF] hover:to-white min-w-[110px]"
                      onClick={() => handleSort('severity')}
                    >
                      <div className="flex items-center gap-2">
                        Severity
                        {getSortIcon('severity')}
                      </div>
                    </th>
                    <th
                      className="px-3 py-2 font-bold cursor-pointer transition-colors hover:bg-gradient-to-b hover:from-[#F3F5FF] hover:to-white"
                      onClick={() => handleSort('description')}
                    >
                      <div className="flex items-center gap-2">
                        Description
                        {getSortIcon('description')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((vuln: any, idx: number) => (
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
