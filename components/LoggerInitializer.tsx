'use client';

import { useEffect } from 'react';

// This component ensures the logger is initialized on the client side
const LoggerInitializer: React.FC = () => {
  useEffect(() => {
    // Import logger on client side to ensure console override works
    import('@lib/logger');
  }, []);

  return null; // This component doesn't render anything
};

export default LoggerInitializer; 