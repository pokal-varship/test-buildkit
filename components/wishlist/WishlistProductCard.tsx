'use client';
import React from 'react';
import { WishlistItem } from '@redux/slices/wishlistSlice';
import WishlistButton from '@components/ui/WishlistButton';
import { generateImageBase64FromUrl } from '@lib/helper/ImageGen/imageGen';
import { getTenantConfig } from '@config/tenant.config';
import ProductRating from '@components/ratings/ProductRating';
import DietaryIndicator from '@components/ui/DietaryIndicator';
import formatCurrency from '@lib/helper/price';

interface WishlistProductCardProps {
  item: WishlistItem;
  viewMode: 'grid' | 'list';
}

const WishlistProductCard: React.FC<WishlistProductCardProps> = ({ item, viewMode }) => {
  const tenantConfig = getTenantConfig();

  if (viewMode === 'grid') {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          {/* Wishlist Button */}
          <div className="absolute top-2 right-2 z-10">
            <WishlistButton
              product={{
                id: item.id,
                name: item.name,
                price: item.price,
                imageUrl: item.imageUrl,
                totalLikes: item.likeCount,
              }}
              className="absolute top-0 right-0 z-10 w-8 h-8"
              classNameWhenCountShown="!w-16"
              showCount={true}
            />
          </div>
          
          {/* Product Image */}
          <div className='flex w-full justify-center items-center'>
            {item.imageUrl ? (
              <img
                src={generateImageBase64FromUrl({url: item.imageUrl, width: 315, height: 315})?.fullEncodedUrl || ""} 
                alt={item.name} 
                width={315}
                height={315}
                className="object-cover aspect-square rounded-t-md"
                fetchPriority="high"
              />
            ) : (
              <img
                src={generateImageBase64FromUrl({url: tenantConfig?.productPlaceholderImageUrl || "", width: 315, height: 315})?.fullEncodedUrl || ""} 
                alt={item.name} 
                width={315}
                height={315}
                className="object-cover aspect-square rounded-t-md"
                fetchPriority="high"
              />
            )}
          </div>
        </div>
        
        <div className="py-1 w-full px-[10px]">
          {/* Dietary Indicator */}
          <DietaryIndicator containsMeat={!!item.containsMeat} containerClassName="md:pb-3" />
          <h3 className="product-name-clamp">{item.name}</h3>
          {/* Rating Section */}
          <ProductRating 
            rating={item.rating ? { average: item.rating } : undefined} 
            overallRatings={item.overallRatings ? { average: item.overallRatings } : undefined} 
            className="mt-1" 
          />
          <div className="flex justify-between items-end md:mt-2">
            <div>
              {!!item.discountedPrice ? (
                <div className="flex flex-wrap items-center">
                  {tenantConfig.showStrikethroughPrice && (
                    <span className="scratch-price text-[var(--secondary-text)] line-through mr-1">
                      {formatCurrency({amount: item.price})}
                    </span>
                  )}
                  <span className="product-price mr-1">
                    {formatCurrency({amount: item.discountedPrice})}
                  </span>
                </div>
              ) : (
                <span className="product-price">{formatCurrency({amount: item.price})}</span>
              )}
            </div>
          </div>
        </div>
        
        <style>{`
          .product-name-clamp {
            font-size: var(--heading-h4);
            font-weight: var(--font-semi-bold);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            line-height: 1.2;
          }
                  .product-price {
          font-size: var(--heading-h4);
          font-weight: var(--font-medium);
        }
        .scratch-price {
          font-size: var(--heading-h6);
        }
        `}</style>
      </div>
    );
  }

  // List view
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          {item.imageUrl ? (
            <img
              src={generateImageBase64FromUrl({url: item.imageUrl, width: 100, height: 100})?.fullEncodedUrl || ""} 
              alt={item.name} 
              width={100}
              height={100}
              className="object-cover rounded-md"
            />
          ) : (
            <img
              src={generateImageBase64FromUrl({url: tenantConfig?.productPlaceholderImageUrl || "", width: 100, height: 100})?.fullEncodedUrl || ""} 
              alt={item.name} 
              width={100}
              height={100}
              className="object-cover rounded-md"
            />
          )}
        </div>
        
        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
          <p className="text-sm text-gray-500 mt-1">Added on {new Date(item.addedAt).toLocaleDateString()}</p>
          {/* Rating Section */}
          <ProductRating 
            rating={item.rating ? { average: item.rating } : undefined} 
            overallRatings={item.overallRatings ? { average: item.overallRatings } : undefined} 
            className="mt-1" 
          />
          <div className="flex items-center justify-between mt-2">
            <div>
              {!!item.discountedPrice ? (
                <div className="flex flex-wrap items-center">
                  {tenantConfig.showStrikethroughPrice && (
                    <span className="text-sm text-gray-500 line-through mr-1">
                      {formatCurrency({amount: item.price})}
                    </span>
                  )}
                  <span className="text-lg font-medium text-gray-900">
                    {formatCurrency({amount: item.discountedPrice})}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-medium text-gray-900">{formatCurrency({amount: item.price})}</span>
              )}
            </div>
            <WishlistButton
              product={{
                id: item.id,
                name: item.name,
                price: item.price,
                imageUrl: item.imageUrl,
                totalLikes: item.likeCount,
              }}
              showCount={true}
              className="w-8 h-8"
              classNameWhenCountShown="!w-16"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistProductCard; 