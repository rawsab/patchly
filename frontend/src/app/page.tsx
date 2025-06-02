'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import CveInfoPill from './components/CveInfoPill';
import HeroTitle from './components/HeroTitle';
import RepoScanForm from './components/RepoScanForm';
import ScanResultTable from './components/ScanResultTable';
import ErrorMessage from './components/ErrorMessage';
import Navbar from './components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const SCAN_CACHE_KEY = 'scan_results_cache';

type ScanCache = {
  [url: string]: {
    timestamp: number;
    result: any;
  };
};

const variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
  floating: {
    y: [0, -6, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Check cache first
      const cachedScans = sessionStorage.getItem(SCAN_CACHE_KEY);
      if (cachedScans) {
        const scanCache: ScanCache = JSON.parse(cachedScans);
        const cachedResult = scanCache[repoUrl];

        if (cachedResult) {
          // Check if cache is still valid (less than 24 hours old)
          const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
          if (cachedResult.timestamp > oneDayAgo) {
            console.log('Using cached scan result');
            setResult(cachedResult.result);
            setLoading(false);
            return;
          }
        }
      }

      // If no cache or expired, make API call
      const res = await fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl }),
      });
      const data = await res.json();
      setResult(data);

      // Save to cache
      try {
        const scanCache: ScanCache = cachedScans ? JSON.parse(cachedScans) : {};
        scanCache[repoUrl] = {
          timestamp: Date.now(),
          result: data,
        };

        // Clean up old entries (older than 24 hours)
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        Object.entries(scanCache).forEach(([url, data]) => {
          if (data.timestamp < oneDayAgo) {
            delete scanCache[url];
          }
        });

        sessionStorage.setItem(SCAN_CACHE_KEY, JSON.stringify(scanCache));
      } catch (error) {
        console.error('Error saving scan results to cache:', error);
      }
    } catch (err) {
      setError('Failed to connect to backend. Please try again in a few minutes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#E3E7FE] text-[#202020] overflow-x-hidden">
      <Navbar />
      {/* Background image at the top */}
      <img
        src="/background/header_light.png"
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute top-0 left-0 w-full z-0"
        style={{ objectFit: 'cover' }}
      />
      <div className="w-full max-w-[952px] p-6 flex flex-col items-center justify-center mx-auto relative z-10 pt-20">
        <div className={`w-full${!result ? ' flex flex-col justify-center min-h-[60vh]' : ''}`}>
          <motion.div
            initial="hidden"
            animate={result || loading ? 'visible' : ['visible', 'floating']}
            variants={variants}
          >
            <CveInfoPill />
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={{ delay: 0.2 }}
          >
            <HeroTitle />
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={{ delay: 0.4 }}
          >
            <RepoScanForm
              repoUrl={repoUrl}
              setRepoUrl={setRepoUrl}
              loading={loading}
              handleSubmit={handleSubmit}
            />
          </motion.div>
          {!result && (
            <motion.p
              className="text-sm text-[#B5B5C8] text-center flex items-center justify-center gap-1.5"
              style={{ letterSpacing: '-0.025em' }}
              initial="hidden"
              animate="visible"
              variants={variants}
              transition={{ delay: 0.5 }}
            >
              <Info size={14} className="text-[#B5B5C8]" />
              Currently supports Python and NodeJS repositories.
            </motion.p>
          )}
          <ErrorMessage error={error} />
        </div>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ScanResultTable result={result} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
