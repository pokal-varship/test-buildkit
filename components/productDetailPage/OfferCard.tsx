import { DISCOUNT_ICON_PDP } from "@config/Header/image.config";
import InfoIcon from "@components/icons/InfoIcon";
import { cn } from "@lib/utils";
import React, { FC, useState } from "react";
import OfferDetailsModal from "@components/ui/OfferDetailsModal";
import { DiscountOffer } from "@services/typesense";
import { useLanguage } from "context/LanguageContext";

interface OfferCardProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  containerClassName?: string;
  containerWidthClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  iconClassName?: string;
  mobilecontainerClassName?: string;
  onClick?: () => void;
  offerData?: DiscountOffer;
  showModal?: boolean;
  type?: number;
  showMoreText?: boolean;
  bgColor?: string;
  textColor?: string;
}

// 0 - Product Options
// 1 - Store Page

const OfferCard: FC<OfferCardProps> = ({
  icon = (
    <img
      fetchPriority="high"
      src={DISCOUNT_ICON_PDP}
      alt="offer"
      title="offer"
      width={40}
      height={40}
      className="offer-icon"
    />
  ),
  title,
  description,
  containerClassName,
  titleClassName,
  descriptionClassName,
  iconClassName,
  mobilecontainerClassName,
  onClick,
  containerWidthClassName,
  offerData,
  showModal = true,
  type,
  showMoreText = false,
  bgColor,
  textColor,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selectedLang } = useLanguage();
  const language = selectedLang.code.toLowerCase();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    // Only open modal if there's a description
    if (showModal && offerData?.offerDescription?.en) {
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const hasMoreContent = offerData?.offerDescription?.[language] || offerData?.offerDescription?.en;
 
  const baseContainerClass = cn(
    "flex items-center p-3 rounded-lg border-2 border-dotted mb-2 md:mb-0 cursor-pointer hover:opacity-80 transition-opacity",
    containerClassName
  );

  const titleClass = cn(
    `${!showMoreText && hasMoreContent ? 'offer-title-clamp whitespace-nowrap' : ''} heading-5 font-semibold truncate`,
    titleClassName
  );

  const descriptionClass = cn(
    "offer-description-text",
    "offer-description-clamp",
    descriptionClassName
  );

  const renderTitle = () => {
    if (!title) return null;
    return <h3 className={titleClass}>{title}</h3>;
  };

  const renderDescription = () => {
    if (!description) return null;
    return (
      <div className="flex items-center min-w-0 w-full">
        {description && (
          <p
            className={cn(descriptionClass, "!m-0")}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        {showMoreText && hasMoreContent && (
          <InfoIcon
            width={17}
            height={17}
            className="cursor-pointer flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              if (showModal && offerData?.offerDescription?.en) {
                setIsModalOpen(true);
              }
            }}
          />
        )}
      </div>
    );
  };

  const renderDesktopContent = () => {
    if (type === 0) {
      return (
        <div className="flex flex-col pl-1 w-full min-w-0">
          <div className="flex min-w-0">
            {renderTitle()}
          </div>
          {description && (
            <div className="flex text-sm min-w-0 mt-1">
              {renderDescription()}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col pl-3 w-full min-w-0">
        <div className="flex items-center gap-x-2 min-w-0">
          <div className="min-w-0 flex-1">
            {renderTitle()}
          </div>
        </div>
        {description && (
          <div className="flex items-center heading-6 min-w-0">
            {renderDescription()}
          </div>
        )}
      </div>
    );
  };

  const renderMobileContent = () => (
    <div className="flex flex-col px-3 w-full min-w-0">
      <div className="min-w-0">
        {renderTitle()}
      </div>
      {description && (
        <div className="flex items-center justify-between text-sm min-w-0">
          {renderDescription()}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Layout */}
      <div className={cn("md:hidden pb-1 pt-4", mobilecontainerClassName)}>
        <div
          onClick={handleClick}
          className={cn(baseContainerClass, "min-w-0")}
          style={{
            backgroundColor: bgColor,
            color: textColor,
            borderColor: textColor,
          }}
        >
          {icon && (
            <div className={cn("flex-shrink-0", iconClassName)}>
              {icon}
            </div>
          )}
          {renderMobileContent()}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className={cn("hidden md:block pb-5", containerWidthClassName)}>
        <div
          onClick={handleClick}
          className={cn(baseContainerClass, "min-w-0")}
          style={{
            backgroundColor: bgColor,
            color: textColor,
            borderColor: textColor,
          }}
        >
          {icon && (
            <div className={cn("flex-shrink-0", iconClassName)}>
              {icon}
            </div>
          )}
          {renderDesktopContent()}
        </div>
      </div>

      {/* Offer Details Modal */}
      {offerData && offerData?.offerDescription?.en && (
        <OfferDetailsModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          offerData={offerData}
        />
      )}

      <style>{`
        .offer-description-text {
          font-size: 13px !important;
        }

        .offer-description-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
          text-overflow: ellipsis;
          flex: 1;
          min-width: 0;
          margin: 0;
          padding: 0;
          margin-right: 0;
        }

        .offer-title-clamp {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 1.4;
        }

       
        .offer-icon {
          margin-top: -3px;
        }

        .offer-title-container {
          padding-left: 2px;
        }

        .offer-more-link {
          margin-left: -4px !important;
        }
      `}</style>
    </>
  );
};

export default OfferCard;
