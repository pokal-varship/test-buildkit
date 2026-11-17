"use client";

import React from 'react';

interface ResetButtonProps {
  onReset: () => void;
  size?: 'sm' | 'md';
  className?: string;
  title?: string;
}

export function ResetButton({ 
  onReset, 
  size = 'sm', 
  className = '', 
  title = 'Reset to default value' 
}: ResetButtonProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5'
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  return (
    <button
      type="button"
      onClick={onReset}
      title={title}
      className={`${sizeClasses[size]} rounded-md transition-all hover:opacity-80 flex items-center justify-center ${className}`}
      style={{
        backgroundColor: 'var(--secondary-background)',
        color: 'var(--secondary-text)',
        border: '1px solid var(--borders-dividers)'
      }}
    >
      <svg 
        className={iconSize[size]} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
        />
      </svg>
    </button>
  );
}



