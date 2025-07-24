// Patchly - Detects security issues in GitHub repos.
// Copyright (C) 2025  Rawsab Said
// This file is part of Patchly and is licensed under the
// GNU General Public License v3.0. See LICENSE for details.

import React, { useEffect, useState } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-colors duration-200 ${
        scrolled
          ? 'border-b border-transparent bg-white/10 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
      style={{ minHeight: 64 }}
    >
      <div className="max-w-[952px] pt-4.5 pb-0 mx-auto flex items-center justify-between px-6">
        {/* Left side: Patchly logo and text */}
        <div className="flex items-center gap-2">
          <img src="/patchly_logo.png" alt="Patchly logo" className="h-7 w-7 object-contain" />
          <span className="text-lg font-bold" style={{ letterSpacing: '-0.025em' }}>
            Patchly
          </span>
        </div>
        {/* Right side: Built by and social icons */}
        <div className="flex items-center gap-4">
          <span
            className="text-sm text-[#646464]"
            style={{ fontWeight: 400, letterSpacing: '-0.025em' }}
          >
            Built by Rawsab Said
          </span>
          <a
            href="https://github.com/rawsabsaid"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#646464] hover:text-[#676F9B] transition-colors"
          >
            <img
              src="/icons/github-icon.svg"
              alt="GitHub"
              width={18}
              height={18}
              style={{ color: '#646464' }}
            />
          </a>
          <a
            href="https://linkedin.com/in/rawsabsaid"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#646464] hover:text-[#676F9B] transition-colors"
          >
            <img
              src="/icons/linkedin-icon.svg"
              alt="LinkedIn"
              width={20}
              height={20}
              style={{ color: '#646464' }}
            />
          </a>
        </div>
      </div>
    </nav>
  );
}
