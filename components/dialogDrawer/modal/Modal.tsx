import React, { FC } from 'react';
import { cn } from '@lib/utils';
import BackArrow from '@components/icons/BackArrow';
import CloseCircleIcon from '@components/icons/CloseCircleIcon';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
  showCloseIcon?: boolean;
  headerClassName?: string;
  titleClassName?: string;
  closeIconClassName?: string;
  /** Position of the close icon: 'left' or 'right' (default: 'right') */
  closeIconPosition?: 'left' | 'right';
  showBackArrow?: boolean;
  backArrowClassName?: string;
  /** Custom icon to show instead of BackArrow (e.g. CloseCircleIcon) */
  customBackIcon?: React.ReactNode;
  productTitle?: string;
  productClassName?: string;
  productPrice?: string | React.ReactNode;
  showScrollbar?: boolean;
};

const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  showCloseIcon = true,
  containerClassName,
  headerClassName,
  titleClassName,
  closeIconClassName,
  closeIconPosition = 'right',
  showBackArrow = false,
  backArrowClassName,
  customBackIcon,
  productTitle,
  productClassName,
  productPrice = "",
  showScrollbar = false,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if the user clicks directly on the overlay, not on the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div
        className={cn("modal-container fixed inset-0 z-50 flex justify-center items-end md:items-center transition-all", containerClassName)}
        onClick={handleOverlayClick}
      >
        <div
          className={cn(
            'w-full md:max-w-md flex flex-col fixed bottom-0 left-0 right-0 md:static  md:rounded-xl bg-[var(--primary-background)]  p-4 md:p-6 text-[var(--primary-text)] shadow-lg transition-all',
            'md:translate-y-0 translate-y-0 md:rounded-xl',
            className
          )}
          onClick={e => e.stopPropagation()}
        >
          {(title || showCloseIcon) && (
            <div className={cn("flex justify-between items-center flex-wrap mb-3 ", headerClassName)}>
              {showBackArrow && (
                customBackIcon ? (
                  <div className={cn("cursor-pointer", backArrowClassName)} onClick={onClose}>
                    {customBackIcon}
                  </div>
                ) : (
                  <BackArrow
                    className={cn("cursor-pointer", backArrowClassName)}
                    pathFillColor={"var(--primary-text)"}
                    onClick={onClose}
                  />
                )
              )}
              {title && <h2 className={cn("order-modal-title", titleClassName)}>{title}</h2>}
              {productTitle && <h2 className={cn("text-lg product-title font-semibold w-full border-b border-[var(--borders-dividers)]", productClassName)}>{productTitle}{productPrice && <span className='price'> | {productPrice}</span>}</h2>}
              {showCloseIcon && (
                <CloseCircleIcon
                  width={30}
                  height={30}
                  className={cn(
                    "cursor-pointer absolute top-5",
                    closeIconPosition === 'left' ? 'left-5' : 'right-5',
                    closeIconClassName
                  )}
                  onClick={onClose}
                />
              )}

            </div>
          )}
          <div className={cn("w-full overflow-y-auto pb-[1rem]", !showScrollbar && "hide-scrollbar")}>
            {children}
          </div>
        </div>
      </div >
      <style>{`
      .modal-container {
        background-color: rgba(0, 0, 0, 0.8);
      }
      .price > * {
        font-size: var(--extraSmall-font)!important;
        font-weight: var(--font-regular)!important;
        color: var(--secondary-text)!important;
      }
      .order-modal-title {
        font-size: var(--heading-h2);
        font-weight: var(--font-bold);
      }
      .product-title {
        padding: 6px 0px 16px !important;
      }
    `}</style>
    </>
  );
};

export default Modal;
