import { ArrowRight } from "lucide-react";
import React from "react";

export default function CveInfoPill() {
  return (
    <div className="flex justify-center mb-12 mt-0">
      <span
        className="inline-flex items-center gap-2 px-4 py-1 border rounded-full text-sm font-bold transition-all duration-200 cursor-pointer cve-pill"
        style={{ color: '#212121', background: 'rgba(205, 209, 221, 0.3)', borderColor: 'rgba(175, 175, 175, 0.3)', letterSpacing: '-0.025em' }}
        tabIndex={0}
      >
        What are Common Vulnerabilities and Exposures (CVEs)?
        <ArrowRight size={16} color="#989AA1" />
      </span>
      <style jsx>{`
        .cve-pill:hover, .cve-pill:focus {
          transform: translateY(-3px);
          box-shadow: 0 4px 16px 0 rgba(80, 80, 120, 0.10);
        }
      `}</style>
    </div>
  );
} 