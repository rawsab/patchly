import React from "react";

type ErrorMessageProps = {
  error: string | null;
};

export default function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;
  return (
    <div className="text-red-600 mb-4 text-center w-full">{error}</div>
  );
} 