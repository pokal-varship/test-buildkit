'use client';

import React from 'react';
import { QR_FLOW_PLACEHOLDER } from '@config/Header/image.config';
import { getTenantConfig } from '@config/tenant.config';

const config = getTenantConfig();

const QRMobilePlaceholder: React.FC = () => {
  return (
    <div className="hidden md:flex min-h-screen flex-col items-center justify-center px-8 py-12 bg-[var(--primary-background)] text-center">
      <div className="pb-44">
        <img
          src={config?.lightLogoUrl || '/images/placeholder/no-store-placeholder.svg'}
          alt=""
          className="w-auto h-20 object-cover"
        />
      </div>
      <img src={QR_FLOW_PLACEHOLDER} alt="QR Flow Placeholder" className="w-[200px] h-full object-cover mb-6" />
      <p className="text-[var(--primary-text)] heading-2 font-700 mb-1">Continue on your phone</p>
      <p className="text-[var(--secondary-text)] heading-4 font-500">
        For the best experience, please continue on your phone.
      </p>
    </div>
  );
};

export default QRMobilePlaceholder;
