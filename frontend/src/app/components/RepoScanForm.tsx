// Patchly - Detects security issues in GitHub repos.
// Copyright (C) 2025  Rawsab Said
// This file is part of Patchly and is licensed under the
// GNU General Public License v3.0. See LICENSE for details.

import React, { useState, useRef } from 'react';
import { Search, ArrowRight, HelpCircle } from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';

type RepoScanFormProps = {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
};

const isValidGithubUrl = (url: string): boolean => {
  try {
    // Convert www. to https:// if needed
    if (url.startsWith('www.')) {
      url = 'https://' + url.replace('www.', '');
    }

    // Check if it starts with https://
    if (!url.startsWith('https://')) {
      return false;
    }

    // Check for concatenated URLs (multiple https://)
    if ((url.match(/https:\/\//g) || []).length > 1) {
      return false;
    }

    const urlObj = new URL(url);
    // Convert www.github.com to github.com
    const hostname = urlObj.hostname.replace('www.github.com', 'github.com');
    const pathParts = urlObj.pathname.split('/').filter((part) => part !== '');

    // Check if it's a GitHub URL and has username/repo
    if (hostname !== 'github.com' || pathParts.length < 2) {
      return false;
    }

    // Get the repository name (last part)
    const repoName = pathParts[pathParts.length - 1];

    // GitHub repository name rules:
    // - Cannot start with a dot (.)
    // - Cannot start with a hyphen (-)
    // - Cannot contain consecutive dots (..)
    // - Cannot contain consecutive hyphens (--)
    // - Can only contain alphanumeric characters, hyphens, and dots
    // - Maximum length is 100 characters
    const validRepoNameRegex = /^(?!.*\.\.)(?!.*--)[a-zA-Z0-9][a-zA-Z0-9.-]{0,98}[a-zA-Z0-9]$/;

    return validRepoNameRegex.test(repoName);
  } catch {
    return false;
  }
};

const EXAMPLE_URL = 'https://github.com/vulnerable-apps/vulnerable-rest-api';
const SCAN_CACHE_KEY = 'scan_results_cache';

// Inject the example scan result into sessionStorage cache
async function injectExampleResult() {
  const cachedScans = sessionStorage.getItem(SCAN_CACHE_KEY);
  const scanCache = cachedScans ? JSON.parse(cachedScans) : {};
  if (scanCache[EXAMPLE_URL]) return; // Already cached
  const res = await fetch('/example_scan_result.json');
  const data = await res.json();
  scanCache[EXAMPLE_URL] = {
    timestamp: Date.now(),
    result: data,
  };
  sessionStorage.setItem(SCAN_CACHE_KEY, JSON.stringify(scanCache));
}

export default function RepoScanForm({
  repoUrl,
  setRepoUrl,
  loading,
  handleSubmit,
}: RepoScanFormProps) {
  const [isInvalid, setIsInvalid] = useState(false);
  const [isHelpHovered, setIsHelpHovered] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typewriterTimeout = useRef<NodeJS.Timeout | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let url = e.target.value;
    // Convert www. to https:// if needed
    if (url.startsWith('www.')) {
      url = 'https://' + url.replace('www.', '');
    }
    // Convert www.github.com to github.com
    if (url.includes('www.github.com')) {
      url = url.replace('www.github.com', 'github.com');
    }
    // Add https:// if it's a github.com URL without protocol
    if (url.startsWith('github.com/')) {
      url = 'https://' + url;
    }
    // If there are multiple https://, take only the first URL
    if ((url.match(/https:\/\//g) || []).length > 1) {
      url = url.split('https://')[1].split('https://')[0];
      url = 'https://' + url;
    }
    setRepoUrl(url);
    setIsInvalid(url !== '' && !isValidGithubUrl(url));
    if (url !== '' && !isValidGithubUrl(url)) {
      console.log('Invalid GitHub URL:', url);
    }
  };

  // Typewriter effect for example URL
  const handleExampleClick = async () => {
    if (isTyping || loading) return;
    setIsTyping(true);
    setRepoUrl('');
    setIsInvalid(false);
    await injectExampleResult();
    let i = 0;
    const type = () => {
      setRepoUrl(EXAMPLE_URL.slice(0, i));
      setIsInvalid(false);
      if (i < EXAMPLE_URL.length) {
        i++;
        typewriterTimeout.current = setTimeout(type, 10);
      } else {
        setIsTyping(false);
        // Submit the form after a short delay
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }
        }, 300);
      }
    };
    type();
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (typewriterTimeout.current) clearTimeout(typewriterTimeout.current);
    };
  }, []);

  return (
    <div className="w-full max-w-xl flex flex-col items-center justify-center mb-8 mx-auto">
      {/* Row: Search bar + Help icon */}
      <div className="flex w-full items-center gap-1">
        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 flex items-center">
          <div className="relative flex w-full items-center">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BABCCA]">
              <Search size={20} />
            </span>
            <input
              type="text"
              value={repoUrl}
              onChange={handleUrlChange}
              placeholder="Enter a GitHub URL here…"
              className={`flex-1 border rounded-2xl pr-32 pl-11 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#F3F5FF] border-[#D1D5E8] placeholder-[#BABCCA] text-base ${
                isInvalid ? 'border-[#E3AAAA] text-[#E36363]' : 'text-[#202020]'
              }`}
              style={{ paddingRight: loading ? '150px' : '110px' }}
              required
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={loading || isInvalid || isTyping}
              className={`absolute right-1 inset-y-1 flex items-center gap-2 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 ease-in-out ${
                loading
                  ? 'bg-[#DAE0FF] border border-[#D2D5E9] w-[140px] text-[#676F9B]'
                  : isInvalid
                    ? 'bg-gray-200 border border-gray-300 w-[100px] text-gray-500'
                    : 'bg-[#C2CBFF] border border-[#C0C5E6] w-[100px] text-[#202020] hover:bg-[#AAB8FF]'
              }`}
            >
              {loading ? (
                <span
                  style={{
                    letterSpacing: '-0.025em',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <FaSpinner
                    style={{
                      marginRight: 8,
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  Scanning...
                </span>
              ) : (
                <>
                  <span style={{ letterSpacing: '-0.025em' }}>Scan</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
        {/* Help Icon Button OUTSIDE the form */}
        <div className="relative flex items-center">
          <button
            type="button"
            className="ml-1 p-0 m-0 flex items-center"
            aria-label="Help"
            style={{ background: 'none', border: 'none', boxShadow: 'none' }}
            tabIndex={0}
            onMouseEnter={() => setIsHelpHovered(true)}
            onMouseLeave={() => setIsHelpHovered(false)}
            onClick={handleExampleClick}
            disabled={isTyping || loading}
            title="See Example"
          >
            <HelpCircle
              size={28}
              style={{
                stroke: isHelpHovered ? '#6F80E3' : '#A1ACEB',
                transition: 'stroke 0.2s',
                cursor: 'pointer',
              }}
            />
          </button>
          {/* Tooltip: always rendered, fades in/out with opacity transition */}
          <div
            className={`help-tooltip${isHelpHovered ? ' visible' : ''}${mounted ? ' mounted' : ''}`}
            aria-hidden={!isHelpHovered}
          >
            See Example
            <span className="help-tooltip-arrow" />
          </div>
        </div>
      </div>
      {/* Error message below the row */}
      <div
        className={`transition-all duration-300 ease-in-out ${isInvalid ? 'h-4 opacity-100 mt-1' : 'h-0 opacity-0 -mt-4'}`}
        style={{ minHeight: '1.5rem' }}
      >
        {isInvalid && (
          <div className="bg-[#E36363] text-white px-3 py-1.5 rounded-xl text-xs whitespace-nowrap shadow-lg w-fit mx-auto">
            Invalid GitHub repository URL
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
        .help-tooltip {
          position: absolute;
          bottom: 155%;
          left: 55%;
          transform: translateX(-50%) translateY(5px);
          background: rgba(63, 64, 67);
          color: #f3f5ff;
          padding: 2px 9px;
          border-radius: 9px;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
          border: 1.2px solid rgba(110, 111, 114);
          font-size: 0.82rem;
          font-weight: 500;
          white-space: nowrap;
          z-index: 50;
          display: flex;
          align-items: center;
          opacity: 0;
          pointer-events: none;
          transition: none;
        }
        .help-tooltip.mounted {
          transition:
            opacity 0.25s,
            transform 0.25s;
        }
        .help-tooltip.visible {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(-50%) translateY(0);
        }
        .help-tooltip-arrow {
          position: absolute;
          left: 50%;
          top: 100%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 7px solid rgba(63, 64, 67);
          filter: drop-shadow(0 1px 0 rgba(110, 111, 114));
        }
      `}</style>
    </div>
  );
}
