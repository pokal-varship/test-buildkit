import React from 'react';
import useLang from '@hooks/useLang';
import { LanguageCode, TranslationKeys } from 'types';

interface PrepTimeContentProps {
  preparationTime?: number;
  cookingTime?: number;
  totalTime?: number;
  className?: string;
}

const PrepTimeContent: React.FC<PrepTimeContentProps> = ({
  preparationTime,
  cookingTime,
  totalTime,
  className = '',
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();

  return (
    <div className={`prep-time-content ${className}`}>
      {preparationTime && (
        <div className="flex justify-between items-center pb-1">
          <span className="text-[var(--primary-text)] heading-6">{lang.preparationTime}</span>
          <span className="text-[var(--primary-text)] heading-6">{preparationTime} {lang.mins}</span>
        </div>
      )}
      {cookingTime && (
        <div className="flex justify-between items-center pt-1 pb-2 border-b border-[var(--rating-border-primary)]">
          <span className="text-[var(--primary-text)] heading-6">{lang.cookingTime}</span>
          <span className="text-[var(--primary-text)] heading-6">{cookingTime} {lang.mins}</span>
        </div>
      )}
      {totalTime && (
        <div className="flex justify-between items-center pt-2">
          <span className="text-[var(--primary-text)] heading-6 font-[var(--font-semi-bold)]">{lang.totalTime}</span>
          <span className="text-[var(--primary-text)] heading-6 font-[var(--font-semi-bold)]">{totalTime} {lang.mins}</span>
        </div>
      )}

      <style>{`
        .heading-6 {
          font-size: var(--heading-h6);
        }
      `}</style>
    </div>
  );
};

export default PrepTimeContent;

