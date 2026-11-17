'use client'
import { EVENT_ARROW_DOWN_ICON, EVENT_BANNER_MAIN_IMAGE, EVENT_CLOCK_ICON } from '@config/Header/image.config';
import useLang from '@hooks/useLang';
import { useEvents } from '@hooks/useEvents';
import { formatEventPrice, formatEventLocation, getEventLabel } from '../../utils/eventUtils';
import { useRouter } from 'next/navigation';
import React from 'react';
import { LanguageCode, TranslationKeys } from 'types';
import { getFormattedDateTime } from '@lib/helper/date';
import { generateImageBase64FromUrl } from '@lib/helper/ImageGen/imageGen';
import tenantConfig from '@config/tenant.config';
import Loader from '@components/loader/Loader';
import OrderStickyButton from './OrderStickyButton';
import Icon from '@components/image/Icons';

const EventGrid = () => {
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const router = useRouter();
    const { events, loading } = useEvents();

    const handleEventClick = (eventId: string) => {
        router.push(`/events/event-details?id=${eventId}`);
    };

    if (loading) {
        return (
            <section className="event-grid-section px-4 py-8">
                <Loader />
            </section>
        );
    }    

    return (
        <>
            <section className="event-grid-section px-4 py-8">
                <div className="event-grid-header-container">
                  <div className="event-grid-header-bg" />
                  <div className="event-grid-header-content">
                    <h2 className="event-heading-title mb-1">
                        {lang.eventsYouMayLike}
                    </h2>
                    <p className="event-description">
                        {lang.discoverMoreExperiencesCuratedJustForYou}
                    </p>
                  </div>
                </div>
                <div className="event-sticky-button">
                    <OrderStickyButton
                        icon={EVENT_ARROW_DOWN_ICON}
                        onClick={() => {
                            router.push('/menu');
                        }}
                    />
                </div>
                <div className="event-grid-container">
                    {/* Event Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="event-card bg-[var(--cards-containers)] rounded-2xl shadow-sm overflow-hidden cursor-pointer"
                                onClick={() => handleEventClick(event.id)}
                            >
                                {/* Image Container */}
                                <div className="relative overflow-hidden">
                                    <img
                                        src={generateImageBase64FromUrl({ url: event.images[0].url, width: 315, height: 315 })?.fullEncodedUrl || generateImageBase64FromUrl({ url: tenantConfig.productPlaceholderImageUrl || "", width: 315, height: 315 })?.fullEncodedUrl || ""}
                                        alt={event.name}
                                        className="event-image w-full object-cover"
                                    />
                                    {/* Event Label */}
                                    <div className="absolute top-3 left-3">
                                        <span className="event-label">
                                            {getEventLabel(event)}
                                        </span>
                                    </div>
                                    {/* Age Badge */}
                                    {event.minAge && (
                                        <div className="absolute top-3 right-3">
                                            <span className="event-age-badge">
                                                {event.minAge}+
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4 md:p-5">
                                    <h3 className="event-title mb-1 line-clamp-2 leading-tight">
                                        {event.name}
                                    </h3>

                                    {/* Date & Time */}
                                    <div className="flex items-center text-gray-500 text-xs md:text-sm mb-3">
                                        <img src={EVENT_CLOCK_ICON} alt="event-clock" className="event-clock-icon mr-2" />
                                        <span className="event-datetime truncate">
                                            {getFormattedDateTime(event.startDateAndtime, "h:mm A", "MMM DD")} - {getFormattedDateTime(event.endDateAndtime, "h:mm A", "MMM DD")}
                                        </span>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-center text-gray-500 text-xs md:text-sm mb-1">
                                        <span className="event-location truncate">
                                            {formatEventLocation(event)}
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-center justify-between">
                                        <span className={`event-price ${event.priceType === 'FREE' ? 'event-price-free' : 'event-price-paid'}`}>
                                            {formatEventPrice(event, lang)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* View More Button */}
                    {events.length > 9 && (
                        <div className="flex justify-center">
                            <button className="view-more-btn">
                                {lang.viewMore}
                                {/* <img src={EVENT_ARROW_DOWN_ICON} alt="event-arrow-down" className="event-arrow-down-icon" /> */}
                                <Icon
                                    icon={`${EVENT_ARROW_DOWN_ICON}`}
                                    width={25}
                                    height={25}
                                    color={"var(--primary-text)"}
                                    viewBox="0 0 19 20"
                                    className='event-arrow-down-icon'
                                />
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <style>{`
                .event-grid-section {
                  background-color: var(--primary-background);
                  width: 100%;
                }
                .event-grid-header-container {
                  position: relative;
                  width: 80%;
                  margin: 0 auto 32px auto;
                  border-radius: 16px;
                  overflow: hidden;
                  display: flex;
                  align-items: center;
                  justify-content: flex-start;
                  aspect-ratio: 1320/240;
                }
                .event-grid-header-bg {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background-image: url('${tenantConfig.eventBannerMainImage || EVENT_BANNER_MAIN_IMAGE}');
                  background-size: cover;
                  background-position: center;
                  filter: none;
                  z-index: 1;
                }
                .event-grid-header-content {
                  position: relative;
                  z-index: 2;
                  padding: 32px 40px;
                  display: flex;
                  flex-direction: column;
                  align-items: flex-start;
                  justify-content: end;
                  height: 100%;
                }
                .event-heading {
                  color: #222;
                  font-size: 2rem;
                  font-weight: var(--font-bold);
                  margin-bottom: 0.25rem;
                }
                .event-description {
                  color: var(--black);
                  font-size: var(--small-font);
                  font-weight: var(--font-medium);
                }
                .event-heading-title {
                  color: var(--black);
                  font-size: var(--heading-h1);
                  font-weight: var(--font-bold);
                  margin-bottom: 0.25rem;
                }
                .event-grid-container {
                    background-color: var(--primary-background);
                    width: 80%;
                    margin: 0 auto;
                }
                .event-label {
                    background-color:  var(--primary-background);
                    border-radius: 8px;
                    color: var(--primary-text);
                    font-size: var(--small-font);
                    font-weight: var(--font-medium);
                    padding: 8px;

                }
                .event-age-badge {
                    background-color: var(--primary-color);
                    border-radius: 8px;
                    color: var(--black);
                    font-size: var(--small-font);
                    font-weight: var(--font-semi-bold);
                    padding: 8px;
                }
                .event-title {
                    color: var(--primary-text);
                    font-size: var(--heading-h4);
                    font-weight: var(--font-bold);
                }
                .event-price {
                    font-size: var(--heading-h5);
                    font-weight: var(--font-bold);
                }
                .event-price-free {
                    color: var(--primary-color);
                }
                .event-price-paid {
                    color: var(--primary-text);
                }
                .event-datetime {
                    color: var(--secondary-text);
                    font-size: var(--small-font);
                    font-weight: var(--font-medium);
                }
                .event-location {
                    color: var(--primary-text);
                    font-size: var(--small-font);
                    font-weight: var(--font-medium);
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .event-clock-icon {
                    width: 14px;
                    height: 14px;
                }
                .event-card {
                    transition: all 0.3s ease;
                }
                
                .event-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                }
                
                .event-image {
                    transition: transform 0.3s ease;
                    height: auto;
                }
                
                .event-card:hover .event-image {
                    transform: scale(1.05);
                }
                
                .view-more-btn {
                    color: var(--primary-text);
                    font-size: var(--small-font);
                    font-weight: var(--font-bold);
                    padding: 10px 20px;
                    border-radius: 8px;
                    border: 1px solid var(--primary-color);
                    background-color: var(--cards-containers);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0px;
                }
                
                .view-more-btn:hover {
                    background-color: var(--primary-color);
                    border-color: var(--primary-color);
                    color: var(--white);
                }
                .event-sticky-button {
                   display: none;
                }
                @media (max-width: 768px) {
                    .event-grid-container {
                        width: 100%;
                    }
                    .event-heading {
                        font-size: var(--heading-h2);
                    }
                    .event-description {
                        font-size: var(--small-font);
                    }
                    .event-grid-header-content {
                        padding: 20px 16px;
                    }
                    .event-heading {
                        font-size: var(--heading-h2);
                    }
                    .event-description {
                        font-size: var(--small-font);
                    }
                    .event-grid-header-container {
                        width: 100%;
                    }
                    .event-heading-title {
                        font-size: var(--heading-h2);
                    }
                    .event-sticky-button {
                        display: block;
                    }
                }
      `}</style>
        </>
    );
};

export default EventGrid;