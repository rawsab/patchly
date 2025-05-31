"use client";
import React, { useState } from "react";
import CveInfoPill from "./components/CveInfoPill";
import HeroTitle from "./components/HeroTitle";
import RepoScanForm from "./components/RepoScanForm";
import ScanResultTable from "./components/ScanResultTable";
import ErrorMessage from "./components/ErrorMessage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#E3E7FE] text-[#202020] overflow-x-hidden">
      {/* Background image at the top */}
      <img
        src="/background/header_light.png"
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute top-0 left-0 w-full z-0"
        style={{ objectFit: 'cover' }}
      />
      <div className="w-full max-w-3xl p-6 flex flex-col items-center justify-center mx-auto relative z-10">
        <div className="w-full max-w-2xl mx-auto">
          <CveInfoPill />
          <HeroTitle />
          <RepoScanForm
            repoUrl={repoUrl}
            setRepoUrl={setRepoUrl}
            loading={loading}
            handleSubmit={handleSubmit}
          />
          <ErrorMessage error={error} />
          <ScanResultTable result={result} />
          <div className="h-[50px]"></div>
        </div>
      </div>
    </div>
  );
}
