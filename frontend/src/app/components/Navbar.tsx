// Patchly - Detects security issues in GitHub repos.
// Copyright (C) 2025  Rawsab Said
// This file is part of Patchly and is licensed under the
// GNU General Public License v3.0. See LICENSE for details.

import React, { useEffect, useState } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved dark mode preference or default to system preference
    const savedDarkMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedDarkMode !== null) {
      setIsDarkMode(savedDarkMode === 'true');
    } else {
      setIsDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', isDarkMode.toString());
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('darkModeChange'));
  }, [isDarkMode]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-colors duration-200 ${
        scrolled
          ? 'border-b border-transparent backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
      style={{ 
        minHeight: 64,
        backgroundColor: scrolled ? 'var(--navbar-bg)' : 'transparent'
      }}
    >
      <div className="max-w-[952px] pt-4.5 pb-0 mx-auto flex items-center justify-between px-6">
        {/* Left side: Patchly logo and text */}
        <div className="flex items-center gap-2">
          <img src="/patchly_logo.png" alt="Patchly logo" className="h-7 w-7 object-contain" />
          <span 
            className="text-lg font-bold transition-colors duration-200" 
            style={{ 
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)'
            }}
          >
            Patchly
          </span>
        </div>
        {/* Right side: Built by and social icons */}
        <div className="flex items-center gap-4">
          <span
            className="text-sm transition-colors duration-200"
            style={{ 
              fontWeight: 400, 
              letterSpacing: '-0.025em',
              color: 'var(--text-secondary)'
            }}
          >
            Built by Rawsab Said
          </span>
          <a
            href="https://github.com/rawsabsaid"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-200 hover:text-[#676F9B]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <img
              src="/icons/github-icon.svg"
              alt="GitHub"
              width={18}
              height={18}
              style={{ color: 'var(--text-secondary)' }}
            />
          </a>
          <a
            href="https://linkedin.com/in/rawsabsaid"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-200 hover:text-[#676F9B]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <img
              src="/icons/linkedin-icon.svg"
              alt="LinkedIn"
              width={20}
              height={20}
              style={{ color: 'var(--text-secondary)' }}
            />
          </a>
          <button
            onClick={toggleDarkMode}
            className="transition-colors duration-200 hover:text-[#676F9B] p-1 cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
