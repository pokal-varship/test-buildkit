'use client';

import React from 'react';
import Link from 'next/link';
import { getTenantConfig } from '@config/tenant.config';
import { useSelector } from 'react-redux';
import { selectIsQrFlowActive } from '@redux/slices/qrFlowSlice';
import { useQRToken } from '@components/provider/QRProvider';

export interface AppLogoProps {
  /**
   * URL of the logo image
   * If not provided, will use tenant config logo
   */
  logoUrl?: string;
  
  /**
   * Alt text for the logo image
   * @default "Logo"
   */
  alt?: string;
  
  /**
   * Title attribute for the logo image
   * @default "Logo"
   */
  title?: string;
  
  /**
   * Link href destination
   * @default "/"
   */
  href?: string;
  
  /**
   * Logo image width in pixels or "auto" for automatic sizing
   * @default 125
   */
  width?: number | 'auto';
  
  /**
   * Logo image height in pixels or "auto" for automatic sizing
   * @default 23
   */
  height?: number | 'auto';
  
  /**
   * Additional CSS class name for the link wrapper
   */
  linkClassName?: string;
  
  /**
   * Additional CSS class name for the image
   * Note: For flexible aspect ratios, use object-contain in className
   */
  imageClassName?: string;
  
  /**
   * Priority for image loading
   * @default "high"
   */
  fetchPriority?: 'high' | 'low' | 'auto';
  
  /**
   * Maximum width constraint (in pixels, CSS units, or "auto")
   * Useful for responsive logos with different aspect ratios
   */

}

/**
 * Reusable Logo Component
 * 
 * Displays a logo image with optional link wrapper.
 * Automatically uses tenant config logo if logoUrl is not provided.
 * 
 * **Aspect Ratio Handling:**
 * - Uses `object-fit: contain` by default to maintain aspect ratio
 * - Supports rectangular, square, and any aspect ratio logos
 * - Responsive sizing with max-width/max-height constraints
 * 
 * @example
 * ```tsx
 * // Basic usage (maintains aspect ratio automatically)
 * <AppLogo />
 * 
 * // Custom logo with flexible sizing
 * <AppLogo 
 *   logoUrl="/custom-logo.png" 
 *   height="60px"
 * />
 * 
 * // Square logo example
 * <AppLogo 
 *   height="80px"
 *   imageClassName="w-20 h-20 object-contain"
 * />
 * 
 * // Rectangular logo example
 * <AppLogo 
 *   height="40px"
 * />
 * ```
 */
const AppLogo: React.FC<AppLogoProps> = ({
  logoUrl,
  alt = 'Logo',
  title = 'Logo',
  href = '/',
  width = 'auto',
  height = 40,
  linkClassName = 'logo-link',
  imageClassName = 'logo',
  fetchPriority = 'high',
}) => {
  const tenantConfig = getTenantConfig();
  const finalTitle = title || `${tenantConfig.appName} Logo` || 'app-logo';
  const finalAlt = alt || `${tenantConfig.appName} Logo` || 'app-logo';
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const qrToken = useQRToken();

  const effectiveHref = isQrFlowActive && qrToken ? `/t/${qrToken}` : href;


  return (
    <Link href={effectiveHref} className={linkClassName}>
      <img
        fetchPriority={fetchPriority}
        title={finalTitle}
        src={logoUrl}
        alt={finalAlt}
        className={imageClassName}
        width={width}
        height={height}
      
      />
    </Link>
  );
};

export default AppLogo;

