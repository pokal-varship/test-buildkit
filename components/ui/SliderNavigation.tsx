"use client";

import React, { memo } from 'react';
import AnimatedArrow from '@components/icons/AnimatedArrow';

export interface SliderNavigationProps {
  onPrevClick?: () => void;
  onNextClick?: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  position?: 'left' | 'center' | 'right';
  hideOnMobile?: boolean;
  hideOnWeb?: boolean;
}

const SliderNavigation = memo<SliderNavigationProps>(({
  onPrevClick,
  onNextClick,
  disabled = false,
  className = '',
  size = 'md',
  variant = 'default',
  position = 'center',
  hideOnMobile = true,
  hideOnWeb = false,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const variantClasses = {
    default: 'text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover-background)] border-[var(--button-primary-border-color)]',
    outlined: 'bg-transparent text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover-background)] border-[var(--button-primary-border-color)]',
    filled: 'bg-[var(--button-primary-background)] text-[var(--button-primary-text)] border-[var(--button-primary-border-color)]'
  };

  const positionClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  const handlePrevClick = () => !disabled && onPrevClick?.();
  const handleNextClick = () => !disabled && onNextClick?.();

  return (
    <div 
      className={`
        flex items-center gap-4
        ${positionClasses[position]}
        ${hideOnMobile ? 'hidden md:flex' : 'flex'}
        ${hideOnWeb ? 'md:hidden' : ''}
        ${className}
      `}
    >
      <button
        onClick={handlePrevClick}
        disabled={disabled}
        className={`
          flex group items-center justify-center
          rounded-lg transition-all duration-200
          focus:outline-none focus:ring-0
         outline-none ring-0
          disabled:opacity-50 disabled:cursor-not-allowed
          border
          ${sizeClasses[size]}
          ${variantClasses[variant]}
        `}
        aria-label="Previous slide"
      >
        <AnimatedArrow direction="left" className='ml-0' color="var(--button-secondary-text)" />
      </button>
      
      <button
        onClick={handleNextClick}
        disabled={disabled}
        className={`
          flex  group items-center justify-center
          rounded-lg transition-all duration-200
          focus:outline-none focus:ring-0
          outline-none ring-0
          disabled:opacity-50 disabled:cursor-not-allowed
          border
          ${sizeClasses[size]}
          ${variantClasses[variant]}
        `}
        aria-label="Next slide"
      >
        <AnimatedArrow direction="right" className='ml-0' color="var(--button-secondary-text)"/>
      </button>
    </div>
  );  
});

SliderNavigation.displayName = 'SliderNavigation';

export default SliderNavigation; 