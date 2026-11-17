"use client";

import React, { useState, useEffect, useRef } from "react";
import { Location, OpeningHours, VisitUsSectionProps } from "./fields";
import SliderNavigation from "@components/ui/SliderNavigation";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Swiper as SwiperClass } from "swiper";
import PhoneIcon from "@components/icons/phone-icon";
import LocationIcon from "@components/icons/LocationIcon";
import { visitUsDataContext } from "pageEditor/contexts/visitUsDataContext";
import { getCookie } from "@lib/cookie";
import { resolveTimezone } from "@lib/helper";
import GetDirectionsIcon from "@components/icons/GetDirectionsIcon";

/**
 * VisitUsSection Component
 *
 * This component displays store locations with contact information, opening hours, and maps.
 * It uses server-side data resolution to fetch store data from the API using coordinates provided in the props.
 * Server-side data includes opening hours for all stores, eliminating the need for client-side API calls.
 *
 * Usage:
 * 1. Set coordinates in advanceSettings.coordinates (latitude, longitude)
 * 2. The component will automatically fetch store data from the API via resolveData
 * 3. If API data is available, it will display real store information
 * 4. Opening hours are fetched server-side for all stores and cached
 * 5. If no API data, it falls back to the default locations configured in props
 *
 * Features:
 * - Server-side API integration with resolveData
 * - Pre-fetched opening hours for all stores
 * - Responsive design
 * - Customizable styling
 * - Fallback to default data
 */

interface StoreResponse {
  data: Store[];
}

