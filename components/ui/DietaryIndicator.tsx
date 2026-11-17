import React from 'react';
import { NON_VEG_ICON, VEG_ICON } from '@config/Header/image.config';
import { getTenantConfig } from '@config/tenant.config';
import { cn } from '@lib/utils';

interface DietaryIndicatorProps {
  /** Whether the product contains meat */
  containsMeat: boolean;
  /** Additional CSS classes for the container */
  containerClassName?: string;
  /** Additional CSS classes for the image */
  imageClassName?: string;
  /** Image size (width and height) */
  size?: {
    width?: number | string;
    height?: number | string;
  };
  /** Priority for loading the image */
  fetchPriority?: 'high' | 'low' | 'auto';
}

const DietaryIndicator: React.FC<DietaryIndicatorProps> = ({
  containsMeat,
  containerClassName,
  imageClassName,
  size = { width: 20, height: 20 },
  fetchPriority = 'high',
}) => {
  const { showDietaryIndicator } = getTenantConfig();

  if (!showDietaryIndicator) {
    return null;
  }

  const iconSrc = containsMeat ?  NON_VEG_ICON : VEG_ICON;
  const altText = containsMeat ? 'non-veg' : 'veg';
  const titleText = containsMeat ? 'non-veg' : 'veg';

  return (
    <div className={cn('py-2', containerClassName)}>
      <img 
        src={iconSrc}
        alt={altText}
        title={titleText}
        width={size.width}
        height={size.height}
        fetchPriority={fetchPriority}
        className={cn('w-4 h-4', imageClassName)}
      />
    </div>
  );
};

export default DietaryIndicator; 