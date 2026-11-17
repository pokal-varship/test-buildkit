"use client";

import React from "react";

// TypeScript interfaces for better type safety
interface IconCardData {
  title?: string;
  description?: string;
  longDescription?: string;
  icon?: React.ReactNode;
  id?: string | number;
}

interface FeatureModalProps {
  // Dialog system props
  open?: boolean;
  type?: string;
  handlerDialog?: () => void;
  anchor?: string;
  onClose: () => void;
  
  // Direct props (for standalone usage)
  isOpen?: boolean;
  title?: string;
  longDescription?: string;
  icon?: React.ReactNode;
  
  // Dialog data props
  propsData?: IconCardData & {
    isOpen?: boolean;
  };
}

/**
 * FeatureModal Component
 * Displays content for icon card information including title, icon, and description
 * Works as a content component within the dialog system
 */
export const FeatureModal: React.FC<FeatureModalProps> = (props) => {
  const {
    onClose,
    propsData,
    title: directTitle,
    icon: directIcon
  } = props;

  // Extract content data with fallbacks
  const title = propsData?.title || directTitle || "Feature";
  const longDescription = propsData?.longDescription || "No description available.";
  const icon = propsData?.icon || directIcon;



  return (
    <div className="w-full h-full flex flex-col gap-5 md:gap-6 p-4 py-6 md:p-0">
      {/* Header with Close Button */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Icon Container */}
          {icon && (
            <div 
              className="flex-shrink-0 text-yellow-500 flex items-start"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
        </div>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 ml-4 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close modal"
          type="button"
        >
          <svg 
            className="w-5 h-5 text-[var(--primary-text)] hover:text-black" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      </div>
             <div className="flex flex-col gap-3 md:gap-4">
          <p 
             className="text-xl md:text-2xl font-semibold text-[var(--primary-text)] leading-tight"
           >
             {title}
           </p>
           <p className="text-sm text-justify text-[var(--primary-text)] leading-relaxed">
             {longDescription}
           </p>
      </div>
      
      


    </div>
  );
};

export default FeatureModal;
