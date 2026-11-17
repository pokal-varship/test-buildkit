import React from "react";
import Modal from "@components/dialogDrawer/modal/Modal";
import formatCurrency from "@lib/helper/price";
import { getTenantConfig } from '@config/tenant.config';
import { generateImageBase64FromUrl } from '@lib/helper/ImageGen/imageGen';

interface ComboOption {
  id: string;
  type: "single" | "combo"; // add type key
  title: string;
  price: number;
  discountedPrice: number;
  description?: string;
  savings?: number | null;
  includes?: { image: string; label: string }[];
  primaryProduct: {
    image: string;
    name: string;
    customSlug?: string;
    productCategorySlug?: string;
    productCategoryName?: string;
  };
  groupDetails?: {
    image: string;
    name: string;
    customSlug?: string;
    productCategorySlug?: string;
    categoryName?: string;
  }[];
}

interface ComboOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  comboOptions: ComboOption[];
  storeSlug?: string;
  menuSlug?: string;
  /**
   * Called when a card is clicked. For now, just logs or handles static data.
   * In future, use this for routing: single = PDP, combo = combo PLP.
   */
  onSelect?: (option: ComboOption, type: "single" | "combo") => void;
}

const ComboOptionsModal: React.FC<ComboOptionsModalProps> = ({
  isOpen,
  onClose,
  comboOptions,
  onSelect,
}) => {
  const tenantConfig = getTenantConfig();
  
  const handleComboSelect = (option: ComboOption) => {
    // Always call onSelect and let ProductContainer handle the logic
    if (onSelect) {
      onSelect(option, option.type);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Make it a Meal"
      containerClassName="!items-center"
      className="w-full md:max-w-[1136px] max-h-[626px] rounded-lg mx-4 md:rounded-xl overflow-auto flex flex-col md:mx-auto my-auto !static"
      titleClassName="md-heading-2 heading-4"
    >
      {/* Desktop (md and up): original row layout */}
      <div className="hidden md:flex flex-row items-stretch justify-between gap-4 w-full mt-3">
        {comboOptions.map((option, i) => {
          return (
            <React.Fragment key={option.id}>
              <div
                className={`flex flex-col items-center w-full h-full cursor-pointer ${comboOptions.length === 2 ? 'max-w-[450px]' : 'max-w-[300px]'}`}
                onClick={() => handleComboSelect(option)}
              >
                {/* Card with fixed 300x300px box for images */}
                <div
                  className="flex flex-col items-center p-0 w-full relative h-full"
                  style={{ boxSizing: "border-box" }}
                >
                  {/* Image box */}
                  <div className={`relative w-full h-full min-h-[300px] max-h-[300px] flex flex-col items-center justify-between overflow-hidden mb-0 ${comboOptions.length === 2 ? 'max-w-[450px]' : 'max-w-[300px]'}`}>
                    {/* Main image logic */}
                    {option.groupDetails && option.groupDetails.length > 0 ? (
                      <>
                        <img
                          src={option.primaryProduct.image || generateImageBase64FromUrl({url: tenantConfig.productPlaceholderImageUrl || "", width: 315, height: 315})?.fullEncodedUrl || ""}
                          alt={option.primaryProduct.name}
                          title={option.primaryProduct.name}
                          className="w-[198px] h-[170px] object-cover mx-auto"
                          onError={(e) => {

                            // Fallback to placeholder
                            const target = e.target as HTMLImageElement;
                            target.src = generateImageBase64FromUrl({url: tenantConfig.productPlaceholderImageUrl || "", width: 315, height: 315})?.fullEncodedUrl || "";
                          }}
                        />
                        <span className="block text-2xl font-bold text-black my-1">
                          +
                        </span>
                        <div className="flex flex-row items-center justify-center gap-2 w-full">
                          {option.groupDetails.map((inc, j) => {
                            const n = option.groupDetails!.length;
                            const isSmall = n > 2;
                            return (
                              <React.Fragment key={j}>
                                <img
                                  src={inc.image || generateImageBase64FromUrl({url: tenantConfig.productPlaceholderImageUrl || "", width: 315, height: 315})?.fullEncodedUrl || ""}
                                  alt={inc.name}
                                  title={inc.name}
                                  className={
                                    isSmall
                                      ? "object-cover w-full max-w-[70px] md:max-w-[50px] h-full max-h-[70px] md:max-h-[50px]"
                                      : "object-cover w-full max-w-[80px] h-full max-h-[80px] md:max-w-[104px]  md:max-h-[104px]"
                                  }
                                  onError={(e) => {

                                    // Fallback to placeholder
                                    const target = e.target as HTMLImageElement;
                                    target.src = generateImageBase64FromUrl({url: tenantConfig.productPlaceholderImageUrl || "", width: 315, height: 315})?.fullEncodedUrl || "";
                                  }}
                                />
                                {j < n - 1 && (
                                  <span className="font-bold text-2xl">+</span>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <img
                        src={option.primaryProduct.image || generateImageBase64FromUrl({url: tenantConfig.productPlaceholderImageUrl || "", width: 315, height: 315})?.fullEncodedUrl || ""}
                        alt={option.primaryProduct.name}
                        title={option.primaryProduct.name}
                        className={`${comboOptions.length > 2 ? 'w-[300px]' : 'w-[350px]'} h-[300px] object-cover mx-auto`}
                        onError={(e) => {

                          // Fallback to placeholder
                          const target = e.target as HTMLImageElement;
                          target.src = generateImageBase64FromUrl({url: tenantConfig.productPlaceholderImageUrl || "", width: 315, height: 315})?.fullEncodedUrl || "";
                        }}
                      />
                    )}
                  </div>
                  {/* Yellow button area at the bottom (fixed 60px) */}
                  <div className="w-full bg-[var(--button-primary-background)] rounded-lg flex flex-row items-center justify-between px-4 py-0 mt-5 min-h-16">
                    <span className="text-left" style={{ fontWeight: 'bold', fontSize: 'var(--heading-h4)', color: 'inherit' }}>
                      {option.title}
                    </span>
                    <span className="flex flex-row items-center gap-2">
                      {option.price !== option.discountedPrice && tenantConfig.showStrikethroughPrice && (
                        <span className="line-through" style={{ fontSize: 'var(--heading-h4)', color: 'inherit' }}>
                          {formatCurrency({ amount: option.price })}
                        </span>
                      )}
                      <span style={{ fontWeight: 'bold', fontSize: 'var(--heading-h4)', color: 'inherit' }}>
                        {formatCurrency({ amount: option.discountedPrice })}
                      </span>
                    </span>
                  </div>
                </div>
                {/* Savings text (only for options with savings), below the card */}
                {typeof option.savings === "number" &&
                  option.savings > 0 &&
                  !isNaN(option.savings) && (
                    <div className="w-full text-[var(--success)] text-base md-font-500 text-right mr-5 py-2">
                      You save {formatCurrency({ amount: option.savings })}
                    </div>
                  )}
              </div>
              {/* OR divider between cards, except after last card */}
              {i < comboOptions.length - 1 && (
                <div
                  className="flex flex-col items-center justify-center h-full mx-2"
                  style={{ minWidth: 40, height: "406px" }}
                >
                  <div className="flex-1 w-px bg-[var(--borders-dividers)]" />
                  <span className="text-[var(--secondary-text)] md-heading-5 my-2">
                    OR
                  </span>
                  <div className="flex-1 w-px bg-[var(--borders-dividers)]" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile (below md): vertical card list */}
      <div className="flex flex-col md:hidden w-full mt-3 gap-2">
        {comboOptions.map((option, i) => (
          <React.Fragment key={option.id}>
            <div
              className="flex flex-row items-center w-full rounded-lg mb-2 p-2 cursor-pointer"
              onClick={() => handleComboSelect(option)}
            >
              {/* Image */}
              <div className="flex items-center justify-center flex-shrink-0 w-[70px] h-[70px]">
                {option.groupDetails && option.groupDetails.length > 0 ? (
                  <div className="flex flex-col items-center w-full h-full justify-between">
                    {/* Main image on top, reduced height */}
                    <img
                      src={option.primaryProduct.image || generateImageBase64FromUrl({url: tenantConfig.productPlaceholderImageUrl || "", width: 315, height: 315})?.fullEncodedUrl || ""}
                      alt={option.primaryProduct.name}
                      title={option.primaryProduct.name}
                      className="w-full h-[38px] object-cover rounded"
                      onError={(e) => {

                        // Fallback to placeholder
                        const target = e.target as HTMLImageElement;
                        target.src = generateImageBase64FromUrl({url: tenantConfig.productPlaceholderImageUrl || "", width: 315, height: 315})?.fullEncodedUrl || "";
                      }}
                    />
                    {/* Included images in a row below */}
                    <div className="flex flex-row items-center justify-center w-full mt-1">
                      {option.groupDetails.map((inc, j) => (
                        <React.Fragment key={j}>
                          <img
                            src={inc.image || generateImageBase64FromUrl({url: tenantConfig.productPlaceholderImageUrl || "", width: 315, height: 315})?.fullEncodedUrl || ""}
                            alt={inc.name}
                            title={inc.name}
                            className="w-[24px] h-[24px] object-cover rounded"
                            onError={(e) => {

                              // Fallback to placeholder
                              const target = e.target as HTMLImageElement;
                              target.src = generateImageBase64FromUrl({url: tenantConfig.productPlaceholderImageUrl || "", width: 315, height: 315})?.fullEncodedUrl || "";
                            }}
                          />
                          {j < option.groupDetails!.length - 1 && (
                            <span className="mx-0.5 font-bold text-base">
                              +
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ) : (
                  <img
                    src={option.primaryProduct.image || generateImageBase64FromUrl({url: tenantConfig.productPlaceholderImageUrl || "", width: 315, height: 315})?.fullEncodedUrl || ""}
                    alt={option.primaryProduct.name}
                    title={option.primaryProduct.name}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {

                      // Fallback to placeholder
                      const target = e.target as HTMLImageElement;
                      target.src = generateImageBase64FromUrl({url: tenantConfig.productPlaceholderImageUrl || "", width: 315, height: 315})?.fullEncodedUrl || "";
                    }}
                  />
                )}
              </div>
              {/* Info */}
              <div className="flex flex-col flex-1 ml-3">
                <span className="text-left" style={{ fontWeight: '700', fontSize: 'var(--heading-h5)' }}>
                  {option.title}
                </span>
                <span className="flex flex-row items-center gap-2 mt-1">
                  {option.price !== option.discountedPrice && tenantConfig.showStrikethroughPrice && (
                    <span className="text-base opacity-70 line-through">
                      {formatCurrency({ amount: option.price })}
                    </span>
                  )}
                  <span style={{ fontWeight: '700', fontSize: 'var(--heading-h5)' }}>
                    {formatCurrency({ amount: option.discountedPrice })}
                  </span>
                </span>

                {typeof option.savings === "number" &&
                  option.savings > 0 &&
                  !isNaN(option.savings) && (
                    <div className="text-[var(--success)] text-sm font-medium mt-1">
                      You save {formatCurrency({ amount: option.savings })}
                    </div>
                  )}
              </div>
              {/* Right arrow button */}
              <button className="rounded-full transition-colors">
                <img
                  fetchPriority="high"
                  alt="Arrow Icon"
                  src="/images/arrow.png"
                  title="Product details"
                  width={25}
                  height={25}
                  className="md:w-[25px] md:h-[25px]"
                />
              </button>
            </div>
            {/* OR divider between cards, except after last card */}
            {i < comboOptions.length - 1 && (
              <div className="flex flex-row items-center w-full my-1">
                <div className="flex-1 h-px bg-[var(--borders-dividers)]" />
                <span className="text-[var(--secondary-text)] text-sm mx-2">
                  OR
                </span>
                <div className="flex-1 h-px bg-[var(--borders-dividers)]" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <style>{`
        @media (max-width: 1200px) {
          .combo-modal-width { max-width: 98vw !important; }
        }
        @media (max-width: 900px) {
          .combo-modal-width { max-width: 100vw !important; height: auto !important; min-height: 0 !important; }
        }
        @media (max-width: 768px) {
          .combo-modal-width { max-width: 100vw !important; height: auto !important; min-height: 0 !important; }

          .heading-2{
              font-size: var(--heading-2) !important;
          }
          .heading-4{
              font-size: var(--heading-h4) !important;
          }
        }
        @media (min-width: 768px) {
        .md-font-700 {
          font-weight: var(--font-bold);
        }
        .md-heading-5 {
          font-size: var(--heading-h5);
        }
      }

      .md-heading-4 {
          font-size: var(--heading-h4);
      }
      .md-font-500 {
          font-weight: var(--font-medium);
      }

      `}</style>
    </Modal>
  );
};

export default ComboOptionsModal;
