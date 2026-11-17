"use client";

import React, { useState, ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className="border rounded-lg mb-3 overflow-hidden"
      style={{ borderColor: 'var(--borders-dividers)' }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left transition-colors hover:opacity-80"
        style={{
          backgroundColor: 'var(--cards-containers)',
          color: 'var(--primary-text)'
        }}
      >
        <span className="font-semibold">{title}</span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ overflow: isOpen ? 'visible' : 'hidden' }}
      >
        <div className="p-4" style={{ backgroundColor: 'var(--primary-background)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

