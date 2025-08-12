'use client';
import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const updateDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Initial check
    updateDarkMode();

    // Listen for dark mode changes
    const handleDarkModeChange = () => {
      updateDarkMode();
    };

    window.addEventListener('darkModeChange', handleDarkModeChange);

    return () => {
      window.removeEventListener('darkModeChange', handleDarkModeChange);
    };
  }, []);

  return (
    <footer className="w-full mt-12">
      <div 
        className="w-full h-px mb-4 transition-colors duration-200" 
        style={{ 
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }}
      />
      <div
        className="text-center text-xs pb-8 opacity-70 transition-colors duration-200"
        style={{ 
          background: 'transparent',
          color: 'var(--text-secondary)'
        }}
      >
        © 2025 Patchly. Built by Rawsab Said.
      </div>
    </footer>
  );
};

export default Footer;
