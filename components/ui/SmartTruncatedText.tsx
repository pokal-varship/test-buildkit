'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';

// Custom hook for text truncation logic
const useTextTruncation = () => {
  const calculateTruncatedText = useCallback((
    text: string,
    container: HTMLElement,
    maxLines: number = 2,
    moreText: string = ' More'
  ): { truncatedText: string; needsMore: boolean } => {
    if (!container || !text) {
      return { truncatedText: text, needsMore: false };
    }

    // Create a temporary element to measure text
    const temp = document.createElement('div');
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.height = 'auto';
    temp.style.width = container.offsetWidth + 'px';
    temp.style.fontSize = window.getComputedStyle(container).fontSize;
    temp.style.fontFamily = window.getComputedStyle(container).fontFamily;
    temp.style.lineHeight = window.getComputedStyle(container).lineHeight;
    temp.style.wordBreak = 'break-word';
    temp.style.overflow = 'hidden';
    
    document.body.appendChild(temp);

    // Get line height
    temp.innerHTML = 'A';
    const lineHeight = temp.offsetHeight;
    const maxHeight = lineHeight * maxLines;

    // Check if full text fits
    temp.innerHTML = text;
    if (temp.offsetHeight <= maxHeight) {
      document.body.removeChild(temp);
      return { truncatedText: text, needsMore: false };
    }

    // Binary search to find the right truncation point
    let start = 0;
    let end = text.length;
    let bestFit = '';

    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      const testText = text.substring(0, mid) + '...' + moreText;
      
      temp.innerHTML = testText;
      
      if (temp.offsetHeight <= maxHeight) {
        bestFit = text.substring(0, mid);
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }

    document.body.removeChild(temp);
    return { 
      truncatedText: bestFit, 
      needsMore: true 
    };
  }, []);

  return { calculateTruncatedText };
};

// Props interface for the SmartTruncatedText component
interface SmartTruncatedTextProps {
  text: string;
  maxLines?: number;
  className?: string;
  expandedDescriptions: Record<string, boolean>;
  productId: string;
  onToggle: (productId: string, e: React.MouseEvent) => void;
  moreText?: string;
  lessText?: string;
}

// SmartTruncatedText component for intelligent text truncation
const SmartTruncatedText: React.FC<SmartTruncatedTextProps> = ({ 
  text, 
  maxLines = 2, 
  className = '', 
  expandedDescriptions, 
  productId, 
  onToggle,
  moreText = ' More',
  lessText = ' Less'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [truncatedContent, setTruncatedContent] = useState<{
    truncatedText: string;
    needsMore: boolean;
  }>({ truncatedText: text, needsMore: false });
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const { calculateTruncatedText } = useTextTruncation();
  const isExpanded = expandedDescriptions[productId];

  // Function to recalculate truncation
  const recalculateTruncation = useCallback(() => {
    if (containerRef.current && !isExpanded && text) {
      const result = calculateTruncatedText(text, containerRef.current, maxLines, moreText);
      setTruncatedContent(result);
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [calculateTruncatedText, isExpanded, maxLines, moreText, text]);

  // Initial calculation and when dependencies change
  useEffect(() => {
    recalculateTruncation();
  }, [recalculateTruncation]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!isExpanded) {
        // Use setTimeout to allow for layout to complete
        setTimeout(() => {
          recalculateTruncation();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [recalculateTruncation, isExpanded]);

  // Handle container size changes with ResizeObserver
  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // Check if ResizeObserver is available
    if (typeof ResizeObserver === 'undefined') {

      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        if (newWidth !== containerWidth && newWidth > 0 && !isExpanded) {
          recalculateTruncation();
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerWidth, recalculateTruncation, isExpanded]);

  // Recalculate when component becomes visible or text changes
  useEffect(() => {
    if (!isExpanded) {
      // Use RAF to ensure DOM is ready
      requestAnimationFrame(() => {
        recalculateTruncation();
      });
    }
  }, [text, isExpanded, recalculateTruncation]);

  // Handle visibility changes (when component comes into view)
  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // Check if IntersectionObserver is available
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isExpanded) {
            // Component is visible, recalculate truncation
            setTimeout(() => {
              recalculateTruncation();
            }, 50);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1, // Trigger when 10% of the component is visible
      }
    );

    intersectionObserver.observe(containerRef.current);

    return () => {
      intersectionObserver.disconnect();
    };
  }, [recalculateTruncation, isExpanded]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(productId, e);
  };

  return (
    <>
    <div ref={containerRef} className={`relative ${className}`}>
      {isExpanded ? (
        <>
          <span dangerouslySetInnerHTML={{ __html: text }} />
          <span
            onClick={handleToggle}
            className="more-text-inline description extra-small-font cursor-pointer"
          >
            {lessText}
          </span>
        </>
      ) : (
        <>
          <span dangerouslySetInnerHTML={{ __html: truncatedContent.truncatedText }} />
          {truncatedContent.needsMore && (
            <>
              <span>...</span>
              <span
                onClick={handleToggle}
                className="more-text-inline description extra-small-font cursor-pointer"
              >
                {moreText}
              </span>
            </>
          )}
        </>
      )}
    </div>

    <style>
        {
        `
        .more-text-inline {
          color: var(--accent-color);
          font-weight: var(--font-semi-bold);
          display: inline;
          font-size: var(--heading-h6) !important;
        }
        
        `
        }
    </style>
    </>
  );
};

export default SmartTruncatedText; 