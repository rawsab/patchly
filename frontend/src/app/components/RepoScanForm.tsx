import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
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

export default function RepoScanForm({
  repoUrl,
  setRepoUrl,
  loading,
  handleSubmit,
}: RepoScanFormProps) {
  const [isInvalid, setIsInvalid] = useState(false);

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
          onChange={handleUrlChange}
          placeholder="Enter a GitHub URL here…"
          className={`flex-1 border rounded-2xl pr-32 pl-11 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#F3F5FF] border-[#D1D5E8] placeholder-[#BABCCA] text-base ${
            isInvalid ? 'border-[#E3AAAA] text-[#E36363]' : 'text-[#202020]'
          }`}
          style={{ paddingRight: loading ? '150px' : '110px' }}
          required
        />
        <button
          type="submit"
          disabled={loading || isInvalid}
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
      <div
        className={`transition-all duration-300 ease-in-out ${isInvalid ? 'h-4 opacity-100 mt-1' : 'h-0 opacity-0 -mt-5'}`}
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
      `}</style>
    </form>
  );
}
