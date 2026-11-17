'use client';
import React from 'react';
import useHomePageData from '@hooks/homepage/useHomePageData';
import { StoreFrontCard } from './StoreFrontCard';
import { Store, MenuPeriodType, RestaurantData } from '../type/store.types';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import Loader from '@components/loader/Loader';
import { NO_SHOP_PLACEHOLDER } from '@config/Header/image.config';
import { TranslationKeys } from 'types';
import useLang from '@hooks/useLang';
import { isTimeZone } from '@lib/helper';

export interface StoreFrontListProps {
    onClose?: () => void;
    availableStores?: string[];
    productCategorySlug?: string;
    linkedMenus?: Array<{
        menuId: string;
        menuSlug: string;
    }>;
    urlManagement?: {
        canonicalUrl: string;
        currentUrl: string;
        customSlug: string;
        urlPattern: string;
    };
    scanOrderMode?: boolean;
    locationDisplayName?: string;
    redirectToFullMenu?: boolean;
}

export const StoreFrontList: React.FC<StoreFrontListProps> = ({
    onClose,
    availableStores,
    productCategorySlug,
    linkedMenus,
    urlManagement,
    scanOrderMode,
    locationDisplayName,
    redirectToFullMenu,
}) => {

    

    const [lang] = useLang() as [TranslationKeys, 'en' | 'ar'];
    const location = useSelector((state: RootState) => state.location) as { latitude: number; longitude: number };
    const { storeData, error, loading } = useHomePageData(location.latitude, location.longitude, isTimeZone());
    if (loading) {
        return (
            <div className="loader-container" style={{ height: '70vh' }}>
                <Loader />
            </div>
        );
    }

    const restaurantData: RestaurantData[] = Array.isArray(storeData?.data) ? storeData.data : [];
    
    
    // Filter stores based on availableStores if provided
    let filteredRestaurantData = availableStores && availableStores.length > 0 
        ? restaurantData.filter((restaurant) => availableStores.includes(restaurant.slug))
        : restaurantData;

    // Product store-selection mode: only show stores where at least one menu period slug matches product's linkedMenus
    const isProductStoreSelection = Boolean(availableStores?.length);
    const hasLinkedMenus = Array.isArray(linkedMenus) && linkedMenus.length > 0;
    if (isProductStoreSelection && hasLinkedMenus) {
        const linkedSlugs = linkedMenus.map((m) => m.menuSlug.toLowerCase());
        filteredRestaurantData = filteredRestaurantData.filter((restaurant) =>
            restaurant.menuPeriods?.some((period) =>
                linkedSlugs.includes((period.slug || '').toLowerCase())
            )
        );
    }

    return (
        <div className="restaurant-list">
            {(filteredRestaurantData.length === 0 && !loading) || (error && !storeData?.data?.length) ? (
                <div className="no-store-found">
                    <img fetchPriority="high" src={NO_SHOP_PLACEHOLDER} alt="No Shop Placeholder" height={150} width={150} />
                    <p className="no-store-found-text">
                        {availableStores && availableStores.length > 0 
                            ? "No matching stores found for this product" 
                            : lang.noOutletsFound
                        }
                    </p>
                </div>
            ) : (
                filteredRestaurantData.map((restaurant) => {
                    const visibleMenuPeriods = restaurant.menuPeriods.filter(
                        (period) => period.menuType !== 'banner'
                    );
                    const storeData: Store = {
                        ...restaurant,
                        menuPeriods: visibleMenuPeriods.map((period) => ({
                            ...period,
                            type: period.type as MenuPeriodType,
                        })),
                    };
                    // Create menu periods data based on linkedMenus if available
                    let menuPeriodsData;
                   
                    // Store-level isOpen - if store is closed, all periods are closed
                    const storeIsOpen = restaurant.isOpen ?? false;

                    if (linkedMenus && linkedMenus.length > 0) {
                        // Only show menu periods that match linkedMenus
                        menuPeriodsData = linkedMenus
                            .map((menu) => {
                                const matchingPeriod = visibleMenuPeriods.find(
                                    (period) => period.slug.toLowerCase() === menu.menuSlug.toLowerCase()
                                );
                                // Only return if there's a matching period
                                if (matchingPeriod) {
                                    // Consider both store-level and period-level isOpen
                                    const isPeriodOpen = storeIsOpen && matchingPeriod.isOpen;
                                    return {
                                        title: menu.menuSlug.charAt(0).toUpperCase() + menu.menuSlug.slice(1),
                                        id: matchingPeriod.id,
                                        openStatus: isPeriodOpen ? 'Open' : 'Closed',
                                        hours: `${matchingPeriod.openTime} - ${matchingPeriod.closeTime}`,
                                        slug: matchingPeriod.slug,
                                        isOpen: isPeriodOpen,
                                        storeIsOpen: storeIsOpen,
                                    };
                                }
                                return null; // Don't show if no match
                            })
                            .filter((item): item is NonNullable<typeof item> => item !== null); // Type-safe filter
                    } else {
                        // Fallback to original behavior if no linkedMenus
                        menuPeriodsData = visibleMenuPeriods.map(period => {
                            // Consider both store-level and period-level isOpen
                            const isPeriodOpen = storeIsOpen && period?.isOpen;
                            return {
                                title: period.type,
                                ...(period.id && { id: period.id }),
                                openStatus: isPeriodOpen ? 'Open' : 'Closed',
                                hours: `${period?.openTime} - ${period?.closeTime}`,
                                slug: period.slug,
                                isOpen: isPeriodOpen,
                                storeIsOpen: storeIsOpen,
                            };
                        });
                    }
                    return (
                        <StoreFrontCard
                            key={restaurant.id}
                            name={restaurant.name}
                            distance={
                                restaurant.distances.distance !== undefined
                                    ? `${restaurant.distances.distance.toFixed(2)} ${restaurant.distances.unit}`
                                    : undefined
                            }
                            address={restaurant?.address?.address}
                            rating={restaurant?.overallRatings?.average || 0}
                            reviews={restaurant?.overallRatings?.totalReview || 0}
                            store={storeData}
                            onClose={onClose}
                            restaurantData={menuPeriodsData}
                            urlManagement={urlManagement}
                            productCategorySlug={productCategorySlug}
                            linkedMenus={linkedMenus}
                            scanOrderMode={scanOrderMode}
                            locationDisplayName={scanOrderMode ? locationDisplayName : undefined}
                            redirectToFullMenu={redirectToFullMenu}
                        />
                    );
                })
            )}
            <style>{`
        .no-store-found {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          height: 40vh;
        }

        .no-store-found-text{
          font-size: var(--heading-h2);
          font-weight: var(--font-bold);
          color: var(--primary-text);
          padding-top: 20px;
        }
      `}</style>
        </div>
    );
};
