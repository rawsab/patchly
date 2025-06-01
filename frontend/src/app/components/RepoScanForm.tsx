import React from 'react';
import { Search, ArrowRight } from 'lucide-react';

type RepoScanFormProps = {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
};

export default function RepoScanForm({
  repoUrl,
  setRepoUrl,
  loading,
  handleSubmit,
}: RepoScanFormProps) {
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl flex flex-col items-center justify-center gap-4 mb-8 mx-auto"
    >
      <div className="relative flex w-full items-center">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BABCCA]">
          <Search size={20} />
        </span>
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="Enter a GitHub URL here…"
          className="flex-1 border rounded-2xl pr-32 pl-11 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-[#202020] bg-[#F3F5FF] border-[#D1D5E8] placeholder-[#BABCCA] text-base"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-1 inset-y-1 flex items-center gap-2 px-4 bg-[#C2CBFF] border border-[#C0C5E6] text-[#202020] rounded-2xl hover:bg-[#AAB8FF] disabled:opacity-50 font-semibold transition-colors cursor-pointer"
          style={{ minWidth: 90 }}
        >
          {loading ? (
            <span style={{ letterSpacing: '-0.025em', color: '#1F233A' }}>Scanning...</span>
          ) : (
            <>
              <span style={{ letterSpacing: '-0.025em' }}>Scan</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
