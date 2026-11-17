"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Icon from "@components/image/Icons";
import { CLOSE_CIRCLE_ICON } from "@config/Header/image.config";
import CustomDialog from "@components/dialogDrawer/dialog";
import useProductUrl from "@hooks/useProductUrl";

interface ComboStep {
  name: string;
  productSlug: string;
  categorySlug: string;
  categoryName: string; // Add category name for display
  component?: 'mainProduct' | 'productList' | 'custom';
}

interface ComboProgressBarProps {
  isVisible: boolean;
  currentStepIndex: number;
  comboSteps: ComboStep[];
  onStepClick?: (stepIndex: number) => void;
  onBackStep?: () => void;
  showBackButton?: boolean;
  pageType?: 'pdp' | 'listing' | 'summary'; // Add page type prop
  onClose?: () => void; // Add close handler
  handlePlpRedirect?: () => void; // Add redirection handler for cross icon
  isFromCartEdit?: boolean; // Add flag to detect cart edit mode
  hasChanges?: boolean; // Add flag to track if changes were made
  isSummaryCompleted?: boolean; // Add prop to track if summary step is completed
  summaryStepIndex?: number; // Add prop to know which step is the summary step
}

const ComboProgressBar: React.FC<ComboProgressBarProps> = ({
  isVisible,
  currentStepIndex,
  comboSteps,
  onStepClick,
  onBackStep,
  showBackButton = false,
  pageType = 'listing', // Default to listing
  onClose,
  handlePlpRedirect,
  isFromCartEdit = false,
  hasChanges = false,
  isSummaryCompleted = false,
  summaryStepIndex = comboSteps.length - 1 // Default to last step
}) => {
  const router = useRouter();
  const params = useParams();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { getCartUrl, getComboStepUrl } = useProductUrl();

  const handleCrossClick = () => {
    // If coming from cart edit and no changes made, directly redirect to cart
    if (isFromCartEdit && !hasChanges) {
      redirectToCart();
      return;
    }
    
    // Otherwise show confirmation modal
    setShowCancelModal(true);
  };

  const handleCancelConfirm = () => {
    setShowCancelModal(false);
    
    // If coming from cart edit, always redirect to cart
    if (isFromCartEdit) {
      redirectToCart();
      return;
    }
    
    // Default behavior for non-cart edit scenarios
    if (handlePlpRedirect) {
      handlePlpRedirect();
    } else if (onClose) {
      onClose();
    }
  };

  const redirectToCart = () => {
    const storeSlug = params?.storeSlug as string;
    router.push(getCartUrl(storeSlug));
  };

  const handleCancelReject = () => {
    setShowCancelModal(false);
  };

  const handleStepClick = (stepIndex: number) => {
    if (onStepClick) {
      onStepClick(stepIndex);
    } else {
      // Default navigation logic
      const step = comboSteps[stepIndex];
      if (step) {
        const storeSlug = params?.storeSlug as string;
        const menuSlug = params?.menuSlug as string;
        router.push(getComboStepUrl(step.categorySlug, step.categoryName, menuSlug, storeSlug));
      }
    }
  };

  const getStepStyles = (idx: number) => {
    const isCurrentStep = idx === currentStepIndex;
    const isPreviousStep = idx < currentStepIndex;
    const isSummaryStep = idx === summaryStepIndex; // Use the actual summary step index
    const isSummaryStepCompleted = isSummaryStep && isSummaryCompleted;

    // Base styles
    let circleClasses = "w-5 h-5 rounded-full border-2 flex items-center justify-center";
    let textClasses =
      "mt-1 heading-5 md-small-font font-semibold text-center leading-tight max-w-full px-0.5";

    if (isPreviousStep || isSummaryStepCompleted) {
      // Previous steps or completed summary: Green background with tickmark
      circleClasses += " bg-[var(--success)] border-[var(--success)]";
      textClasses += " text-[var(--success)]";
          } else if (isCurrentStep) {
        if (pageType === 'pdp') {
          // PDP page: Orange empty round
          circleClasses += " bg-[var(--tertiary-background)] border-[var(--warning)]";
          textClasses += " text-[var(--accent-color)]";
        } else if (pageType === 'listing') {
          // Listing page: Orange empty round (same as PDP)
          circleClasses += " bg-[var(--tertiary-background)] border-[var(--warning)]";
          textClasses += " text-[var(--accent-color)]";
        } else {
          // Summary page: Orange empty round
          circleClasses += " bg-[var(--tertiary-background)] border-[var(--warning)]";
          textClasses += " text-[var(--accent-color)]";
        }
    } else {
      // Future steps: Grey
      circleClasses += " bg-[var(--tertiary-background)] border-[var(--rating-border-primary)]";
      textClasses += " text-[var(--primary-text)]";
    }

    return { circleClasses, textClasses };
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Spacer to prevent content overlap */}
      <div className="h-[135px]"></div>
    
      {/* Progress Bar Container */}
      <div className="combo-progress-container fixed top-0 left-0 right-0 z-40 w-full bg-[var(--primary-background)] md:border-b border-[var(--borders-dividers)]">
        {/* Header with Title and Close Icon */}
        <div className="flex items-center justify-between py-3 md:py-2 px-4 md:px-10">
          <div className="flex items-center">
          {/* Back Arrow - Mobile Only */}
          <div className="md:hidden">
            {pageType !== "pdp" && onBackStep && currentStepIndex > 0 && (
              <Icon
                icon="/images/icon/back-arrow.svg"
                width={24}
                height={24}
                color="var(--primary-text)"
                className="cursor-pointer"
                onClick={onBackStep}
              />
            )}
          </div>
          
          {/* Title - Center on mobile, left on desktop */}
          <h2 className="customize-meal pl-2 font-bold text-[var(--primary-text)] md:flex-1 md:text-left text-center">Customize the meal</h2>
          </div>
          {/* Close Icon */}
          {(handlePlpRedirect || onClose) && (
            <>
              {/* Mobile Close Icon */}
              <Icon
                icon="/images/icon/cross.svg#cross"
                width={16}
                height={16}
                color="var(--primary-text)"
                className="cursor-pointer z-20 md:hidden"
                onClick={handleCrossClick}
              />
              {/* Desktop Close Icon */}
              <Icon
                icon={`${CLOSE_CIRCLE_ICON}#close-circle`}
                width={26}
                height={26}
                color={"var(--primary-text)"}
                className="cursor-pointer z-20 hidden md:block"
                viewBox="0 0 25 25"
                onClick={handleCrossClick}
              />
            </>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="combo-progress-bar md:mx-10 md:mb-4 md:rounded-lg border border-[var(--button-primary-background)] bg-[var(--button-primary-active-background)] px-[9.5px] py-4 flex flex-row items-start justify-between">
          {comboSteps.map((step, idx, arr) => {
            const { circleClasses, textClasses } = getStepStyles(idx);
            
            return (
              <div 
                key={step.name} 
                className="flex-1 flex w-[100px] flex-col items-center relative cursor-pointer"
                onClick={() => handleStepClick(idx)}
              >
                <div className="flex items-center">
                  <span className={circleClasses}>
                    {/* Show tickmark for completed steps */}
                    {(idx < currentStepIndex || (idx === summaryStepIndex && isSummaryCompleted)) && (
                      <svg 
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M20 6L9 17L4 12" 
                          stroke="white" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {/* Show dot for current step on PDP */}
                    {idx === currentStepIndex && pageType === 'pdp' && (
                      <div className="w-2 h-2 bg-[var(--warning)] rounded-full"></div>
                    )}
                  </span>
                </div>
                <span className={textClasses}>{step.categoryName}</span>
                {/* Line between steps */}
                {idx < arr.length - 1 && (
                  <span 
                    className={`absolute top-2 left-1/2 w-full h-0.5 z-0 ${
                      idx < currentStepIndex - 1 || (idx === currentStepIndex - 1 && isSummaryCompleted)
                        ? 'bg-[var(--success)]' // Fully completed steps: solid green line
                        : idx === currentStepIndex - 1 && pageType === 'listing'
                        ? 'bg-gradient-to-r from-[var(--success)] to-[var(--tertiary-background)]' // Current step on listing: half green line
                        : 'bg-[var(--tertiary-background)]' // Future steps or first step: grey line
                    }`}
                    style={{right: '-50%', left: '50%', width: '100%', transform: 'translateX(10px)'}}
                  ></span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Navigation Buttons - Web Only */}
      <div className="fixed bottom-4 left-6 z-50 gap-2 hidden md:flex">
        {/* Back Button */}
        {showBackButton &&
          onBackStep &&
          pageType !== "pdp" && (
          <button
            onClick={onBackStep}
            className="h-14 w-36 rounded-lg border border-[var(--primary-text)] font-semibold cursor-pointer transition-all duration-200 hover:shadow-xl bg-[var(--primary-background)] heading-4"
          >
            Back
          </button>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <CustomDialog
        open={showCancelModal}
        anchor="bottom"
        type="comboCancelModal"
        propsData={{
          onYes: handleCancelConfirm,
          onNo: handleCancelReject,
          title: "Are you sure you want to cancel the meal customization?",
          yesButtonText: "Yes",
          noButtonText: "No"
        }}
        handlerDialog={() => {}}
        handleClose={handleCancelReject}
        onlyDialog={true}
        sxStyle={{
          '& .MuiDialogContent-root': {
            borderRadius: '10px',
            padding: '20px 16px',
          },
        }}
      />

      <style>{`
        .heading-3{
          font-size: var(--heading-h3);
        }
        .customize-meal{
          font-size: 25px;
        }
        .heading-4{
          font-size: var(--heading-h4);
        }
        @media (max-width: 768px) {
          .customize-meal{
            font-size: var(--heading-h3);
          }
          .md-small-font {
            font-size: var(--small-font);
          }
        }
      
      `}</style>
    </>
  );
};

export default ComboProgressBar; 