"use client";

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

interface ResizablePanelsProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  leftRatio?: number;
  rightRatio?: number;
}

// Loading placeholder with proper height to prevent layout shift
function ResizablePanelsLoading() {
  return (
    <div 
      style={{ 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--primary-background)'
      }}
    >
      <div className="text-center">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
          style={{ borderColor: 'var(--primary-color)' }}
        />
        <p style={{ color: 'var(--secondary-text)' }}>Loading editor...</p>
      </div>
    </div>
  );
}

// Dynamic import with ssr: false to prevent layout shift
const ResizablePanels = dynamic(
  () => import('./ResizablePanels').then(mod => mod.ResizablePanels),
  {
    ssr: false,
    loading: () => <ResizablePanelsLoading />
  }
);

export function ResizablePanelsWrapper({
  leftPanel,
  rightPanel,
  leftRatio = 35,
  rightRatio = 75
}: ResizablePanelsProps) {
  return (
    <ResizablePanels
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      leftRatio={leftRatio}
      rightRatio={rightRatio}
    />
  );
}

