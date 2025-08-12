// Patchly - Detects security issues in GitHub repos.
// Copyright (C) 2025  Rawsab Said
// This file is part of Patchly and is licensed under the
// GNU General Public License v3.0. See LICENSE for details.

'use client';
import React, { useState, useRef, useEffect } from 'react';
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const exampleDelayRef = useRef(false);

  // Check for dark mode on mount and listen for changes
  useEffect(() => {
    const updateDarkMode = () => {
      const savedDarkMode = localStorage.getItem('darkMode');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedDarkMode !== null) {
        setIsDarkMode(savedDarkMode === 'true');
      } else {
        setIsDarkMode(prefersDark);
      }
    };

    // Initial check
    updateDarkMode();

    // Listen for storage changes (when dark mode is toggled in Navbar)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'darkMode') {
        updateDarkMode();
      }
    };

    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab changes)
    const handleDarkModeChange = () => {
      updateDarkMode();
    };

    window.addEventListener('darkModeChange', handleDarkModeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('darkModeChange', handleDarkModeChange);
    };
  }, []);

  // Trigger image fade-in after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setImageLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

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
            if (repoUrl === 'https://github.com/vulnerable-apps/vulnerable-rest-api') {
              exampleDelayRef.current = true;
              // Simulate a scan delay for the example repo
              setTimeout(() => {
                setResult(cachedResult.result);
                setLoading(false);
                exampleDelayRef.current = false;
              }, 2000); // 2 seconds delay
              return;
            } else {
              setResult(cachedResult.result);
              setLoading(false);
              return;
            }
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
      // Only set loading to false if not in the example delay
      if (!exampleDelayRef.current) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden transition-colors duration-200" style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-primary)' }}>
      <Navbar />
      {/* Background image at the top */}
      <motion.img
        src={isDarkMode ? "/background/header_dark.png" : "/background/header_light.png"}
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute top-0 left-0 w-full z-0"
        style={{ objectFit: 'cover' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: imageLoaded ? 1 : 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
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
          {!result && !error && (
            <motion.p
              className="text-sm text-center flex items-center justify-center gap-1.5 transition-colors duration-200"
              style={{ 
                letterSpacing: '-0.025em',
                color: 'var(--text-muted)'
              }}
              initial="hidden"
              animate="visible"
              variants={variants}
              transition={{ delay: 0.5 }}
            >
              <Info size={14} style={{ color: 'var(--text-muted)' }} />
              Currently supports Python, Go, Java, NodeJS and .NET repositories.
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
