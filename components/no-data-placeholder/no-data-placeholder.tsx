import Icon from '@components/image/Icons';
import React, { memo, useId } from 'react';

export interface NoDataPlaceholderProps {
  imageSrc?: string;
  image?: React.ReactNode;
  imageAlt?: string;
  imageIconId?: string; // When set, renders via Icon instead of img
  imageViewBox?: string;
  imageColor?: string;
  title: string;
  subtitle?: string | React.ReactNode;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
  imageWidth?: number;
  imageHeight?: number;
  regionLabel?: string; // Optional ARIA label for the region
  buttonAriaLabel?: string; // Optional ARIA label for the button
  buttonClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

const NoDataPlaceholder: React.FC<NoDataPlaceholderProps> = memo(({
  imageSrc,
  image,
  imageAlt = 'No data illustration',
  imageIconId,
  imageViewBox,
  imageColor,
  imageWidth = 120,
  imageHeight = 120,
  title,
  subtitle,
  buttonText,
  onButtonClick,
  className = '',
  regionLabel = 'No data placeholder',
  buttonAriaLabel,
  buttonClassName = '',
  titleClassName = '',
  subtitleClassName = '',
}) => {
  const titleId = useId();

  return (
    <section
      role="region"
      aria-label={regionLabel}
      aria-labelledby={titleId}
      tabIndex={0}
      className={` flex flex-col items-center bg-[var(--cards-containers)] justify-center rounded-xl p-12 ${className}`}
    >
      <div className="mb-6">
        {image ?? (imageIconId ? (
          <Icon
            icon={`${imageSrc}#${imageIconId}`}
            width={imageWidth}
            height={imageHeight}
            viewBox={imageViewBox}
            color={imageColor}
          />
        ) : (
          <img
            fetchPriority="high"
            src={imageSrc}
            alt={imageAlt}
            width={imageWidth}
            height={imageHeight}
          />
        ))}
      </div>
      <h2
        id={titleId}
        className={`heading-5 font-semibold text-[var(--primary-text)] text-center mb-2 noDataPlaceholder__title ${titleClassName}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`extra-small-font text-[var(--secondary-text)] text-center mb-6 noDataPlaceholder__subtitle ${subtitleClassName}`}
          aria-live="polite"
        >
          {subtitle}
        </p>
      )}
      {buttonText && onButtonClick && (
        <button
          type="button"
          className={`noDataPlaceholder__button text-md bg-[var(--button-primary-background)] text-[var(--button-primary-text)] font-semibold rounded-lg px-7 py-3 transition-colors duration-200 hover:bg-[var(--button-primary-hover-background)] hover:text-[var(--button-primary-hover-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--button-primary-background)] ${buttonClassName}`}
          onClick={onButtonClick}
          aria-label={buttonAriaLabel || buttonText}
        >
          {buttonText}
        </button>
      )}
    </section>
  );
});

NoDataPlaceholder.displayName = 'NoDataPlaceholder';

export default NoDataPlaceholder; 