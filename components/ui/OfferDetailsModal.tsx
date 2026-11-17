import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@lib/utils';
import { DiscountOffer } from '@services/typesense';
import { formatOfferBannerSuffixText, getOfferTheme } from '@lib/offers/selectOffers';
import { CROSS_ICON, DISCOUNT_ICON_PDP } from '@config/Header/image.config';
import Icon from '@components/image/Icons';
import { useTheme } from 'context/ThemeProvider';
import { useLanguage } from 'context/LanguageContext';
import useLang from '@hooks/useLang';
import { getTenantConfig } from '@config/tenant.config';
import { getFormattedDate } from '@lib/helper/date';

interface OfferDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerData: DiscountOffer;
}

const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({
  isOpen,
  onClose,
  offerData,
}) => {
      const [isAnimating, setIsAnimating] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const {theme } = useTheme();
    const { selectedLang } = useLanguage();
    const [lang] = useLang();
    const language = selectedLang.code.toLowerCase();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      onClose();
    }, 300);
  }, [onClose]);

  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);


  if (!mounted || (!isOpen && !isAnimating)) return null;

  const baseTitle = offerData?.offerName?.en;
  const suffix = formatOfferBannerSuffixText(offerData, lang);
  const offerTitle =
    baseTitle ? (suffix ? `${baseTitle} : ${suffix}` : baseTitle) : baseTitle;

  const offerTheme = getOfferTheme(offerData);

  const offerEndTimestampMs = (() => {
    const rd = offerData?.restrictionsDate;
    const raw = rd?.endTime ?? rd?.endDate;
    if (raw == null || raw <= 0) return null;
    return raw < 1e12 ? raw * 1000 : raw;
  })();
  const offerValidTillLabel =
    offerEndTimestampMs != null
      ? `${lang.validTill} ${getFormattedDate(
          offerEndTimestampMs,
          getTenantConfig().dateDisplayFormat || 'DD MMM YYYY'
        )}`
      : null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black transition-opacity duration-300",
          isOpen && !isAnimating ? "opacity-50" : "opacity-0"
        )}
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className={cn(
        "relative w-full bg-[var(--cards-containers)] shadow-2xl transform transition-all duration-300 ease-out",
        "md:max-w-[830px] md:rounded-2xl md:mx-4 md:max-h-[80vh]",
        "rounded-t-2xl md:rounded-t-2xl max-h-[85vh]",
        // Mobile: slide from bottom, Desktop: scale and fade
        isOpen && !isAnimating 
          ? "translate-y-0 md:scale-100 md:opacity-100" 
          : "translate-y-full md:scale-95 md:opacity-0"
      )}>
        <div className="flex flex-col h-full pb-3">
          {/* Header - Mobile specific styling */}
          <div className="flex-shrink-0 relative">            
            <div className="px-4 md:px-6 pb-3 md:pb-4 pt-4">
              <div className="flex items-start justify-between">
                <img src={DISCOUNT_ICON_PDP} alt="offer-details" height={90} width={90} title="offer-details" className='w-16 h-16 md:w-20 md:h-20' />
                <button
                  className={"flex-shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  onClick={handleClose}
                >
                    <Icon
                        icon={`${CROSS_ICON}#cross`}
                        width={15}
                        height={15}
                        color={
                          theme == 'dark' 
                            ? (isHovered ? "var(--button-secondary-text)" : "var(--primary-text)")
                            : "var(--primary-text)"
                        }
                        className="cursor-pointer z-20 transition-colors"
                        viewBox="0 0 16 16"                        
                        strokeWidth={0.1}
                    />
                </button>
              </div>
              <div className='flex flex-col w-fit mt-5 mb-1'>                    
                <h2 className="heading-4 md-heading-3 font-semibold" style={{ color: offerTheme.text }}>
                  {offerTitle}
                </h2>
                {offerValidTillLabel ? (
                  <p className="extra-small-font md-heading-6 font-400 text-[var(--secondary-text)] m-0">
                    {offerValidTillLabel}
                  </p>
                ) : null}
              </div>
              <h3 className="extra-small-font md-heading-6 font-500 text-[var(--secondary-text)] pt-3">
                About this offer
              </h3>
              <div 
                    className="heading-6 md-heading-5 text-[var(--primary-text)] leading-tight pt-2"
                    dangerouslySetInnerHTML={{ __html: offerData.offerDescription.en }}
                  />
            </div>
          </div>

          {/* Terms and Conditions - Scrollable */}
            {offerData.termCondition?.[language] ? (
                <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-2 md:pb-6 max-h-[250px]">
                    <div className="space-y-3">
                        <>
                            {/* Divider */}
                            <div className="border-t border-[var(--rating-border-primary)]"></div>
                            <p className='font-600'>{lang.termsAndConditions}</p>
                            <div 
                            className="text-sm  md:text-md text-[var(--primary-text)] leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: offerData.termCondition?.[language] }}
                            />
                        </>
                    </div>
                </div>
            ) : ""}

          {/* Mobile bottom padding for safe area */}
          <div className="md:hidden pb-safe-area-inset-bottom"></div>
        </div>
      </div>

    </div>
  );

  return createPortal(modalContent, document.body);
};

export default OfferDetailsModal; 