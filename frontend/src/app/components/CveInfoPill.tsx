import { ArrowRight } from 'lucide-react';
import React from 'react';

export default function CveInfoPill() {
  return (
    <div className="flex justify-center mb-16 mt-6 pt-10">
      <span
        className="inline-flex items-center gap-2 px-4 py-1 border rounded-full text-sm font-bold transition-all duration-200 cursor-pointer cve-pill opacity-75"
        style={{
          color: 'var(--text-primary)',
          background: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          letterSpacing: '-0.025em',
        }}
        tabIndex={0}
      >
        <a
          href="https://www.redhat.com/en/topics/security/what-is-cve"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-700 text-center transition-colors duration-200"
          style={{
            color: 'inherit',
            textDecoration: 'none',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          What are Common Vulnerabilities and Exposures (CVEs)?
        </a>
        <ArrowRight size={16} style={{ color: 'var(--text-secondary)' }} />
      </span>
      <style jsx>{`
        .cve-pill:hover,
        .cve-pill:focus {
          transform: translateY(-3px);
          box-shadow: 0 4px 16px 0 rgba(80, 80, 120, 0.1);
        }
      `}</style>
    </div>
  );
}
