/**
 * Unauthorized Access Component
 * Displays when user tries to access protected pages without proper token
 */

"use client";

import React from 'react';

interface UnauthorizedAccessProps {
  message?: string;
  showReturnHome?: boolean;
}

export default function UnauthorizedAccess({ 
  message = "You are not allowed to view this page", 
  showReturnHome = true 
}: UnauthorizedAccessProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        {/* Lock Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <svg 
            className="h-8 w-8 text-red-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
            />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {/* Additional Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500">
            This page requires proper authentication. Please ensure you have the correct access token.
          </p>
        </div>

        {/* Return Home Button */}
        {showReturnHome && (
          <button
            onClick={() => window.location.href = '/'}
            className="w-full font-bold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: 'var(--primary-color)',
              color: 'var(--primary-text)',
              borderColor: 'var(--primary-color)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--cta-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-color)';
            }}
          >
            Return to Homepage
          </button>
        )}

        {/* Contact Support */}
        <p className="text-xs text-gray-400 mt-4">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}
