import React, { ReactNode } from 'react';

type ErrorMessageProps = {
  error: ReactNode | null;
};

export default function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;
  return (
    <div
      className="text-red-600 mb-4 p-5 text-center w-full rounded-2xl border shadow-md bg-[#FFE8E8] border-[#FFB9B9]"
      style={{ letterSpacing: '-0.025em' }}
    >
      {error}
    </div>
  );
}
