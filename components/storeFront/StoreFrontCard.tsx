import React from "react";
import { StoreFrontHours } from "./StoreFrontHours";
import { RestaurantCardProps } from "../type/store.types";
import { NAVIGATION_IMAGE, STAR, CROSS_ICON, HOME_ICON } from "@config/Header/image.config";
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";
import Icon from "@components/image/Icons";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setStoreId } from "@redux/slices/storeSlice";
import { setCookie } from "@lib/cookie";
import Link from "next/link";
import StarIcon from "@components/icons/Star";

export const StoreFrontCard: React.FC<RestaurantCardProps> = ({
  name,
  distance,
  address,
  restaurantData,
  rating,
  reviews,
  store,
  onClose,
  urlManagement,
  productCategorySlug,
  linkedMenus,
  scanOrderMode,
  locationDisplayName,
  redirectToFullMenu,
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleStoreClick = () => {
    if (onClose) onClose();
  };

  const handleReviewCard = () => {
    if (reviews && reviews > 0) {
      dispatch(setStoreId(store.id));
      router.push('/review');
      setCookie('storeId', store.id);
      const storeData = { name: store.name, address: store.address.address, id: store.id, distance: distance };
      setCookie('store', JSON.stringify(storeData));
    }
  };

  const displayTitle = scanOrderMode ? (locationDisplayName || name) : name;

  const hasRatingOrReviews = (rating && rating > 0) || (reviews && reviews > 0);
  const ratingReviewsEl = hasRatingOrReviews ? (
    <span className="rating" onClick={handleReviewCard}>
      <StarIcon width="14" height="14" className="star-icon" />
      {rating || 0} • <span className="store-reviews">{reviews || 0} {lang.Reviews}</span>
    </span>
  ) : null;

  return (
    <div className={`restaurant-card ${scanOrderMode ? 'restaurant-card--scan-order' : ''}`}>
      {scanOrderMode ? (
        <>
          <div className="restaurant-card__scan-order-header">
            <div className="restaurant-card__scan-order-icon">
              <Icon
                icon={`${HOME_ICON}#home`}
                width={24}
                height={24}
                color="var(--primary-text-light)"
                className="block"
                viewBox="0 0 23 23"
              />
            </div>
            <div className="restaurant-card__scan-order-info">
              <h2 className="restaurant-card__scan-order-title">{displayTitle}</h2>
              {/* {ratingReviewsEl} */}
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={handleStoreClick}
            >
              <Icon
                icon={`${CROSS_ICON}#cross`}
                width={15}
                height={15}
                color="var(--primary-text)"
                className="block"
                viewBox="0 0 16 16"
              />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="restaurant-header">
            <Link href={`/${store.slug}`} onClick={handleStoreClick} prefetch={true}>
              <h2 className="restaurant-name">{name}</h2>
            </Link>
            {distance !== undefined && (
              <span className="distance">{distance} {lang.away}</span>
            )}
          </div>
          <span className="address">
            <Icon
              icon={`${NAVIGATION_IMAGE}#nav-icon`}
              width={18}
              height={18}
              color={"var(--primary-text)"}
              className="cursor-pointer cross-icon-desktop mt-[2px]"
              viewBox="0 0 16 17"
            />
            <Icon
              icon={`${NAVIGATION_IMAGE}#nav-icon`}
              width={20}
              height={20}
              color={"var(--primary-text)"}
              className="cursor-pointer cross-icon-mobile"
              viewBox="0 0 15 17"
            />
            {address}
          </span>
          {ratingReviewsEl}
        </>
      )}
      <div style={{ paddingTop: scanOrderMode ? "12px" : "15px" }}>
        {restaurantData.map(({ title, openStatus, hours, id, slug }, index) => (
          <StoreFrontHours
            key={index}
            title={title}
            status={openStatus}
            time={hours}
            store={store}
            id={id || ''}
            slug={slug || ''}
            onClose={onClose}
            urlManagement={urlManagement}
            productCategorySlug={productCategorySlug}
            linkedMenus={linkedMenus}
            scanOrderMode={scanOrderMode}
            redirectToFullMenu={redirectToFullMenu}
          />
        ))}
      </div>

      <style>{`
        .restaurant-card {
          border: 1px solid var(--borders-dividers);
          border-radius: 8px;
          padding: 20px 20px 4px;
          background-color: var(--cards-containers);
          margin-bottom: 10px;
          margin-inline:1px !important;
        }

        .restaurant-name {
          font-size: var(--heading-h3);
          font-weight: var(--font-bold);
          margin: 0;
          cursor: pointer;
          font-family: var(--font-family);
          color: var(--primary-text);
          -webkit-tap-highlight-color: transparent;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          touch-action: manipulation;
        }

        .restaurant-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-family);
        }

        .distance {
          font-size: var(--description-font);
          font-weight: var(--font-medium);
          color: var(--primary-text);
        }

        .address {
          display: flex;
          align-items: start;
          color: var(--secondary-text);
          font-size: var(--description-font);
          font-family: var(--font-family);
          margin-top: 10px;
          gap: 10px;
        }

        .rating {
          display: flex;
          align-items: center;
          font-size: var(--description-font);
          margin-top: 10px;
          font-family: var(--font-family);
          color: var(--secondary-text);
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }

        .rating-content {
          display: flex;
          align-items: center;
        }

        .restaurant-hours {
          background-color: #fffae6;
          padding: 12px;
          border-radius: 8px;
          margin-top: 10px;
        }

        .status {
          font-size: var(--description-font);
        }

        .status.open {
          color: var(--accent-color);
        }

        .navigation-icon {
          width: 15px;
          height: auto;
          margin-right: 5px;
        }
        .cross-icon-mobile {
          display: none;
        }
        .cross-icon-desktop {
          display: block;
        }
        .star-icon {
          width: 14px;
          height: 14px;
          margin-right: 5px;
          margin-bottom: 3px;
        }
        .store-reviews {
          text-decoration: underline;
          cursor: pointer;
          margin-left: 5px;
        }
        .restaurant-card--scan-order .restaurant-card__scan-order-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
        }
        .restaurant-card--scan-order .restaurant-card__scan-order-icon {
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: 12px;
          background: var(--button-primary-background);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .restaurant-card--scan-order .restaurant-card__scan-order-info {
          flex: 1;
          min-width: 0;
        }
        .restaurant-card--scan-order .restaurant-card__scan-order-title {
          font-size: var(--heading-h5);
          font-weight: var(--font-semi-bold);
          color: var(--primary-text);
          font-family: var(--font-family);
        }
        .restaurant-card--scan-order .rating {
          margin-top: 0;
          font-size: var(--heading-h6);
        }
        @media (max-width: 768px) {
          .restaurant-card {
            padding: 16px !important;
          }
          .restaurant-name {
            font-size: var(--heading-h4);
            font-weight:var(--font-bold) ;
            min-width: 52% !important;
            // max-width: 55% !important;
          }
          .address {
            font-size: var(--extraSmall-font);
            align-items: start;
            gap:5px;
          }
          .navigation-icon {
            margin-right: 5px;
          }
          .distance {
            font-size: var(--small-font);
            min-width: 42% !important;
            max-width: 45% !important;
            text-align: end;
          }
          
          .cross-icon-mobile {
            display: block;
            margin-right: 5px;
          }
          .cross-icon-desktop {
            display: none;
          }
          .rating {
            font-size: var(--extraSmall-font);
          }
        }
      `}</style>
    </div>
  );
};
