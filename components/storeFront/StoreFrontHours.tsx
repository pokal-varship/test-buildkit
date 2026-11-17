'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import CustomButton from '../buttons/Button';
import { useStoreSelection } from '@hooks/storepage/useStoreSelection';
import { RestaurantHoursProps } from '../type/store.types';
import SecondaryButton from '@components/buttons/secondaryButton';
import useProductUrl from '@hooks/useProductUrl';
import { useAnalytics } from '@hooks/useAnalytics';
import { getTenantConfig } from '@config/tenant.config';

export const StoreFrontHours: React.FC<RestaurantHoursProps> = ({ 
    title, 
    status, 
    time, 
    store, 
    slug, 
    onClose,
    urlManagement,
    productCategorySlug,
    linkedMenus,
    scanOrderMode,
    redirectToFullMenu,
}) => {
    const { selectStore } = useStoreSelection();
    const router = useRouter();
    const { getCartItemProductUrl } = useProductUrl();
    const { trackMenuCategory } = useAnalytics();
    const { showStoreHoursTime } = getTenantConfig();


    const handleCustomNavigation = async () => {
        // Track store/category selection or order click
        if (store) {
            const categoryName = title || 'All Day';
            await trackMenuCategory({
                category_name: categoryName,
                category_type: 'food',
                store_id: store.id || store.slug,
                store_name: store.name,
                source: 'menu_page',
                has_active_offer: false,
            });
        }

        // Check if custom URL management and linked menus are available
        if (!urlManagement?.customSlug || !linkedMenus?.length) {
            // Fallback to original behavior if no custom configuration
            if (status?.toLowerCase() === 'open' || status?.toLowerCase() === 'closed') {
                selectStore(store, slug, onClose, { redirectToFullMenu });
            }
            return;
        }

        // Find the matching menu for this period (case-insensitive comparison)
            const matchingMenu = linkedMenus.find(menu => 
                menu.menuSlug.toLowerCase() === slug.toLowerCase()
            );

        // If no matching menu found, fallback to original behavior
        if (!matchingMenu) {
            if (status?.toLowerCase() === 'open' || status?.toLowerCase() === 'closed') {
                selectStore(store, slug, onClose, { redirectToFullMenu });
            }
            return;
        }

        // Construct the final URL using hook
        // Format: /products/${productSlug}?store=${storeSlug}&menu=${menuSlug}&category=${categorySlug}
        const url = getCartItemProductUrl(
            urlManagement.customSlug,
            productCategorySlug || '',
            matchingMenu.menuSlug,
            store?.slug || ''
        );
        
        // Close modal if callback is provided before navigation
        onClose?.();
        
        // Add a small delay to ensure authentication state is refreshed
        // This prevents the old refresh token from being used
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Use router.push so that the home page remains in browser history
        // (router.replace was removing the home page entry, causing back to exit the site)
        router.push(url);
    };

    // Determine button label based on matching menu
    const getButtonLabel = () => {
        if (!urlManagement?.customSlug || !linkedMenus?.length) {
            return "View Menu";
        }
        
        const matchingMenu = linkedMenus.find(menu => 
            menu.menuSlug.toLowerCase() === slug.toLowerCase()
        );
        
        return matchingMenu ? "View Product" : "View Menu";
    };

    
    return (
        <div className={`restaurant-hours-container ${scanOrderMode ? 'scan-order-mode' : ''}`}>
            <div className="hours-info">
                <h3 className="title">{title || 'All Day'}</h3>
                <p className={`status ${status === 'Open' ? 'open' : 'closed'}`} style={{opacity: status === 'Open' ? 1 : 0.5}}>{status || 'Open'}</p>
                {showStoreHoursTime && (
                    <p className="time" style={{opacity: status === 'Open' ? 1 : 0.5}}>{time || '12:00am - 11:00pm'}</p>
                )}
            </div>
            {status === 'Open' ?
                <CustomButton
                    label="Order"
                    disabled={!(status === "Open")}
                    onClick={handleCustomNavigation}
                    className="order-button"
                /> :
                <SecondaryButton
                    label={getButtonLabel()}
                    onClick={handleCustomNavigation}
                    className={`!view-menu-button view-btn ${scanOrderMode ? 'scan-order-mode' : ''}`}
                />
                }
            <style>{`
                .restaurant-hours-container.scan-order-mode {
                    background: var(--cards-containers) !important;
                }
                .restaurant-hours-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    background-color: var(--primary-background);
                    border-radius: 8px;
                    font-family: var(--font-family);
                    margin-bottom: 15px;
                }

                .hours-info {
                    flex: 1;
                }

                .status {
                    font-weight: var(--font-light);
                }
                .status.open {
                    color: var(--accent-color);
                }
                .status.closed {
                    color: var(--secondary-text);
                    font-weight: var(--font-medium);
                    font-size: var(--description-font);
                }

                .time {
                    font-size: var(--description-font);
                    color: var(--secondary-text);
                    font-weight: var(--font-regular);
                }

                .order-button {
                    width: 130px;
                    font-weight: var(--font-semi-bold);
                    font-size: var(--button-primary-font-size);
                    font-family: var(--font-family);
                    padding: 10px 20px;
                }
                 .view-btn {
                   background-color: var(--primary-background) !important;
                   width: 130px;
                 }
                 .view-btn.scan-order-mode {
                    background-color: var(--button-secondary-background) !important;
                 }
                .title {
                    color: var(--primary-text);
                    font-size: var(--heading-h4);
                    font-weight: var(--font-light);
                }
                @media (max-width: 768px) {
                   .view-menu-button {
                        width: 100px;
                        padding:10px 5px;
                        font-size: var(--description-font);
                        font-weight: var(--font-medium);
                    }  
                    .order-button{
                        width: 105px;
                        padding: 10px;
                        font-size: var(--description-font);
                        font-weight: var(--font-medium);
                    }
                    .title {
                        font-size: var(--description-font);
                    }
                    .status.closed {
                        font-size: var(--extraSmall-font);
                    }
                    .status.open {
                        font-size: var(--extraSmall-font);
                    }
                    .time {
                        font-size: var(--extraSmall-font);
                    }
                    .view-btn {
                        width: 105px;
                        padding: 10px;
                    }
                }
            `}</style>
        </div>
    );
};