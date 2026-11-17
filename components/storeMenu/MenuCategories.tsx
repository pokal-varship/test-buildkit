import { Category } from "@components/type/store.types";
import React from "react";
import Link from "next/link";
import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";
import Shimmer from "@components/ui/Shimmer";
import useProductUrl from "@hooks/useProductUrl";
import { getTenantConfig } from "@config/tenant.config";

interface MenuCategoriesProps {
  categories: { data: Category[] };
  menuId: string;
  loading: boolean;
}

const MenuCategories: React.FC<MenuCategoriesProps> = ({ menuId, categories, loading }) => {
  const categoryData = categories?.data || [];
  const { getCategoryUrl, storeSlug } = useProductUrl();
  const { displayCategoryName } = getTenantConfig();

  return (
    <>
      <div className="menu-categories-container max-width-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full pt-4 md:pt-0">
          {loading
            ? Array(8)
                .fill("1")
                .map(() => (
                  <div key={`shimmer-${Math.random()}`}>
                    <div className="block md:hidden">
                      <Shimmer width={"100%"} height={240} />
                    </div>
                    <div className="hidden md:block">
                      <Shimmer width={"100%"} height={340} />
                    </div>
                  </div>
                ))
            : categoryData.map((category) => (
                <Link
                  href={getCategoryUrl(category?.categorySlug || '', menuId, storeSlug || '')}
                  className={`category${displayCategoryName ? " category-with-name" : " category-image-only"}`}
                  key={category?.categoryId}
                  prefetch={true}
                >
                  {displayCategoryName ? (
                    <>
                      <div className="category-image-wrapper">
                        {category?.icon?.url ? (
                          <img
                            fetchPriority="high"
                            title={category?.displayName}
                            src={
                              generateImageBase64FromUrl({
                                url: category?.icon?.url,
                                width: 800,
                                height: 800,
                                quality: 100,
                              })?.fullEncodedUrl || ""
                            }
                            alt={category?.icon?.altText || category?.displayName}
                            className="category-image"
                            loading="lazy"
                            height={800}
                            width={800}
                          />
                        ) : null}
                      </div>
                      <p className="category-name">
                        {category?.displayName ||
                          category?.categoryName?.en ||
                          ""}
                      </p>
                    </>
                  ) : category?.icon?.url ? (
                    <img
                      fetchPriority="high"
                      title={category?.displayName}
                      src={
                        generateImageBase64FromUrl({
                          url: category?.icon?.url,
                          width: 800,
                          height: 800,
                          quality: 100,
                        })?.fullEncodedUrl || ""
                      }
                      alt={category?.icon?.altText || category?.displayName}
                      className="category-image"
                      loading="lazy"
                      height={800}
                      width={800}
                    />
                  ) : null}
                </Link>
              ))}
        </div>
      </div>

      <style>{`
        .category {
          cursor: pointer;
        }

        .category-image-only {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          transition: transform 0.3s ease-in-out, box-shadow 0.3s ease;
        }

        .category-image-only:hover {
          transform: scale(1.03);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
        }

        .category-with-name {
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.3s ease-in-out;
        }

        .category-with-name:hover {
          transform: scale(1.03);
        }

        .category-image-wrapper {
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          transition: box-shadow 0.3s ease;
        }

        .category-with-name:hover .category-image-wrapper {
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
        }

        .category-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 12px;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          transition: filter 0.3s ease;
        }

        .category-name {
          margin: 20px 0 0;
          width: 100%;
          text-align: center;
          font-size: var(--heading-h2);
          font-weight: 600;
          line-height: 1.3;
          color: var(--primary-text);
          text-transform: capitalize;
        }

        @media (max-width: 768px) {
          .category-image-only {
            border-radius: 10px;
          }

          .category-image-wrapper {
            border-radius: 10px;
          }

          .category-image {
            border-radius: 10px;
            height: auto;
          }

          .category-name {
            margin-top: 8px;
            font-size: var(--heading-h4);
          }
        }
      `}</style>
    </>
  );
};

export default MenuCategories;
