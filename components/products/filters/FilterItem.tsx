'use client';
import React from 'react';
import { Category } from '@components/type/store.types';
import Link from 'next/link';
import { useLanguage } from 'context/LanguageContext';
import useProductUrl from '@hooks/useProductUrl';
import { cn } from '@lib/utils';

interface FilterItemProps {
  category: Category;
  level?: number;
  onSelect?: (category: Category) => void;
  selectedCat: string;
  storeId: string;
  menuId: string;
  onClick?: (categorySlug: string) => void;
  productCount?: number;
}

export const FilterItem: React.FC<FilterItemProps> = ({ 
  category,
  selectedCat,
  onClick,
  productCount,
}) => {
  const { selectedLang } = useLanguage();
  const language = selectedLang.code.toLowerCase();
  const { getCategoryUrl } = useProductUrl();
  const categorySlug = category.categorySlug || '';
  const categoryName = category.displayName || category?.categoryName?.[language as keyof typeof category.categoryName] || '';
  const isSelected = selectedCat === categorySlug;

  if (onClick) {
    return (
      <div>
        <div
          onClick={() => onClick(categorySlug)}
          className="flex items-center cursor-pointer"
        >
          <div className={cn(
            "flex items-center justify-between py-2 capitalize w-full heading-5 px-4",
            isSelected 
              ? "text-[var(--accent-color)] font-600"
              : "font-500 text-[var(--primary-text)]"
          )}>
            <span>{categoryName}</span>
            {productCount !== undefined && (
              <span className={cn(
                "ml-auto",
                isSelected && "text-[var(--accent-color)]"
              )}>
                {productCount.toString().padStart(2, '0')}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={getCategoryUrl(categorySlug)}
        className={cn(
          "flex items-center cursor-pointer",
          isSelected && "text-[var(--warning)]"
        )}
        prefetch={true}
      >
        <h3 className={cn(
          "flex items-center justify-between py-2 capitalize w-full heading-5 px-4",
          isSelected
            ? "md:border-l-4 border-l-[var(--primary-color)] md:pl-[10px] md:bg-[var(--secondary-active-background)] text-[var(--accent-color)] md:text-[var(--primary-color)] opacity-90 font-600"
            : "font-500 pl-4 text-[var(--primary-text)]"
        )}>
          <span>{categoryName}</span>
          {productCount !== undefined && (
            <span className={cn("ml-auto md:hidden", isSelected && "text-[var(--accent-color)] md:text-[var(--primary-color)]")}>
              {productCount.toString().padStart(2, '0')}
            </span>
          )}
        </h3>
      </Link>
    </div>
  );
};