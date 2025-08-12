// Patchly - Detects security issues in GitHub repos.
// Copyright (C) 2025  Rawsab Said
// This file is part of Patchly and is licensed under the
// GNU General Public License v3.0. See LICENSE for details.

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  Filter,
  ChevronUp,
  ChevronDown,
  ListFilter,
  CheckCircle2,
  Sparkles,
  Loader2,
  Plus,
} from 'lucide-react';
import ErrorMessage from './ErrorMessage';
import { getSeverityWeight } from '../utils/severityMap';
import { generateAIFix } from '../utils/aiFixGenerator';
import ApiKeyModal from './ApiKeyModal';
import { saveApiKey, hasApiKey } from '../utils/apiKeyManager';
import toast from 'react-hot-toast';

type ScanResultTableProps = {
  result: any;
};

type SortDirection = 'asc' | 'desc' | null;
type SortColumn = 'cve_id' | 'package' | 'severity' | 'description' | null;

// Cache for AI fixes
const aiFixCache = new Map<string, { fixes: string; workarounds: string }>();

// Session cache keys
const AI_FIX_CACHE_KEY = 'ai_fixes_cache';

// Types for our cache
type AIFixCache = {
  [url: string]: {
    timestamp: number;
    fixes: string;
    workarounds: string;
  };
};

const fadeInAnimation = {
  initial: { opacity: 0, y: 5 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 5 },
  transition: { duration: 0.2 },
};

