"use client";

import { useEffect, useState, ReactNode } from 'react';

export default function ClientOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div data-client-only>
      {mounted ? (
        children
      ) : (
        fallback ?? (
          <div className="min-h-screen bg-offwhite flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
              <p className="text-navy font-semibold">Loading...</p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
