'use client';
import AddressBar from '@components/address/AddressBar';
import BreadCrumb from '@components/breadcrumb/BreadCrumb';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import useProductUrl from '@hooks/useProductUrl';

interface LocationBarProps {
  category?: string;
}

export const LocationBar: React.FC<LocationBarProps> = ({ category }) => {
  const store = useSelector((state: RootState) => state.store);
  const { getMenuUrl, menuSlug, storeSlug } = useProductUrl();
  
  const storeName = store?.currentStore?.name || 'Store';
  
  // Create the category page link if we have the necessary parameters
  const categoryPageLink = storeSlug && menuSlug && category 
    ? getMenuUrl()
    : undefined;
  
  const breadcrumbItems = [
    { label: 'Home', link: '/', isLink: true },
    { 
      label: storeName, 
      link: categoryPageLink, 
      isLink: !!categoryPageLink 
    },
    ...(category ? [{ label: category, isLink: false }] : [])
  ];
  
  return (
    <div className="hidden md:block pt-4">
      <BreadCrumb 
        items={breadcrumbItems}
        containerClassName="heading-6 flex-nowrap whitespace-nowrap overflow-hidden"
        listContainerClassName="flex-nowrap"
        labelClassName="text-[var(--secondary-text)]"
        separatorClassName="text-[var(--secondary-text)]"
        lastItemClassName="text-[var(--primary-text)]"
      />
      <div className="pb-2">
        <AddressBar />
      </div>
    </div>
  );
};
