"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import AddressBar from "../address/AddressBar";
import MenuCategories from "../storeMenu/MenuCategories";
import useCategories from "@hooks/storepage/useCategories";
import { Category, StorePageData } from "../type/store.types";
import { useParams } from "next/navigation";
import RestaurantSchema from "@components/schema/RestaurantSchema";
import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";
import { fetchOffers } from "@services/offerService";
import { DiscountOffer } from "@services/typesense";
import MediaIndicator from "@components/productDetailPage/MediaIndicator";
import { SwiperSlide } from "swiper/react";
import { Swiper } from "swiper/react";
import { Pagination } from "swiper/modules";
import type { Swiper as SwiperCore } from "swiper";
import OfferCard from "@components/productDetailPage/OfferCard";
import OrderAgain from "@components/orderagain/OrderAgain";
import { useSession } from "next-auth/react";
import { ExtendedSession } from "@components/header/types";
import MobileCartSummary from "@components/cart/MobileCartSummary";
import { useSelector } from "react-redux";
import { selectIsQrFlowActive } from "@redux/slices/qrFlowSlice";
import { useStoreDataBootstrap } from "@app/StoreDataProvider";

const StoreList: React.FC<{ storeData: StorePageData }> = ({ storeData }) => {
  const menuId = useParams()?.menuSlug as string;
  const menuSlug = menuId === "all-day" ? "" : menuId;
  const storeSlug = useParams()?.storeSlug as string;
  const { categories, loading, fetchCategories } = useCategories();
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const { bootstrapStore } = useStoreDataBootstrap();

  useEffect(() => {
    if (storeSlug) {
      void bootstrapStore(storeSlug);
    }
  }, [bootstrapStore, storeSlug]);

  useEffect(() => {
    if (storeSlug) {
      fetchCategories(menuSlug, storeSlug);
    }
  }, [menuSlug, storeSlug]); //eslint-disable-line react-hooks/exhaustive-deps
  const bannerImageUrl = storeData?.data?.pageConfig?.images?.[0]?.url;
  const desktopBannerSrc = bannerImageUrl
    ? generateImageBase64FromUrl({
        url: bannerImageUrl,
        height: 600,
        width: null,
      })?.fullEncodedUrl || ""
    : "";
  const mobileBannerSrc = bannerImageUrl
    ? generateImageBase64FromUrl({
        url: bannerImageUrl,
        height: 200,
        width: null,
      })?.fullEncodedUrl || ""
    : "";
  const [offers, setOffers] = useState<DiscountOffer[]>([]);
  const swiperRef = useRef<SwiperCore | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const getOffers = useCallback(async () => {
    if (storeSlug) {
      try {
        const offerResponse = await fetchOffers(storeSlug, menuSlug);
        const allOffers = (offerResponse?.data ?? []) as DiscountOffer[];
        // Normal flow: show only REMOTE context offers
        const remoteOffers = allOffers.filter(
          (offer) => offer?.orderContext === "REMOTE",
        );
        setOffers(remoteOffers);
      } catch {}
    }
  }, [storeSlug, menuSlug]);

  useEffect(() => {
    if (offers?.length === 0) getOffers();
  }, [getOffers, offers?.length]);

  return (
    <div className="catalogue-page">
      {!!storeData.data && <RestaurantSchema storeData={storeData} />}
      <div className="location-order-mobile">
        <AddressBar
          showRating={true}
          horizontalLayout={false}
          buttonContainerClassName="py-3 px-4"
        />
      </div>
      {bannerImageUrl ? (
        <>
          <img
            fetchPriority="high"
            title="Delicious Breakfast"
            src={desktopBannerSrc}
            height={600}
            width={1973}
            alt="Delicious Breakfast"
            className="delicious-breakfast-desktop"
          />
          <img
            fetchPriority="high"
            title="Delicious Breakfast"
            src={mobileBannerSrc}
            height={200}
            width={658}
            alt="Delicious Breakfast"
            className="delicious-breakfast-mobile"
          />
        </>
      ) : null}
      <div className="content-store py-5 max-width-container">
        <div className="location-order">
          <AddressBar
            showRating={true}
            buttonContainerClassName="px-3"
            horizontalLayout={true}
          />
        </div>
        {/* <div className="order-toggle">
                    <OrderToggle
                        options={[{ label: "Takeaway", value: "takeaway" }, { label: "Delivery", value: "delivery" }, { label: "Dine In", value: "dine-in" }]}
                        initialSelected="takeaway"
                    />
                </div> */}
      </div>
      {/* <div className="order-toggle-mobile">
                <OrderToggle
                    options={[{ label: "Takeaway", value: "takeaway" }, { label: "Delivery", value: "delivery" }, { label: "Dine In", value: "dine-in" }]}
                    initialSelected="takeaway"
                />
            </div> */}
      <div
        className={
          !!(offers?.length > 1)
            ? "max-width-container px-4 pt-4 md:pl-8 md:pr-8 md:pb-8 swiper-container"
            : ""
        }
      >
        {!!(offers?.length > 1) ? (
          <Swiper
            modules={[Pagination]}
            slidesPerView={1.25}
            spaceBetween={16}
            pagination={{ clickable: true }}
            breakpoints={{
              768: {
                slidesPerView: "auto",
                spaceBetween: 16,
                pagination: false,
              },
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              swiper.slideToLoop(currentIndex); // optional, to sync on init
            }}
            initialSlide={currentIndex}
            onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
            className="relative swiper-offer-container"
          >
            {offers.map((offer) => (
              <SwiperSlide
                key={offer.offerId}
                className="mr-0 md:!w-auto md:!max-w-[23.6%] md:mr-3 swiper-slide-offer"
              >
                <OfferCard
                  offerData={offer}
                  containerClassName="bg-[var(--cards-containers)] border-[var(--success)] py-3 mb-0 w-full"
                  title={offer?.offerName?.en}
                  description={offer?.offerDescription?.en}
                  showMoreText={true}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : !!(offers?.length === 1) ? (
          <OfferCard
            containerWidthClassName="max-width-container"
            mobilecontainerClassName="max-width-container"
            offerData={offers?.[0]}
            containerClassName="bg-[var(--cards-containers)] border-[var(--success)] text-[var(--primary-text)] py-3 mb-0 md:!w-auto md:!max-w-[23.6%]"
            title={offers?.[0]?.offerName?.en}
            description={offers?.[0]?.offerDescription?.en}
            showMoreText={true}
          />
        ) : (
          ""
        )}
      </div>
      {!!(offers?.length > 1) && (
        <div className="flex w-full justify-center overflow-x-auto pt-4 bg-transparent md:hidden">
          <MediaIndicator
            items={offers}
            activeIndex={currentIndex}
            onSelect={(index) => {
              setCurrentIndex(index);
              swiperRef.current?.slideToLoop(index);
            }}
          />
        </div>
      )}
      {session?.user?.email && (
        <div className="max-width-container pb-2">
          <OrderAgain storeSlug={storeSlug} menuSlug={menuSlug} />
        </div>
      )}
      <div className="w-full">
        <MenuCategories
          menuId={menuId}
          categories={categories as unknown as { data: Category[] }}
          loading={loading}
        />
      </div>

      {isQrFlowActive && <MobileCartSummary />}

      <style>{`
                .swiper-wrapper {
                    align-items: center;
                }
                .swiper-pagination {
                    display: none !important;
                }
                .swiper-slide-offer {
                    max-width: 100% !important;
                    overflow: hidden;
                }
                .swiper-slide-offer > div {
                    width: 100%;
                    max-width: 100%;
                    overflow: hidden;
                }

                
              
                .catalogue-page {
                    font-family: var(--font-family);
                    background-color: var(--primary-background);
                    padding-bottom: 50px;
                }
                .content-store {
                    display: block;
                }
                .menu-sections {
                    width: 100%;
                    margin: 0 auto;
                }
                .location-order-mobile{
                    display: none;
                }
                .delicious-breakfast-mobile{
                    display: none;
                    width: 100%;
                }
                .order-toggle-mobile{
                    display: none;
                }
                .delicious-breakfast-desktop{
                    width: 100%;
                }

                  @media (min-width: 768px) {
                    .swiper-slide-offer {
                        max-width: 23.6% !important;
                    }
                }
                
                @media (max-width: 768px) {
                    .order-toggle {
                        margin-top: 10px;
                    }
                    .content-store {
                        display: none;
                    }
                    .location-order-mobile{
                        display: block;
                    }
                    .delicious-breakfast-desktop{
                        display: none;
                    }
                    .delicious-breakfast-mobile{
                        display: block;
                        width: 100%;
                    }
                    .order-toggle-mobile{
                        display: block;
                        padding-top: 20px;
                        width: 90%;
                        margin: 0 auto;
                    }
                    .menu-sections{
                        display: block;
                    }
                    .catalogue-page {
                        padding-bottom: 0px;
                    }
                    .swiper-slide-offer {
                        margin-right: 8px !important;
                    }
                    .swiper-container {
                        padding-right: 0px !important;
                        overflow-x: hidden !important;
                    }
                  
                    .swiper-container .swiper-offer-container{
                         overflow:visible !important;
                    }

                }
                @media (max-width: 480px) {
                    .content-store {
                        padding: 0px;
                    }
                    .menu-sections {
                        width: 100%;
                    }
                    .catalogue-page{
                        padding-bottom: 0px;
                    }
                }
            `}</style>
    </div>
  );
};

export default StoreList;
