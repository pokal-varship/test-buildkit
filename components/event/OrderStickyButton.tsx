"use client";

import CustomButton from '@components/buttons/Button';
import { useIsAppWebView } from '@hooks/useIsAppWebView';
import React from 'react';

interface StickyOrderButtonProps {
  label?: string;
  onClick?: () => void;
  icon?: string;
}

const OrderStickyButton: React.FC<StickyOrderButtonProps> = ({
  label = 'Order Online',
  onClick,
  icon,
}) => {
  const isAppWebView = useIsAppWebView();

  if (isAppWebView) {
    return null;
  }

  return (
    <div className="sticky-button">
      <CustomButton
        onClick={onClick}
        className="sticky-button-button"
      >
        <div className="sticky-button-content">
        <span>{label}</span>
        {icon && (typeof icon === 'string' ? (
          <img src={icon} alt="icon" className="sticky-button-icon" />
        ) : (
          icon
        ))}
        </div>
      </CustomButton>
      <style>{`
        .sticky-button {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background-color: var(--primary-background);
          padding: 20px 12px;
          z-index: 1;
        }
        .sticky-button-button {
          width: 100%;
          background-color: var(--primary-color);
          color: var(--black);
          font-size: var(--heading-h5);
          font-weight: var(--font-bold);
        }
        .sticky-button-button:hover {
          color: var(--black);
        }
        .sticky-button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
      `}</style>
    </div>
  );
};

export default OrderStickyButton;