interface Store {
  slug?: string;
  name?: string;
  address?: {
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  workingHours?: Array<{
    day: string;
    timeSlots: Array<{
      startTime: string;
      endTime: string;
    }>;
    isOpen: boolean;
  }>;
}

export const VisitUsSection = (
  props: VisitUsSectionProps & Record<string, any>,
) => {
  const {
    basicContent = {
      title: "Visit Us",
      subtitle: "Come and experience our warm hospitality",
      button: {
        text: "Get Directions",
        link: "https://maps.google.com",
      },
      notes: "Kitchen closes 30 minutes before closing time",
    },
    styling = {
      layout: {
        backgroundColor: "transparent",
        padding: "30px 30px",
        margin: "0 auto",
        maxWidth: "100%",
        mobile: {
          backgroundColor: "transparent",
          padding: "24px 16px",
          margin: "0 auto",
          maxWidth: "100%",
        },
      },
      typography: {
        title: {
          fontSize: "30px",
          fontWeight: "700",
          color: "#282828",
          lineHeight: "1.2",
          alignment: "center",
          mobile: {
            fontSize: "20px",
            fontWeight: "700",
            color: "#282828",
            lineHeight: "1.2",
            alignment: "center",
          },
        },
        subtitle: {
          fontSize: "16px",
          fontWeight: "500",
          color: "#757575",
          lineHeight: "1.5",
          alignment: "center",
          mobile: {
            fontSize: "14px",
            fontWeight: "500",
            color: "#757575",
            lineHeight: "1.5",
            alignment: "center",
          },
        },
      },
      tabsContainer: {
        gap: "20px",
        maxWidth: "100%",
        activeTabColor: "var(--primary-text)",
        activeTabBackground: "var(--button-primary-active-background)",
        inactiveTabColor: "var(--secondary-text)",
        inactiveTabBackground: "transparent",
        activeTabBorder: "var(--primary-color)",
        mobile: {
          gap: "12px",
          maxWidth: "100%",
          activeTabColor: "var(--primary-text)",
          activeTabBackground: "var(--button-primary-active-background)",
          inactiveTabColor: "var(--secondary-text)",
          inactiveTabBackground: "transparent",
          activeTabBorder: "var(--primary-color)",
        },
      },
      contactStyling: {
        icon: {
          size: "20px",
          color: "var(--primary-color)",
        },
        label: {
          fontSize: "16px",
          fontWeight: "600",
          color: "var(--primary-text)",
          lineHeight: "1.3",
          mobile: {
            fontSize: "14px",
            fontWeight: "600",
            color: "var(--primary-text)",
            lineHeight: "1.3",
          },
        },
        text: {
          fontSize: "14px",
          fontWeight: "400",
          color: "var(--secondary-text)",
          lineHeight: "1.3",
          mobile: {
            fontSize: "14px",
            fontWeight: "400",
            color: "var(--secondary-text)",
            lineHeight: "1.3",
          },
        },
      },
      button: {
        height: "48px",
        width: "auto",
        backgroundColor: "var(--button-primary-background)",
        hoverBackgroundColor: "var(--button-primary-hover-background)",
        textColor: "var(--button-primary-text)",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "600",
        padding: "10px 22px",
        borderColor: "var(--button-primary-border-color)",
        mobile: {
          height: "44px",
          width: "auto",
          backgroundColor: "var(--button-primary-background)",
          hoverBackgroundColor: "var(--button-primary-hover-background)",
          textColor: "var(--button-primary-text)",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "600",
          padding: "10px 22px",
          borderColor: "var(--button-primary-border-color)",
        },
      },
    },
    advanceSettings = {
      locations: [
        {
          id: "london",
          name: "London",
          mapImage:
            "https://via.placeholder.com/400x300/e5e5e5/999999?text=Map+Placeholder",
          contact: {
            phone: "+44 20 7123 4567",
            address:
              "Unit GS26/27 Lower Mall,\nThe Atrium, Union Square,\nAberdeen AB11 5PS",
          },
          openingHours: [
            { day: "Monday", hours: "12:00 PM - 10:00 PM" },
            { day: "Tuesday", hours: "12:00 PM - 10:00 PM" },
            { day: "Wednesday", hours: "12:00 PM - 10:00 PM" },
            { day: "Thursday", hours: "12:00 PM - 10:00 PM" },
            { day: "Friday", hours: "12:00 PM - 11:00 PM" },
            { day: "Saturday", hours: "11:00 AM - 11:00 PM" },
            { day: "Sunday", hours: "11:00 AM - 09:00 PM" },
          ],
          notes: "Kitchen closes 30 minutes before closing time",
          getDirectionsUrl:
            "https://www.google.com/maps/dir/?api=1&destination=51.523767,-0.158555",
        },
      ],
      buttonSettings: {
        target: "_blank",
        rel: "noopener noreferrer",
        showButton: true,
        variant: "filled" as const,
      },
      accessibility: {
        ariaLabel: "Visit us section with location information",
        role: "region",
      },
    },
    // Server-side resolved data (may be empty when page is ISR-cached)
    resolvedData: resolvedDataProp = {
      storeData: null,
      openingHours: [],
      storeOpeningHours: {},
      loading: false,
      error: null,
    },
  } = props;

  const [activeTab, setActiveTab] = useState(0);
  const swiperRef = useRef<SwiperClass | null>(null);

  // Client-side resolved data — fetched after hydration so this section
  // never blocks ISR. Falls back to prop data if already available.
  const [resolvedData, setResolvedData] = useState(resolvedDataProp);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Only fetch if no server-side data was provided (ISR path)
    if (hasFetched.current || resolvedData?.storeData?.data?.length) return;
    hasFetched.current = true;

    setResolvedData((prev: typeof resolvedDataProp) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    // Mirror exactly what the server-side path did:
    // 1. Cookie latitude/longitude (user's real location)
    // 2. advanceSettings.coordinates (admin-configured fallback)
    // 3. Hardcoded default
    const cookieLat = getCookie("lattitude");
    const cookieLng = getCookie("longitude");
    const cookieTimezone = getCookie("client_timezone");
    const cookieToken = getCookie("token") || undefined;

    const latitude = cookieLat
      ? Number(cookieLat)
      : advanceSettings?.coordinates?.latitude || 21.152432;
    const longitude = cookieLng
      ? Number(cookieLng)
      : advanceSettings?.coordinates?.longitude || 72.7749364;
    const timezone = resolveTimezone(cookieTimezone, "Asia/Calcutta");

    visitUsDataContext
      .getResolvedData({ latitude, longitude }, cookieToken, timezone)
      .then((data) => setResolvedData({ ...data, loading: false }))
      .catch(() =>
        setResolvedData({
          storeData: null,
          loading: false,
          error: "Failed to load store information",
        }),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get current day of the week
  const getCurrentDay = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[new Date().getDay()];
  };

  const currentDay = getCurrentDay();

  // Use resolved store data if available, otherwise fall back to default locations
  const locations =
    resolvedData?.storeData?.data?.length > 0
      ? resolvedData?.storeData?.data?.map((store: Store, index: number) => {
          // Transform workingHours from API to the format expected by the component
          const openingHours =
            store?.workingHours?.map((wh) => ({
              day: wh?.day,
              hours: wh?.timeSlots
                ?.map((ts) => `${ts?.startTime} - ${ts?.endTime}`)
                .join(", "),
              isOpen: wh?.isOpen,
            })) || [];

          const location = {
            id: store.slug || `store-${index}`,
            name: store?.name,
            mapImage:
              "https://via.placeholder.com/400x300/e5e5e5/999999?text=Map+Placeholder",
            contact: {
              phone: "+91 98765 43210", // Default phone since it's not in store data
              address: store?.address?.address,
            },
            openingHours: openingHours || [], // Use workingHours from API
            notes: "Kitchen closes 30 minutes before closing time",
            getDirectionsUrl: store?.address?.coordinates
              ? `https://www.google.com/maps/dir/?api=1&destination=${store.address.coordinates.latitude},${store.address.coordinates.longitude}`
              : advanceSettings.locations?.[0]?.getDirectionsUrl,
          };
          return location;
        })
      : advanceSettings.locations;

  const currentLocation = locations?.[activeTab];

  // Get opening hours for current store from server-side data
  const getCurrentStoreOpeningHours = (): OpeningHours[] => {
    if (resolvedData?.storeData?.data?.[activeTab]?.slug) {
      const storeSlug = resolvedData.storeData.data[activeTab].slug;
      if (storeSlug && resolvedData.storeOpeningHours?.[storeSlug]) {
        return resolvedData.storeOpeningHours[storeSlug];
      }
    }
    // Fallback to default opening hours
    return (
      currentLocation?.openingHours ||
      advanceSettings.locations?.[0]?.openingHours ||
      []
    );
  };

  const currentOpeningHours = getCurrentStoreOpeningHours();

  const handleTabClick = (index: number) => {
    swiperRef.current?.slideTo(index);
  };
  const handlePrev = () => swiperRef.current?.slidePrev();
  const handleNext = () => swiperRef.current?.slideNext();

  // Don't render the section if there are no locations and not loading
  if (
    !resolvedData?.loading &&
    !resolvedData?.error &&
    (!locations || locations.length === 0)
  ) {
    return <></>;
  }

  return (
    <>
      <section className="visit-us-section container mx-auto">
        <div>
          {/* Title Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full mb-4 md:mb-8 gap-2 md:gap-0">
            <div className="w-full">
              <h2 className="visit-us-section-title mb-5 md:mb-6">
                {basicContent.title}
              </h2>
              <p className="visit-us-section-subtitle">
                {basicContent.subtitle}
              </p>
            </div>
            {/* Only show navigation arrows when there are multiple stores */}
            {locations && locations.length > 1 && (
              <SliderNavigation
                onPrevClick={handlePrev}
                onNextClick={handleNext}
                disabled={false}
                size="md"
                variant="default"
                hideOnMobile={true}
              />
            )}
          </div>

          {/* Loading State */}
          {resolvedData?.loading && (
            <div className="flex flex-col justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]" />
              <span className="ml-2 loading-text md:text-base text-sm mt-3">
                Loading store information...
              </span>
            </div>
          )}

          {/* Error State */}
          {resolvedData?.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error loading store data
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{resolvedData.error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          {!resolvedData?.loading && !resolvedData?.error && (
            <>
              <div className="tabs-container flex items-center md:items-start justify-start md:justify-start mx-auto py-4 md:pt-6 md:pb-4 max-w-full  gap-3 md:gap-5 overflow-x-auto md:overflow-x-visible scrollbar-hide md:flex-wrap px-0 md:px-0">
                {locations?.map((location: Location, index: number) => (
                  <button
                    key={location.id}
                    className={`
                    transition-all duration-300 ease-in-out
                    border border-gray-200 rounded-lg
                    px-4 py-3 md:px-10 md:py-2
                    font-medium  text-base
                    cursor-pointer flex-shrink-0 whitespace-nowrap
                    ${
                      activeTab === index
                        ? "font-semibold active-tab"
                        : "font-regular inactive-tab"
                    }
                  `}
                    onClick={() => handleTabClick(index)}
                  >
                    {location.name}
                  </button>
                ))}
              </div>

              {/* Tab Content with Slide Animation */}
              <div
                className="tab-content-outer overflow-hidden relative"
                style={{ minHeight: 300 }}
              >
                <Swiper
                  loop={true}
                  onSwiper={(swiper) => (swiperRef.current = swiper)}
                  onSlideChange={(swiper) => setActiveTab(swiper.realIndex)}
                  initialSlide={activeTab}
                  slidesPerView={1}
                  allowTouchMove={false}
                >
                  {locations.map((location: Location, idx: number) => (
                    <SwiperSlide key={location.id}>
                      <div className="flex flex-col md:flex-row p-4 md:p-6 gap-4 md:gap-0 items-start rounded-xl border main-content-grid">
                        {/* Map Section - Left Column */}
                        <div className="flex flex-col md:flex-row gap-4 md:gap-4 w-full md:w-[65%]">
                          <div className="w-full">
                            <div className="relative rounded-2xl md:rounded-xl overflow-hidden bg-[var(--white)] border border-[var(--borders-dividers)] h-64 md:h-[400px] google-maps-container">
                              <iframe
                                width="100%"
                                height="100%"
                                className="border-0 google-maps-iframe"
                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${
                                  resolvedData?.storeData?.data?.[idx]?.address
                                    ?.coordinates
                                    ? `${resolvedData.storeData.data[idx].address.coordinates.latitude},${resolvedData.storeData.data[idx].address.coordinates.longitude}`
                                    : "40.7128,-74.0060"
                                }&zoom=15`}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title={`google-maps-${idx}`}
                              ></iframe>
                            </div>
                          </div>
                          {/* Contact Information Card - Middle Column */}
                          <div className="w-full px-0 md:px-6 rounded-2xl h-auto md:h-[400px] flex flex-col">
                            <div className="flex items-start gap-3 mb-4 md:mb-5 mt-2 md:mt-2">
                              <PhoneIcon
                                className="flex-shrink-0 mt-0.5"
                                width={18}
                                height={17}
                              />
                              <div className="flex-1">
                                <div className="text-sm md:text-base font-semibold mb-0.5 md:mb-1 contact-label">
                                  Contacts
                                </div>
                                <p className="m-0 text-sm md:text-sm leading-relaxed contact-text contact-phone">
                                  {location?.contact?.phone ? (
                                    <a
                                      href={`tel:${location.contact.phone}`}
                                      className="hover:underline focus:underline"
                                    >
                                      {location.contact.phone}
                                    </a>
                                  ) : null}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 mb-4 md:mb-5">
                              <LocationIcon
                                variant="default"
                                width={24}
                                height={24}
                              />
                              <div className="flex-1">
                                <div className="text-sm md:text-sm font-semibold mb-0.5 md:mb-1 contact-label">
                                  Address
                                </div>
                                <a
                                  href={
                                    location?.getDirectionsUrl ||
                                    basicContent.button?.link ||
                                    "#"
                                  }
                                  target={
                                    advanceSettings.buttonSettings?.target ||
                                    "_blank"
                                  }
                                  rel={
                                    advanceSettings.buttonSettings?.rel ||
                                    "noopener noreferrer"
                                  }
                                  className="m-0 text-sm md:text-sm leading-relaxed whitespace-pre-line contact-text contact-address cursor-pointer"
                                >
                                  {location?.contact?.address}
                                </a>
                              </div>
                            </div>
                            {advanceSettings.buttonSettings?.showButton && (
                              <a
                                href={
                                  location?.getDirectionsUrl ||
                                  basicContent.button?.link ||
                                  "#"
                                }
                                target={
                                  advanceSettings.buttonSettings?.target ||
                                  "_blank"
                                }
                                rel={
                                  advanceSettings.buttonSettings?.rel ||
                                  "noopener noreferrer"
                                }
                                className={`inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ease-in-out mt-4 md:mt-auto md:w-[180px] xl:w-[200px] get-directions-button ${advanceSettings.buttonSettings?.variant === "outlined" ? "border bg-transparent outlined-button" : "border-none filled-button"}`}
                              >
                                <GetDirectionsIcon width={20} height={20} />
                                {basicContent?.button?.text}
                              </a>
                            )}
                          </div>
                        </div>
                        {/* Opening Hours Card - Right Column */}
                        {location.openingHours.length > 0 && (
                          <div className="w-full md:w-[35%] border-t md:border-t-0 md:border-l border-[#D7D5C4] pt-5 md:pt-0 h-auto md:h-[400px] flex flex-col md:pl-10 opening-hours-section">
                            <div className="px-0  pb-2 md:pb-2">
                              <p className="text-base md:text-lg font-semibold m-0 open-hours-title mb-1">
                                Opening Hours
                              </p>
                            </div>
                            <div className="flex-1 p-0">
                              <ul className="w-full h-full text-sm md:text-sm opening-hours-list">
                                {location.openingHours.map(
                                  (schedule, index) => {
                                    const isCurrentDay =
                                      schedule.day === currentDay;
                                    return (
                                      <li
                                        key={index}
                                        className={`opening-hours-item ${isCurrentDay ? "current-day-item" : ""}`}
                                      >
                                        <span className="schedule-day">
                                          {schedule.day}
                                        </span>
                                        <span className="schedule-hours">
                                          {schedule.hours}
                                        </span>
                                      </li>
                                    );
                                  },
                                )}
                              </ul>
                            </div>
                            {/* {location.notes && (
                            <div className="mx-0  mt-4 md:mt-3 p-3 md:p-3 rounded-lg border text-xs md:text-sm notes-container">
                              {location.notes}
                            </div>
                          )} */}
                          </div>
                        )}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </>
          )}
        </div>
      </section>
      <style>
        {`
        .visit-us-section {
          padding: ${styling.layout?.padding || "30px 30px"} !important;
          background-color: ${styling.layout?.backgroundColor || "transparent"};
          margin: ${styling.layout?.margin || "0 auto"} !important;
        }

        .visit-us-section-title {
          font-size: ${styling.typography?.title?.fontSize || "48px"};
          color: ${styling.typography?.title?.color || "var(--primary-text)"};
          text-align: ${styling.typography?.title?.alignment || "center"};
          font-weight: ${styling.typography?.title?.fontWeight || "700"};
          line-height: ${styling.typography?.title?.lineHeight || "1.2"};
        }
        
        .visit-us-section-subtitle {
          font-size: ${styling.typography?.subtitle?.fontSize || "18px"};
          color: ${styling.typography?.subtitle?.color || "var(--secondary-text)"};
          text-align: ${styling.typography?.subtitle?.alignment || "center"};
          font-weight: ${styling.typography?.subtitle?.fontWeight || "400"};
          line-height: ${styling.typography?.subtitle?.lineHeight || "1.5"};
        }

        .scrollbar-hide {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        } 

        .active-tab {
          background: ${styling.tabsContainer?.activeTabBackground || "var(--button-primary-active-background)"};
          color: ${styling.tabsContainer?.activeTabColor || "var(--primary-text)"};
          border-color: ${styling.tabsContainer?.activeTabBorder || "var(--primary-color)"};
        }

        .inactive-tab {
          background: ${styling.tabsContainer?.inactiveTabBackground || "transparent"};
          color: ${styling.tabsContainer?.inactiveTabColor || "var(--secondary-text)"};
          border-color: transparent;
        }

        .main-content-grid {
           background-color: var(--cards-containers);
          border-color: ${styling.tabsContainer?.activeTabBorder || "var(--primary-color)"};
        }

        .contact-icon {
          width: ${styling.contactStyling?.icon?.size || "18px"};
          height: ${styling.contactStyling?.icon?.size || "18px"};
          color: ${styling.contactStyling?.icon?.color || "var(--primary-color)"};
        }

        .contact-label {
          color: ${styling.contactStyling?.label?.color || "var(--primary-text)"};
          font-size: ${styling.contactStyling?.label?.fontSize || "16px"};
          font-weight: ${styling.contactStyling?.label?.fontWeight || "600"};
          line-height: ${styling.contactStyling?.label?.lineHeight || "1.3"};
        }

        .contact-text {
          color: ${styling.contactStyling?.text?.color || "var(--secondary-text)"};
          font-size: ${styling.contactStyling?.text?.fontSize || "14px"};
          font-weight: ${styling.contactStyling?.text?.fontWeight || "700"};
          line-height: ${styling.contactStyling?.text?.lineHeight || "1.3"};
        }

        .filled-button {
          padding: ${styling.button?.padding || "10px 22px"};
          border-radius: ${styling.button?.borderRadius || "8px"};
          font-weight: ${styling.button?.fontWeight || "600"};
          font-size: ${styling.button?.fontSize || "16px"};
          background-color: ${styling.button?.backgroundColor || "var(--button-primary-background)"};
          color: ${styling.button?.textColor || "var(--button-primary-text)"};
          border-color: ${styling.button?.borderColor || "var(--button-primary-border-color)"};
          text-decoration: none;
        }

        .outlined-button {
          padding: ${styling.button?.padding || "10px 22px"};
          border-radius: ${styling.button?.borderRadius || "8px"};
          font-weight: ${styling.button?.fontWeight || "600"};
          font-size: ${styling.button?.fontSize || "16px"};
          background-color: transparent;
          color: ${styling.button?.textColor || "var(--button-primary-text)"};
          border-color: ${styling.button?.borderColor || "var(--button-primary-border-color)"};
          text-decoration: none;
        }

        .schedule-day {
          font-size:14px;
          font-weight: 400;
          color: var(--secondary-text);
        }
        
        .schedule-hours {
          font-size:14px;
          font-weight: 600;
          color: var(--secondary-text);
        }

        .loading-text {
         color: var(--primary-text);
        }
        
        .open-hours-title {
          font-size: ${styling.contactStyling?.label?.fontSize || "16px"};
          color: ${styling.contactStyling?.label?.color || "var(--primary-text)"};
          font-weight: ${styling.contactStyling?.label?.fontWeight || "600"};
          line-height: ${styling.contactStyling?.label?.lineHeight || "1.3"};
        }

        .opening-hours-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .opening-hours-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 10px;
         border-radius: 8px;
          transition: all 0.2s ease;
        }

        .current-day-item {
          border: 1px dotted var(--primary-color);
          background-color: var(--button-primary-active-background);
          color: var(--primary-text) !important;
          font-weight: 600 !important;
        }

        .schedule-day {
          font-size: 14px;
          font-weight: 400;
          color: var(--secondary-text);
        }
        
        .schedule-hours {
          font-size: 14px;
          font-weight: 600;
          color: var(--secondary-text);
        }

        .current-day-item .schedule-day,
        .current-day-item .schedule-hours {
          color: var(--primary-text) !important;
          font-weight: 600 !important;
        }

        .notes-container {
          background-color: #FFA72633;
          color: #FFA726;
          border-color: #FFA726;
        }

        .today-indicator {
          color: var(--primary-color);
          font-size: 12px;
          font-weight: 500;
          margin-left: 4px;
        }
        .contact-phone {
            text-decoration: underline !important;
          }
        .contact-address {
         
          display: inline-block !important;
        
        }

        .get-directions-button:hover {
          background: ${styling.button?.hoverBackgroundColor || "var(--button-primary-hover-background)"};
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .visit-us-section {
             padding:${styling.layout?.mobile?.padding || "24px 16px"} !important;
             background-color:${styling.layout?.mobile?.backgroundColor || "transparent"} !important;
             margin:${styling.layout?.mobile?.margin || "0"} !important;
          }

          .visit-us-section-title {
            font-size: ${styling.typography?.title?.mobile?.fontSize || "32px"} !important;
            text-align: ${styling.typography?.title?.mobile?.alignment || styling.typography?.title?.alignment || "center"} !important;
            font-weight: ${styling.typography?.title?.mobile?.fontWeight || styling.typography?.title?.fontWeight || "700"} !important;
            color: ${styling.typography?.title?.mobile?.color || styling.typography?.title?.color || "var(--primary-text)"} !important;
            line-height: ${styling.typography?.title?.mobile?.lineHeight || styling.typography?.title?.lineHeight || "1.2"} !important;
          }
          
          .visit-us-section-subtitle {
            font-size: ${styling.typography?.subtitle?.mobile?.fontSize || "16px"} !important;
            text-align: ${styling.typography?.title?.mobile?.alignment || styling.typography?.subtitle?.alignment || "center"} !important;
            font-weight: ${styling.typography?.subtitle?.mobile?.fontWeight || styling.typography?.subtitle?.fontWeight || "400"} !important;
            color: ${styling.typography?.subtitle?.mobile?.color || styling.typography?.subtitle?.color || "var(--secondary-text)"} !important;
            line-height: ${styling.typography?.subtitle?.mobile?.lineHeight || styling.typography?.subtitle?.lineHeight || "1.5"} !important;
          }

          .contact-label {
            font-size: ${styling.contactStyling?.label?.mobile?.fontSize || "14px"} !important;
            font-weight: ${styling.contactStyling?.label?.mobile?.fontWeight || "600"} !important;
            color: ${styling.contactStyling?.label?.mobile?.color || "var(--primary-text)"} !important;
            line-height: ${styling.contactStyling?.label?.mobile?.lineHeight || "1.3"} !important;
          }

          .contact-text {
            font-size: ${styling.contactStyling?.text?.mobile?.fontSize || "14px"} !important;
            font-weight: ${styling.contactStyling?.text?.mobile?.fontWeight || "400"} !important;
            color: ${styling.contactStyling?.text?.mobile?.color || "var(--secondary-text)"} !important;
            line-height: ${styling.contactStyling?.text?.mobile?.lineHeight || "1.3"} !important;
          }

       

          .get-directions-button {
            width: 100% !important;
            font-size:${styling.button?.mobile?.fontSize || "14px"} !important;
            padding:${styling.button?.mobile?.padding || "10px 22px"} !important;
            border-radius:${styling.button?.mobile?.borderRadius || "8px"} !important;
            font-weight:${styling.button?.mobile?.fontWeight || "600"} !important;
            background-color:${styling.button?.mobile?.backgroundColor || "var(--button-primary-background)"} !important;
            color:${styling.button?.mobile?.textColor || "var(--button-primary-text)"} !important;
            border-color:${styling.button?.mobile?.borderColor || "var(--button-primary-border-color)"} !important;
          }
          .get-directions-button:hover {
            background: ${styling.button?.mobile?.hoverBackgroundColor || "var(--button-primary-hover-background)"} !important;
          }
          
        }
        `}
      </style>
    </>
  );
};
