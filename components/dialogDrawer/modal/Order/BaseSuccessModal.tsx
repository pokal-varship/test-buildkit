"use client";

import React from "react";
import CustomButton from "@components/buttons/Button";
import SecondaryButton from "@components/buttons/secondaryButton";

interface BaseSuccessModalProps {
  icon: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  title: string;
  message: React.ReactNode;
  primaryButton: {
    text: string;
    onClick: () => void;
    className?: string;
  };
  secondaryButton: {
    text: string;
    onClick: () => void;
    className?: string;
  };
  containerClassName?: string;
  contentClassName?: string;
  iconClassName?: string;
  titleClassName?: string;
  messageClassName?: string;
  buttonsClassName?: string;
  padding?: {
    container?: string;
    content?: string;
  };
  customStyles?: {
    container?: React.CSSProperties;
    content?: React.CSSProperties;
  };
}

const BaseSuccessModal: React.FC<BaseSuccessModalProps> = ({
  icon,
  title,
  message,
  primaryButton,
  secondaryButton,
  containerClassName = "base-success-modal",
  contentClassName = "base-success-modal-content",
  iconClassName = "base-success-modal-icon",
  titleClassName = "base-success-modal-title",
  messageClassName = "base-success-modal-message",
  buttonsClassName = "base-success-modal-buttons",
  padding = {
    container: "30px 10px",
    content: "0px"
  },
  customStyles = {}
}) => {
  return (
    <div className={containerClassName} style={customStyles.container}>
      <div className={contentClassName} style={customStyles.content}>
        <div className="base-success-modal-icon-wrap">
          <img
            src={icon.src}
            alt={icon.alt}
            width={icon.width || 120}
            height={icon.height || 120}
            className={iconClassName}
          />
        </div>

        <h2 className={titleClassName}>{title}</h2>

        <p className={messageClassName}>{message}</p>

        <div className={buttonsClassName}>
          <CustomButton
            className={primaryButton.className || "base-success-modal-primary-btn"}
            onClick={primaryButton.onClick}
          >
            {primaryButton.text}
          </CustomButton>
          <SecondaryButton
            className={secondaryButton.className || "base-success-modal-secondary-btn"}
            onClick={secondaryButton.onClick}
          >
            {secondaryButton.text}
          </SecondaryButton>
        </div>
      </div>
      <style jsx>{`
        .${containerClassName} {
          width: 100%;
          padding: ${padding.container};
          background-color: var(--primary-background);
          height: 100vh;
          align-content: center;
          padding-bottom: 130px;
        }
        .${contentClassName} {
          padding: ${padding.content};
          text-align: center;
        }
        .base-success-modal-icon-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }
        .${iconClassName} {
          display: block;
        }
        .${titleClassName} {
          font-size: var(--heading-h2);
          font-weight: var(--font-bold);
          color: var(--primary-text);
          margin-bottom: 12px;
        }
        .${messageClassName} {
          font-size: var(--heading-h5);
          color: var(--primary-text);
          margin-bottom: 24px;
          line-height: 1.5;
        }
        .${buttonsClassName} {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px;
          background-color: var(--primary-background);
        }
        .base-success-modal-primary-btn {
          width: 100%;
          font-size: var(--heading-h4);
          font-weight: var(--font-bold);
          color: var(--black);
        }
        .base-success-modal-primary-btn:hover {
          color: var(--black);
        }
        .base-success-modal-secondary-btn {
          width: 100%;
          font-size: var(--heading-h4);
          font-weight: var(--font-semi-bold);
        }
      `}</style>
    </div>
  );
};

export default BaseSuccessModal;