export default function ScanResultTable({ result }: ScanResultTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [expandedCveId, setExpandedCveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiFix, setAIFix] = useState<{ fixes: string; workarounds: string } | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const prevResultRef = useRef<any>(null);

  // Load AI fixes from session cache on mount
  useEffect(() => {
    try {
      const cachedFixes = sessionStorage.getItem(AI_FIX_CACHE_KEY);
      if (cachedFixes) {
        const parsedCache: AIFixCache = JSON.parse(cachedFixes);
        // Convert cache back to Map
        Object.entries(parsedCache).forEach(([url, data]) => {
          aiFixCache.set(url, {
            fixes: data.fixes,
            workarounds: data.workarounds,
          });
        });
      }
    } catch (error) {
      console.error('Error loading AI fixes from cache:', error);
    }
  }, []);

  // Save AI fixes to session cache when they change
  useEffect(() => {
    try {
      const cacheObject: AIFixCache = {};
      aiFixCache.forEach((value, key) => {
        cacheObject[key] = {
          timestamp: Date.now(),
          fixes: value.fixes,
          workarounds: value.workarounds,
        };
      });
      sessionStorage.setItem(AI_FIX_CACHE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Error saving AI fixes to cache:', error);
    }
  }, [aiFixCache]);

  // Only scroll when new scan results arrive
  useEffect(() => {
    if (result && resultRef.current && result !== prevResultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      prevResultRef.current = result;
    }
  }, [result]);

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

  const handleApiKeySave = (apiKey: string) => {
    if (saveApiKey(apiKey)) {
      toast.success('API key saved successfully');
    } else {
      toast.error('Failed to save API key');
    }
  };

  const handleSparkleClick = async (cveId: string, cveUrl: string) => {
    if (!hasApiKey()) {
      toast.error('Please add your API key first');
      setIsApiKeyModalOpen(true);
      return;
    }

    if (expandedCveId === cveId) {
      setExpandedCveId(null);
      setAIFix(null);
      return;
    }

    setExpandedCveId(cveId);

    // Check cache first
    const cachedFix = aiFixCache.get(cveUrl);
    if (cachedFix) {
      setAIFix(cachedFix);
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateAIFix(cveUrl);
      // Store in cache
      aiFixCache.set(cveUrl, result);
      setAIFix(result);
    } catch (error) {
      console.error('Error generating AI fix:', error);
      const errorResponse = {
        fixes: 'Unable to generate fix suggestions at this time.',
        workarounds: 'Please check the CVE details for manual workarounds.',
      };
      // Store error response in cache to prevent repeated failed requests
      aiFixCache.set(cveUrl, errorResponse);
      setAIFix(errorResponse);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={resultRef}
      className="mt-6 mb-18 w-full flex flex-col items-center justify-center scroll-mt-26"
    >
      <h2
        className="text-xl font-semibold mb-3 flex items-center gap-2 justify-center transition-colors duration-200"
        style={{ 
          letterSpacing: '-0.025em', 
          color: 'var(--text-primary)' 
        }}
      >
        <ShieldAlert size={22} className={getShieldColor(highestSeverity)} />
        Scan Result
      </h2>
      <div className="mb-3 text-center">
        <span
          className="inline-block rounded-full px-4 py-1.5 text-sm font-medium border transition-colors duration-200"
          style={{ 
            letterSpacing: '-0.025em',
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            color: 'var(--text-secondary)'
          }}
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
          <div className="overflow-x-auto mt-2 w-full flex justify-center relative">
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="absolute right-2 top-[8px] flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors z-10 border rounded-lg cursor-pointer"
              style={{
                color: document.documentElement.classList.contains('dark') ? '#AFBAFF' : '#687BED',
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
              }}
            >
              <Plus size={16} />
              Add API Key
            </button>
            <div 
              className="w-full rounded-2xl border p-2 transition-colors duration-200"
              style={{
                borderColor: 'var(--card-border)',
                backgroundColor: 'var(--card-bg)'
              }}
            >
              <div className="w-full overflow-hidden">
                <table
                  className="w-full bg-transparent text-left table-fixed transition-colors duration-200"
                  style={{ 
                    letterSpacing: '-0.025em',
                    color: 'var(--text-primary)'
                  }}
                >
                  <thead>
                    <tr className="border-b transition-colors duration-200" style={{ borderColor: 'var(--card-border)' }}>
                      <th
                        className="px-3 py-2 font-bold cursor-pointer transition-all duration-200 hover:opacity-60"
                        style={{
                          width: result.language === 'python' ? '170px' : '120px',
                          color: 'var(--text-primary)',
                          backgroundColor: 'var(--card-bg)'
                        }}
                        onClick={() => handleSort('cve_id')}
                      >
                        <div className="flex items-center gap-2">
                          CVE ID
                          {getSortIcon('cve_id')}
                        </div>
                      </th>
                      <th
                        className="px-3 py-2 font-bold cursor-pointer transition-all duration-200 hover:opacity-60"
                        style={{ 
                          width: '145px',
                          color: 'var(--text-primary)',
                          backgroundColor: 'var(--card-bg)'
                        }}
                        onClick={() => handleSort('package')}
                      >
                        <div className="flex items-center gap-2">
                          Package
                          {getSortIcon('package')}
                        </div>
                      </th>
                      <th
                        className="px-3 py-2 font-bold cursor-pointer transition-all duration-200 hover:opacity-60"
                        style={{ 
                          width: '110px',
                          color: 'var(--text-primary)',
                          backgroundColor: 'var(--card-bg)'
                        }}
                        onClick={() => handleSort('severity')}
                      >
                        <div className="flex items-center gap-2">
                          Severity
                          {getSortIcon('severity')}
                        </div>
                      </th>
                      <th
                        className="px-3 py-2 font-bold cursor-pointer transition-all duration-200 hover:opacity-60"
                        style={{ 
                          width: '400px',
                          color: 'var(--text-primary)',
                          backgroundColor: 'var(--card-bg)'
                        }}
                        onClick={() => handleSort('description')}
                      >
                        <div className="flex items-center gap-2">
                          Description
                          {getSortIcon('description')}
                        </div>
                      </th>
                      <th style={{ width: '48px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedResults.map((vuln: any, index: number) => (
                      <React.Fragment key={vuln.cve_id}>
                        <tr
                          className={
                            expandedCveId === vuln.cve_id
                              ? ''
                              : index < sortedResults.length - 1
                                ? 'border-b transition-colors duration-200'
                                : ''
                          }
                          style={{
                            borderColor: expandedCveId === vuln.cve_id
                              ? 'transparent'
                              : index < sortedResults.length - 1
                                ? 'var(--card-border)'
                                : 'transparent'
                          }}
                        >
                          <td
                            className="px-3 py-2 font-semibold align-top transition-colors duration-200"
                            style={{
                              width: result.language === 'python' ? '170px' : '120px',
                              color: document.documentElement.classList.contains('dark') ? '#AFBAFF' : '#687BED'
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
                                  color={document.documentElement.classList.contains('dark') ? '#AFBAFF' : '#687BED'}
                                />
                                <span
                                  style={{
                                    fontFamily: 'IBM Plex Mono, monospace',
                                    fontSize: '0.93em',
                                    color: document.documentElement.classList.contains('dark') ? '#AFBAFF' : '#687BED',
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
                            className="px-3 py-2 align-top transition-colors duration-200"
                            style={{
                              width: '145px',
                              wordBreak: 'break-word',
                              hyphens: 'auto',
                              whiteSpace: 'normal',
                              color: 'var(--text-primary)'
                            }}
                          >
                            {vuln.package}
                          </td>
                          <td className="px-3 py-2 align-top" style={{ width: '110px' }}>
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-xs font-medium border transition-colors duration-200`}
                              style={{ 
                                letterSpacing: '-0.025em',
                                ...(vuln.severity === 'critical'
                                  ? document.documentElement.classList.contains('dark')
                                    ? { backgroundColor: '#370E0E', color: '#FECACA', borderColor: '#471919' }
                                    : { backgroundColor: '#FEE2E2', color: '#DC2626', borderColor: '#FCA5A5' }
                                  : vuln.severity === 'high'
                                    ? document.documentElement.classList.contains('dark')
                                      ? { backgroundColor: '#371C1C', color: '#FCA5A5', borderColor: '#4B2B2B' }
                                      : { backgroundColor: '#FEF2F2', color: '#EF4444', borderColor: '#FECACA' }
                                    : vuln.severity === 'moderate'
                                      ? document.documentElement.classList.contains('dark')
                                        ? { backgroundColor: '#392A13', color: '#FED7AA', borderColor: '#513C1B' }
                                        : { backgroundColor: '#FFFBEB', color: '#D97706', borderColor: '#FDE68A' }
                                      : document.documentElement.classList.contains('dark')
                                        ? { backgroundColor: '#27303F', color: '#D1D5DB', borderColor: '#3A4351' }
                                        : { backgroundColor: '#F3F4F6', color: '#374151', borderColor: '#D1D5DB' }
                                )
                              }}
                            >
                              {vuln.severity}
                            </span>
                          </td>
                          <td 
                            className="px-3 py-2 text-sm align-top transition-colors duration-200" 
                            style={{ 
                              width: '400px',
                              color: 'var(--text-primary)'
                            }}
                          >
                            {vuln.description}
                          </td>
                          <td style={{ width: '48px' }} className="px-3 py-2 align-top">
                            <button
                              className={`p-1.5 rounded-lg transition-colors ${
                                vuln.references && vuln.references.length > 0
                                  ? document.documentElement.classList.contains('dark') 
                                    ? 'hover:bg-[#101013] cursor-pointer'
                                    : 'hover:bg-[#E3E7FE] cursor-pointer'
                                  : 'cursor-not-allowed opacity-40'
                              }`}
                              disabled={!vuln.references || vuln.references.length === 0}
                              onClick={() => handleSparkleClick(vuln.cve_id, vuln.references[0])}
                            >
                              <Sparkles
                                size={18}
                                className={`${
                                  vuln.references && vuln.references.length > 0
                                    ? document.documentElement.classList.contains('dark') ? 'text-[#AFBAFF]' : 'text-[#687BED]'
                                    : 'text-gray-400'
                                }`}
                              />
                            </button>
                          </td>
                        </tr>
                        <AnimatePresence>
                          {expandedCveId === vuln.cve_id && (
                            <tr>
                              <td colSpan={5} className="px-3 pt-0 pb-4 border-b transition-colors duration-200" style={{ borderColor: 'var(--card-border)' }}>
                                <motion.div
                                  key="expandable"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <motion.div
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -10, opacity: 0 }}
                                    transition={{ delay: 0.1, duration: 0.2 }}
                                    className="rounded-xl border p-4 transition-colors duration-200"
                                    style={{
                                      backgroundColor: 'var(--card-bg)',
                                      borderColor: 'var(--card-border)'
                                    }}
                                  >
                                    <div className="flex items-center gap-2 mb-3">
                                      <Sparkles 
                                        size={18} 
                                        className={document.documentElement.classList.contains('dark') ? 'text-[#AFBAFF]' : 'text-[#687BED]'} 
                                      />
                                      <h3 className="font-semibold transition-colors duration-200" style={{ color: 'var(--text-primary)' }}>Fix with AI</h3>
                                    </div>
                                    <AnimatePresence mode="wait">
                                      {isLoading ? (
                                        <motion.div
                                          key="loading"
                                          {...fadeInAnimation}
                                          className="flex items-center gap-2 transition-colors duration-200"
                                          style={{ color: 'var(--text-secondary)' }}
                                        >
                                          <Loader2 size={16} className="animate-spin" />
                                          Generating fix suggestions...
                                        </motion.div>
                                      ) : aiFix ? (
                                        <motion.div
                                          key="content"
                                          {...fadeInAnimation}
                                          className="space-y-3"
                                        >
                                          <div>
                                            <h4 className="font-medium mb-1 transition-colors duration-200" style={{ color: 'var(--text-primary)' }}>
                                              Fixes:
                                            </h4>
                                            <p className="transition-colors duration-200" style={{ color: 'var(--text-secondary)' }}>{aiFix.fixes}</p>
                                          </div>
                                          <div>
                                            <h4 className="font-medium mb-1 transition-colors duration-200" style={{ color: 'var(--text-primary)' }}>
                                              Workarounds:
                                            </h4>
                                            <p className="transition-colors duration-200" style={{ color: 'var(--text-secondary)' }}>{aiFix.workarounds}</p>
                                          </div>
                                        </motion.div>
                                      ) : (
                                        <motion.p
                                          key="empty"
                                          {...fadeInAnimation}
                                          className="transition-colors duration-200"
                                          style={{ color: 'var(--text-secondary)' }}
                                        >
                                          Click the sparkle icon to generate AI fix suggestions.
                                        </motion.p>
                                      )}
                                    </AnimatePresence>
                                  </motion.div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-green-700 mt-4 text-center flex items-center justify-center gap-2">
            <CheckCircle2 size={18} />
            No vulnerabilities found.
          </div>
        )}
      </div>
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleApiKeySave}
      />
    </div>
  );
}
