import React, { useState } from 'react';
import ArrowDownIcon from '@components/icons/ArrowDown';

interface FAQItem {
  question?: string;
  answer?: string;
}

interface FAQProps {
  title?: string;
  description?: string;
  data?: FAQItem[];
  className?: string;
}

const FAQ: React.FC<FAQProps> = ({
  title = 'Frequently Asked Questions',
  description = 'Everything you need to know about dining with us',
  data = [],
  className = '',
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className={`faq-section pb-10 md:pb-4 md:px-4 px-3 mb-7 md:mb-0 md:pt-6 lg:px-10 ${className}`}>
      <h2 className="heading-4 md-heading-2 font-700 md:mb-2 mb-3 text-[var(--primary-text)]">
        {title}
      </h2>
      <p className="description md:hidden mb-2">
        {description}
      </p>
      {data && data.length > 0 ? data.map((item, idx) => (
        <div key={idx}>
          <button
            className="w-full flex items-center justify-between py-4 md:py-5 focus:outline-none"
            aria-expanded={openIndex === idx}
            aria-controls={`faq-answer-${idx}`}
            onClick={() => handleToggle(idx)}
            type="button"
          >
            <h3 className="title text-[var(--border-primary)] text-left font-500 text-base ">{item?.question}</h3>
            <span className={`transition-transform duration-200 ${openIndex === idx ? 'rotate-180' : ''}`}>
              <ArrowDownIcon width="15" height="15" color="var(--primary-text)" />
            </span>
          </button>
          <div
            id={`faq-answer-${idx}`}
            className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === idx ? 'opacity-100 translate-y-0 pb-4 md:pb-5' : 'opacity-0 -translate-y-2 pointer-events-none h-0 p-0 m-0'}`}
          >
            <h4 className="description text-[var(--primary-text)] small-font">
              {item?.answer}
            </h4>
          </div>
          {idx !== data.length - 1 && (
            <div className="border-b border-[var(--rating-border-primary)]" />
          )}
        </div>
      )) : null}
      <style>{`
        @media (min-width: 768px) {
          .title {
              font-size: var(--description-font) !important;
          }
          .description{
            font-size: var(--small-font) !important;
          }
       }
        `}
      </style>
    </div>
  );
};


export default function FAQWrapper(props: Partial<FAQProps> = {}) {
  return <FAQ {...props} />;
}
