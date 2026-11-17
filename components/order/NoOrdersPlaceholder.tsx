'use client';

import React from 'react';
import NoDataPlaceholder from '@components/no-data-placeholder/no-data-placeholder';
import useLang from '@hooks/useLang';
import useMenuModal from '@hooks/useMenuModal';
import { useQrFullMenuNavigation } from '@hooks/useQrFullMenuNavigation';
import type { TranslationKeys } from 'types';
import { NO_ORDERS_PLACEHOLDER } from '../../config/Header/image.config';

const NoOrdersPlaceholder = () => {
  const [lang]: [TranslationKeys, 'en' | 'ar'] = useLang();
  const { handleOpenMenuModal } = useMenuModal();
  const { navigateToQrFullMenu } = useQrFullMenuNavigation();

  const handleExploreMenu = () => {
    const navigated = navigateToQrFullMenu();
    if (!navigated) {
      handleOpenMenuModal();
    }
  };

  return (
    <>
    <NoDataPlaceholder
      imageSrc={NO_ORDERS_PLACEHOLDER}
      imageAlt="No orders"
      imageWidth={100}
      imageHeight={100}
      title={lang.order.noOrdersYet ?? 'No orders yet!'}
      subtitle={lang.order.startByBrowsingMenu ?? 'Start by browsing the menu'}
      buttonText={lang.order.exploreMenu ?? 'Explore Menu'}
      onButtonClick={handleExploreMenu}
      buttonClassName="w-[270px] max-w-[270px]"
      className="!bg-transparent flex-1 w-full !px-0 !py-12"
      regionLabel="No orders placeholder"
    />
    <style>{`
      .noDataPlaceholder__subtitle{
        margin-bottom: 20px !important;
      }
    `}</style>
  </>
  );
};

export default NoOrdersPlaceholder;
