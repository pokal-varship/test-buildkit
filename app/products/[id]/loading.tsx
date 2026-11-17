/**
 * Loading skeleton for Product Detail Page
 * Matches actual PDP structure from SideBar.tsx and ProductOptions.tsx
 * 
 * Mobile: Full-width stacked layout with yellow bg only on desktop
 * Desktop: Side-by-side with left (40%/30%) and right (flex-1)
 */
export default function ProductDetailLoading() {
  return (
    <div className="pdp-loading-skeleton">
      {/* Mobile header overlay - matches .product-icons-overlay */}
      <div className="mobile-header-skeleton">
        <div className="shimmer-box header-icon" />
        <div className="shimmer-box header-icon" />
      </div>

      <div className="pdp-content-skeleton">
        {/* Left side - SideBar */}
        <div className="left-side-skeleton">
          {/* Breadcrumbs - hidden on mobile */}
          <div className="breadcrumbs-skeleton">
            <div className="shimmer-box breadcrumb-line" />
          </div>
          
          {/* Product Image - aspect-square on mobile */}
          <div className="shimmer-box image-skeleton" />
          
          {/* Media indicator dots */}
          <div className="media-indicator-skeleton">
            <div className="shimmer-box dot-skeleton" />
            <div className="shimmer-box dot-skeleton" />
          </div>
          
          {/* Product info section - has bg-primary-background on mobile */}
          <div className="product-info-skeleton">
            {/* Veg indicator + Wishlist */}
            <div className="indicators-row">
              <div className="shimmer-box veg-indicator" />
              <div className="shimmer-box wishlist-btn" />
            </div>
            
            {/* Product Name */}
            <div className="shimmer-box product-name" />
            
            {/* Price row */}
            <div className="price-row">
              <div className="shimmer-box price-strike" />
              <div className="shimmer-box price-current" />
            </div>
            
            {/* Description */}
            <div className="description-skeleton">
              <div className="shimmer-box desc-line-1" />
              <div className="shimmer-box desc-line-2" />
              <div className="shimmer-box view-more" />
            </div>
          </div>
          
          {/* Add to Cart button - mobile only, at bottom of left section */}
          <div className="mobile-add-to-cart">
            <div className="shimmer-box add-to-cart-btn" />
          </div>
        </div>

        {/* Right side - ProductOptions (hidden on mobile for simple products) */}
        <div className="right-side-skeleton">
          {/* Close button - desktop only */}
          <div className="close-btn-skeleton">
            <div className="shimmer-box close-btn" />
          </div>

          {/* Section title */}
          <div className="shimmer-box section-title" />
          
          {/* Modifier group */}
          <div className="modifier-group-skeleton">
            <div className="shimmer-box modifier-title" />
            <div className="shimmer-box modifier-subtitle" />
          </div>
          
          {/* Variant cards grid */}
          <div className="variants-grid-skeleton">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="variant-card-skeleton">
                <div className="shimmer-box variant-name" />
                <div className="shimmer-box variant-price" />
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="faq-skeleton">
            <div className="shimmer-box faq-title" />
            <div className="shimmer-box faq-item" />
          </div>

          {/* Bottom bar */}
          <div className="bottom-bar-skeleton">
            <div className="shimmer-box bottom-price" />
            <div className="shimmer-box bottom-btn" />
          </div>
        </div>
      </div>

      <style>{`
        .shimmer-box {
          background: linear-gradient(
            90deg,
            var(--borders-dividers, #D7D5C4) 25%,
            var(--secondary-background, #FAF9F1) 50%,
            var(--borders-dividers, #D7D5C4) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .pdp-loading-skeleton {
          min-height: 100vh;
          background-color: var(--primary-background, #FAF9F1);
          font-family: var(--font-family);
        }

        /* Mobile header - matches .product-icons-overlay */
        .mobile-header-skeleton {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          padding: 18px 24px;
          background: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(24, 17, 17, 0.46) 100%);
          z-index: 20;
          height: 60px;
        }

        .header-icon {
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }

        .pdp-content-skeleton {
          display: flex;
          flex-direction: column;
        }

        /* Left side - Mobile: full width, primary-background */
        .left-side-skeleton {
          width: 100%;
          background: var(--primary-background, #FAF9F1);
        }

        .breadcrumbs-skeleton {
          display: none;
        }

        .breadcrumb-line {
          width: 280px;
          height: 14px;
          border-radius: 4px;
        }

        /* Image - aspect-square */
        .image-skeleton {
          width: 100%;
          aspect-ratio: 1 / 1;
        }

        /* Media indicator dots */
        .media-indicator-skeleton {
          display: flex;
          justify-content: center;
          gap: 8px;
          padding: 12px 0;
          background: var(--primary-background, #FAF9F1);
        }

        .dot-skeleton {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        /* Product info section */
        .product-info-skeleton {
          background: var(--primary-background, #FAF9F1);
          padding: 16px;
          padding-bottom: 0;
        }

        .indicators-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .veg-indicator {
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }

        .wishlist-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }

        .product-name {
          width: 85%;
          height: 28px;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .price-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .price-strike {
          width: 50px;
          height: 16px;
          border-radius: 4px;
        }

        .price-current {
          width: 60px;
          height: 20px;
          border-radius: 4px;
        }

        .description-skeleton {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .desc-line-1 {
          width: 100%;
          height: 14px;
          border-radius: 4px;
        }

        .desc-line-2 {
          width: 90%;
          height: 14px;
          border-radius: 4px;
        }

        .view-more {
          width: 70px;
          height: 14px;
          border-radius: 4px;
        }

        /* Mobile Add to Cart button */
        .mobile-add-to-cart {
          padding: 16px;
          background: var(--primary-background, #FAF9F1);
        }

        .add-to-cart-btn {
          width: 100%;
          height: 48px;
          border-radius: 8px;
          background: linear-gradient(
            90deg,
            var(--primary-color, #F2C94C) 25%,
            var(--warning-light, #F5D76E) 50%,
            var(--primary-color, #F2C94C) 75%
          ) !important;
          background-size: 200% 100%;
        }

        /* Right side - hidden on mobile */
        .right-side-skeleton {
          display: none;
        }

        .close-btn-skeleton {
          display: none;
        }

        /* Desktop styles - md breakpoint (768px) */
        @media (min-width: 768px) {
          .mobile-header-skeleton {
            display: none;
          }

          .pdp-content-skeleton {
            flex-direction: row;
            height: 100vh;
          }

          /* Left side - md:w-[40%] md:bg-[var(--primary-color)] */
          .left-side-skeleton {
            width: 40%;
            height: 100vh;
            max-height: 100vh;
            overflow-y: auto;
            background: var(--primary-color, #F2C94C);
            padding: 12px;
          }

          .breadcrumbs-skeleton {
            display: block;
            margin-bottom: 16px;
          }

          .image-skeleton {
            border-radius: 10px;
          }

          .media-indicator-skeleton {
            background: transparent;
          }

          .product-info-skeleton {
            background: transparent;
            padding: 0;
            margin-top: 20px;
          }

          .mobile-add-to-cart {
            display: none;
          }

          /* Right side - visible on desktop */
          .right-side-skeleton {
            display: block;
            flex: 1;
            height: calc(100vh - 82px);
            max-height: calc(100vh - 82px);
            overflow-y: auto;
            padding: 20px 24px;
            padding-bottom: 100px;
            background: var(--primary-background, #FAF9F1);
            position: relative;
          }

          .close-btn-skeleton {
            display: block;
            position: absolute;
            top: 12px;
            right: 12px;
          }

          .close-btn {
            width: 40px;
            height: 40px;
            border-radius: 8px;
          }

          .section-title {
            width: 280px;
            height: 28px;
            border-radius: 6px;
            margin-bottom: 24px;
          }

          .modifier-group-skeleton {
            margin-bottom: 16px;
          }

          .modifier-title {
            width: 140px;
            height: 20px;
            border-radius: 4px;
            margin-bottom: 4px;
          }

          .modifier-subtitle {
            width: 60px;
            height: 14px;
            border-radius: 4px;
          }

          .variants-grid-skeleton {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 32px;
          }

          .variant-card-skeleton {
            background: var(--cards-containers, var(--white, #FFFFFF));
            border: 1px solid var(--borders-dividers, #D7D5C4);
            border-radius: 8px;
            padding: 16px;
            min-height: 90px;
          }

          .variant-name {
            width: 65%;
            height: 16px;
            border-radius: 4px;
          }

          .variant-price {
            width: 45%;
            height: 14px;
            border-radius: 4px;
            margin-top: 12px;
          }

          .faq-skeleton {
            padding-top: 24px;
            border-top: 1px solid var(--borders-dividers, #D7D5C4);
            margin-bottom: 24px;
          }

          .faq-title {
            width: 260px;
            height: 24px;
            border-radius: 6px;
            margin-bottom: 16px;
          }

          .faq-item {
            width: 100%;
            height: 56px;
            border-radius: 8px;
          }

          .bottom-bar-skeleton {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px;
            background: var(--primary-background, #FAF9F1);
            border-top: 1px solid var(--borders-dividers, #D7D5C4);
            position: sticky;
            bottom: 0;
            margin: 0 -24px;
          }

          .bottom-price {
            width: 80px;
            height: 28px;
            border-radius: 6px;
          }

          .bottom-btn {
            width: 160px;
            height: 48px;
            border-radius: 8px;
          }
        }

        /* Large desktop - xl breakpoint (1280px) */
        @media (min-width: 1280px) {
          /* xl:w-[30%] */
          .left-side-skeleton {
            width: 30%;
            padding: 40px;
          }

          .right-side-skeleton {
            padding: 20px 40px;
            padding-bottom: 100px;
          }

          .bottom-bar-skeleton {
            margin: 0 -40px;
            padding: 16px 40px;
          }
        }
      `}</style>
    </div>
  );
}
