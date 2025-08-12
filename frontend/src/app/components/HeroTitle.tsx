import React from 'react';

export default function HeroTitle() {
  return (
    <>
      <h1 
        className="text-4xl sm:text-5xl font-normal mb-3 text-center tracking-[-0.04em] transition-colors duration-200"
        style={{ color: 'var(--text-primary)' }}
      >
        Vulnerability scanning
        <br />
        as <span className="font-bold">simple as copy-paste.</span>
      </h1>
      <div
        className="text-base sm:text-lg text-center mt-6 mb-8 tracking-[-0.04em] transition-colors duration-200"
        style={{ 
          color: 'var(--text-secondary)', 
          letterSpacing: '-0.025em', 
          fontWeight: 400, 
          lineHeight: 1.2 
        }}
      >
        Everything you need to secure your dependencies —<br />
        zero setup, no guesswork.
      </div>
    </>
  );
}
