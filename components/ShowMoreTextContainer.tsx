import { cn } from '@lib/utils';
import React, { useState, useCallback, useMemo } from 'react';
import StarIcon from './icons/Star';
import { isBrowser } from '@lib/helper';
import { KCAL_ICON } from '@config/Header/image.config';
import useLang from '@hooks/useLang';
import { LanguageCode, TranslationKeys } from 'types';
import DietaryIndicator from './ui/DietaryIndicator';
// import ClockIcon from './icons/ClockIcon';
// import PrepTimeContent from './productDetailPage/PrepTimeContent';
// import useLang from '@hooks/useLang';
// import { LanguageCode, TranslationKeys } from 'types';

type ShowMoreTextContainerProps = {
  description: string;
  className?: string;
  showMoreButtonText?: string;
  showLessButtonText?: string;
  showMoreClassName?: string;
  showLessClassName?: string;
  isHtml?: boolean;
  lineClamp?: number;
  // New drawer props
  useDrawer?: boolean;
  productName?: string;
  containsMeat?: boolean;
  rating?: number;
  reviewCount?: number;
  energy?: string;
  totalPrepTime?: number;
  preparationTime?: number;
  cookingTime?: number;
  onDrawerClose?: () => void;
  // Controlled mode props
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

const ShowMoreTextContainer = ({
  description,
  className,
  lineClamp = 2,
  showMoreButtonText = 'View more',
  showLessButtonText = 'View less',
  showMoreClassName,
  showLessClassName,
  isHtml = false,
  // New drawer props with defaults
  useDrawer = false,
  productName = '',
  containsMeat = false,
  rating = 0,
  reviewCount = 0,
  energy = '0',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  totalPrepTime,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  preparationTime,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cookingTime,
  onDrawerClose,
  // Controlled mode props
  isExpanded: controlledIsExpanded,
  onExpandedChange,
}: ShowMoreTextContainerProps) => {
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lang]: [TranslationKeys, LanguageCode] = useLang();

  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : internalIsExpanded;

  // Memoize the content to avoid unnecessary re-renders
  const content = useMemo(() => {
    if (isHtml) {
      return { dangerouslySetInnerHTML: { __html: description } };
    }
    return { children: description };
  }, [description, isHtml]);

  // Optimized toggle handlers
  const handleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (useDrawer) {
      setIsDrawerOpen(true);
      setIsAnimating(true);
      // Allow animation to complete
      setTimeout(() => setIsAnimating(false), 200);
    } else {
      if (onExpandedChange) {
        onExpandedChange(true);
      } else {
        setInternalIsExpanded(true);
      }
    }
  }, [useDrawer, onExpandedChange]);

  const handleCollapse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExpandedChange) {
      onExpandedChange(false);
    } else {
      setInternalIsExpanded(false);
    }
  }, [onExpandedChange]);

  const handleDrawerClose = useCallback(() => {
    setIsAnimating(true);
    // Start close animation
    setTimeout(() => {
      setIsDrawerOpen(false);
      setIsAnimating(false);
      onDrawerClose?.();
    }, 200);
  }, [onDrawerClose]);

  // Simple check: if description is long enough, show the button
  const shouldShowButton = useMemo(() => {
    if(!isBrowser()) return false;
    if (isHtml) {
      // For HTML content, create a temporary div to get text length
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = description;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      return textContent.length > 100; // Adjust threshold as needed
    }
    return description.length > 100; // Adjust threshold as needed
  }, [description, isHtml]);

  return (
    <>
      <div className="relative">
        <div
          className={cn(
            'small-font md-heading-6',
            !isExpanded && shouldShowButton ? `line-clamp-${lineClamp}` : '',
            className
          )}
          {...content}
        />
        
        {/* View More Button */}
        {shouldShowButton && !isExpanded && (
          <button
            type="button"
            onClick={handleExpand}
            className={cn(
              'absolute pl-3 bottom-0 right-0 z-10 text-[var(--accent-color)] hover:underline focus:outline-none transition-colors',
              
              showMoreClassName
            )}
            style={{ 
              fontWeight: 'var(--font-semi-bold)',
              fontSize: 'var(--small-font) !important'
            }}
          >
            {showMoreButtonText}
          </button>
        )}

        {/* View Less Button - Only for non-drawer mode */}
        {!useDrawer && shouldShowButton && isExpanded && (
          <button
            type="button"
            onClick={handleCollapse}
            className={cn(
              'text-[var(--accent-color)] mt-2 hover:underline focus:outline-none transition-colors block',
              showLessClassName
            )}
            style={{ 
              fontWeight: 'var(--font-semi-bold)',
              fontSize: 'var(--small-font) !important'
            }}
          >
            {showLessButtonText}
          </button>
        )}

        <style>{`
          .line-clamp-${lineClamp} {
            display: -webkit-box;
            -webkit-line-clamp: ${lineClamp};
            -webkit-box-orient: vertical;
            overflow: hidden;
            line-height: 1.5;
          }
        `}</style>
      </div>

      {/* Bottom Drawer Modal */}
      {useDrawer && (isDrawerOpen || isAnimating) && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <div 
            className={cn(
              "absolute inset-0 bg-[var(--black)] transition-opacity duration-200 opacity-50",
            )}
            onClick={handleDrawerClose}
          />
          
          {/* Drawer Content */}
          <div className={cn(
            "relative w-full bg-[var(--primary-background)] shadow-xl transform transition-all duration-200 ease-out",
            "md:max-w-[830px] md:rounded-2xl md:mx-4",
            "rounded-t-2xl md:rounded-t-2xl",
            // Mobile: slide from bottom, Desktop: scale and fade
            isDrawerOpen && !isAnimating 
              ? "translate-y-0 md:scale-100 md:opacity-100" 
              : "translate-y-full md:scale-95 md:opacity-0"
          )}>
            <div className="max-h-[40vh] md:max-h-[60vh] flex flex-col p-4">
              {/* Header */}
              <div className="flex-shrink-0 border-b border-gray-200 pb-3">
                <div className="flex items-center justify-between w-full mb-0">
                  <div>
                    <DietaryIndicator
                      containsMeat={containsMeat}
                      containerClassName="items-center justify-center !pb-2 !pt-0"
                      imageClassName="w-4 h-4"
                    />
                  </div>
                  <button
                    onClick={handleDrawerClose}
                    className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg 
                      className="w-6 h-6 text-[var(--primary-text)]" 
                      fill="none" 
                      stroke='var(--primary-text)' 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <h2 className="heading-4 md-heading-2 font-semibold text-[var(--primary-text)] pr-4 leading-[1.2]">
                  {productName}
                </h2>
                
                {/* Rating and Energy Info - only show when we have rating/reviews or energy */}
                {(reviewCount > 0 || !!energy) && (
                <div className="flex items-center justify-start text-xs text-[var(--secondary-text)] pt-2">
                  {rating > 0 && reviewCount > 0 ? (
                    <>
                    <div className="flex items-center justify-start text-xs text-[var(--secondary-text)]">
                      <div className="flex items-center space-x-1">
                        <StarIcon/>
                        <span className="md:hidden">{rating} ({reviewCount} {lang.reviews})</span>
                        <span className="hidden md:block">{rating} | {reviewCount} {lang.reviews}</span>
                      </div>
                    </div>
                    {!!energy && <>&nbsp;•&nbsp;</>}
                    </>
                  ) : reviewCount > 0 ? (
                    <>
                    <div className="flex items-center justify-start text-xs text-[var(--secondary-text)]">
                      <div className="flex items-center space-x-2">
                        <span>{reviewCount} {lang.reviews}</span>
                      </div>
                    </div>
                    {!!energy && <>&nbsp;•&nbsp;</>}
                    </>
                  ) : null}

                  {!!energy && (
                    <>
                    <img src={`${KCAL_ICON}#kcal`} alt="kcal" className="w-3 h-3 mr-1" width={16} height={16} />
                      <span>
                        {energy}
                      </span>
                    </>
                  )}
                  
                  {/* {totalPrepTime && (
                    <>
                      {(!!energy || reviewCount > 0) && (
                        <span className="h-1 w-1 rounded-full bg-[var(--secondary-text)] md:bg-[var(--secondary-text)] mx-1"></span>
                      )}
                      <div className="relative group">
                        <div className="flex items-center gap-1">
                          <ClockIcon 
                            width={14} 
                            height={14} 
                            className="flex-shrink-0"
                          />
                          <span>{totalPrepTime} {lang.mins}</span>
                        </div>
                        <div className="prep-time-tooltip hidden md:block absolute left-0 top-full mt-2 bg-[var(--tertiary-background)] shadow-lg rounded-lg p-[10px] w-max min-w-48 max-w-xs z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                          <PrepTimeContent
                            preparationTime={preparationTime}
                            cookingTime={cookingTime}
                            totalTime={totalPrepTime}
                          />
                        </div>
                      </div>
                    </>
                  )} */}
                </div>
                )}
              </div>

              {/* Scrollable Description */}
              <div className="flex-1 overflow-y-auto pt-4">
                <div 
                  className="text-[var(--primary-text)] leading-[1.4]"
                  {...content}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShowMoreTextContainer;
