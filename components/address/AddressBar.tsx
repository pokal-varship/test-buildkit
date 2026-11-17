"use client"
import LocationIcon from '@components/icons/LocationIcon';
import useLang from '@hooks/useLang';
import { RootState } from '@redux/store';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LanguageCode, TranslationKeys } from 'types';
import Shimmer from '@components/ui/Shimmer';
import useMenuModal from '@hooks/useMenuModal';
import { STAR_ICON, NAVIGATION_IMAGE } from '@config/Header/image.config';
import Icon from '@components/image/Icons';
import { cn } from '@lib/utils';
import { useRouter } from 'next/navigation';
import { setStoreId } from '@redux/slices/storeSlice';
import { setCookie } from '@lib/cookie';
import { useAnalytics } from '@hooks/useAnalytics';
import { Store } from '@components/type/store.types';

interface AddressBarProps {
    showRating?: boolean;
    buttonContainerClassName?: string;
    horizontalLayout?: boolean;
    /** When set, use this store for name/rating instead of Redux currentStore (e.g. QR flow bar). */
    displayStore?: Store | null;
    /** When false, hide the "Change" button (e.g. QR flow bar). Default true. */
    showChangeButton?: boolean;
}

const AddressBar: React.FC<React.PropsWithChildren<AddressBarProps>> = ({
    showRating = true,
    buttonContainerClassName,
    horizontalLayout = false,
    displayStore,
    showChangeButton = true,
}) => {
    const [loading, setLoading] = React.useState(true);
    const apiloading = useSelector((state: RootState) => state.homePage.loading);
    const store = useSelector((state: RootState) => state.store);
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const { handleOpenMenuModal } = useMenuModal();
    const router = useRouter();
    const dispatch = useDispatch();
    const { trackStoreChangeClicked } = useAnalytics();

    const handleReviewClick = () => {
        const storeForReview = effectiveStore ?? store?.currentStore;
        if (storeForReview?.id && storeForReview?.overallRatings?.totalReview && storeForReview.overallRatings.totalReview > 0) {
            dispatch(setStoreId(storeForReview.id));
            router.push('/review');
            setCookie('storeId', storeForReview.id);
            const storeData = {
                name: storeForReview.name,
                address: storeForReview.address?.address || '',
                id: storeForReview.id,
                distance: undefined
            };
            setCookie('store', JSON.stringify(storeData));
        }
    };

    React.useEffect(() => {
        setLoading(apiloading);
    }, [apiloading])

    const effectiveStore = displayStore ?? store?.currentStore;
    const averageRating = effectiveStore?.overallRatings?.average;
    const totalReviews = effectiveStore?.overallRatings?.totalReview;
    // Check if ratings are valid (exist and greater than 0)
    const hasValidRatings = showRating && (averageRating != null && (averageRating > 0)) && (totalReviews != null && (totalReviews > 0));

    // Common Rating Component
    const RatingDisplay = ({ className }: { className?: string }) => {
        if (!hasValidRatings) {
            return null;
        }

        return (
            <div
                className={cn('text-[var(--secondary-text)] flex items-center flex-nowrap cursor-pointer', className)}
                style={{ fontWeight: "var(--font-regular)" }}
                onClick={handleReviewClick}
            >
                <Icon
                    icon={`${STAR_ICON}#star2`}
                    aria-label="Rating Star"
                    width={15}
                    height={15}
                    color={"var(--rating-bg-primary)"}
                    viewBox="0 0 28 26"
                    className="mb-1"
                />
                &nbsp;
                {effectiveStore?.overallRatings?.average} &bull;
                <span className='underline pl-1 pr-2'>{effectiveStore?.overallRatings?.totalReview} {lang.Reviews}</span>
            </div>
        );
    };

    // Common Change Button (hidden when showChangeButton is false, e.g. QR flow bar)
    const ChangeButton = () =>
        showChangeButton ? (
            <span
                className='ChangeText'
                onClick={async (e) => {
                    e.preventDefault();
                    if (store?.currentStore?.id) {
                        await trackStoreChangeClicked(
                            store.currentStore.id,
                            window.location.pathname.startsWith('/products')
                                ? 'category_listing'
                                : 'navbar'
                        );
                    }
                    handleOpenMenuModal();
                }}
            >
                {lang.change}
            </span>
        ) : null;

    // Rating Loading State
    const RatingLoading = ({ isHorizontal }: { isHorizontal: boolean }) => (
        <>
            <Icon icon={STAR_ICON} aria-label="Rating Star" width={15} height={15} color={"var(--rating-bg-primary)"} viewBox="0 0 28 26" className="mb-1" />
            &nbsp;
            <Shimmer className="w-[30px] h-4 rounded mr-1" height={16} width={30} /> &bull; 
            <Shimmer className="ml-1 w-[40px] h-4 rounded underline" height={16} width={50} />
            &nbsp;
            {isHorizontal && <Shimmer className="w-[40px] h-4 rounded" height={16} width={40} />}
        </>
    );


    return (
        <div className={cn("ButtonContainer whitespace-nowrap", !horizontalLayout && "pt-3 pb-3", buttonContainerClassName, horizontalLayout && "horizontal-layout")}>
            {/* Location Icon */}
            {horizontalLayout ? (
                <Icon
                icon={`${NAVIGATION_IMAGE}#nav-icon`}
                width={20}
                height={20}
                color={"var(--primary-text)"}
                className="cursor-pointer"
                viewBox="0 0 15 17"
              />
            ) : (
                <LocationIcon
                    width={40}
                    height={40}
                    className='navigation-icon'
                    color="var(--button-primary-background)"
                    aria-label="Location Icon"
                />
            )}

            {/* Content */}
            {loading ? (
                // Loading State
                horizontalLayout ? (
                    <div className='LocationTextHorizontal'>
                        <Shimmer className="w-[120px] h-5 rounded" height={20} width={120} />
                        {showRating && (
                            <>
                                <span className='vertical-separator'>|</span>
                                <RatingLoading isHorizontal={true} />
                            </>
                        )}
                    </div>
                ) : (
                    <div className='LocationText w-full md:w-auto'>
                        <Shimmer className="w-[120px] h-5 rounded mb-1" height={20} width={120} />
                        {showRating && (
                           <div className='flex items-center flex-nowrap w-full md:w-auto justify-between md:justify-start'>
                                <RatingLoading isHorizontal={false} />
                            </div>
                        )}
                    </div>
                )
            ) : (
                // Loaded State
                horizontalLayout ? (
                    <div className='LocationTextHorizontal'>
                        <span className='store-name-horizontal'>{effectiveStore?.name}</span>
                        {hasValidRatings && (
                            <>
                                <span className='vertical-separator'>|</span>
                                <RatingDisplay className={cn('rating-line-horizontal')} />
                            </>
                        )}
                        <ChangeButton />
                    </div>
                ) : (
                    <div className='LocationText w-full md:w-auto'>
                        <div className='store-name'>{effectiveStore?.name}</div>
                        <div className='flex items-center flex-nowrap w-full md:w-auto justify-between md:justify-start'>
                            {showRating && <RatingDisplay className={cn('rating-line')} />}
                            <ChangeButton />
                        </div>
                    </div>
                )
            )}
            <style>{`
                .navigation-icon {
                    width: 44px;
                    height: 40px;
                    // border: none;
                }
                .navigation-icon.horizontal-icon {
                    width: 20px;
                    height: 20px;
                    min-width: 20px;
                    display: flex;
                    align-items: center;
                }
                .navigation-icon.horizontal-icon svg {
                    width: 20px;
                    height: 20px;
                }
                .ButtonContainer{
                    display: flex;
                    align-items: center;
                    border-radius: 5px;
                    background-color: var(--cards-containers);
                    width:fit-content;
                    fontweight: var(--font-semi-bold);
                }
                @media (min-width: 768px) {
                    .ButtonContainer.horizontal-layout {
                        border: 1px solid var(--borders-dividers);
                        padding: 8px 12px;
                        background-color: var(--cards-containers);
                        border-radius: 8px;
                    }
                }
                .LocationText,
                .LocationTextHorizontal {
                    font-size: var(--small-font);
                    color: var(--primary-text);
                    font-family: var(--font-family);
                    margin: 0 8px;
                    display: flex;
                }
                .LocationText {
                    flex-direction: column;
                    align-items: flex-start;
                }
                .LocationTextHorizontal {
                    flex-direction: row;
                    align-items: center;
                    gap: 8px;
                }
                .store-name {
                    font-size: var(--heading-h5);
                    color: var(--primary-text);
                    margin-bottom: 2px;
                    font-weight: var(--font-medium);
                }
                .store-name-horizontal {
                    font-size: var(--small-font);
                    color: var(--primary-text);
                    font-weight: var(--font-regular);
                }
                .vertical-separator {
                    color: var(--secondary-text, #999);
                    margin: 0 4px;
                    font-size: var(--small-font);
                }
                .rating-line,
                .rating-line-horizontal {
                    font-size: calc(var(--small-font) - 1px);
                    cursor: pointer;
                    -webkit-tap-highlight-color: transparent;
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                }
                .rating-line:hover,
                .rating-line-horizontal:hover {
                    opacity: 0.8;
                }
                .ChangeText{
                    font-size: var(--font-sm);
                    color: var(--accent-color);
                    cursor: pointer;
                    font-family: var(--font-family);
                    font-weight: var(--font-medium);
                }
                @media (max-width: 768px) {
                    .ButtonContainer{
                        border: none;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default AddressBar;
