import React from 'react';
import { NO_NUTRITION_IMAGE } from '@config/Header/image.config';

interface NoDataPlaceholderProps {
  title: string;
  description: string;
  className?: string;
}

const NoDataPlaceholder: React.FC<NoDataPlaceholderProps> = ({ title, description, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-8 px-4 ${className}`}>
      <div className='w-24 h-24 mb-4'>
        <img 
          src={NO_NUTRITION_IMAGE} 
          alt={title} 
          className='w-full h-full'
        />
      </div>
      <h3 className='heading-5 font-semibold text-[var(--primary-text-light)] mb-2'>
        {title}
      </h3>
      <p className='heading-6 text-[var(--primary-text-light)] text-center max-w-[220px]'>
        {description}
      </p>
    </div>
  );
};

export default NoDataPlaceholder;
