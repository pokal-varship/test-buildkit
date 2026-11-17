"use client"
import React, { useRef } from 'react';
import Icon from '../image/Icons';
import Link from 'next/link';
import { EVENT_BASE_CLOCK_ICON, EVENT_CONTACT_ICON, EVENT_MAIL_ICON, EVENT_PARKING_ICON, EVENT_RIGHT_ARROW_ICON, EVENT_TIME_ICON, EVENT_USER_CHECK_ICON } from '@config/Header/image.config';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperCore } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import LocationMap from './LocationMap';
import { useEventDetails } from '@hooks/useEventDetails';
import {
  formatEventDuration,
  getEventImages,
  formatEventPrice
} from '../../utils/eventUtils';
import { useSearchParams } from 'next/navigation';
import Loader from '@components/loader/Loader';
import { EventData } from '@components/type/event.type';
import { getFormattedDateTime } from '@lib/helper/date';
import { generateImageBase64FromUrl } from '@lib/helper/ImageGen/imageGen';
import tenantConfig from '@config/tenant.config';
import parse from 'html-react-parser';
import { TranslationKeys, LanguageCode } from 'types';
import { useLang } from '@hooks/useLang';
import BreadcrumbSchema from '@components/schema/BreadcrumbSchema';

const breadcrumbItems = [
  { label: 'Home', link: '/', isLink: true },
  { label: 'Events', link: '/events', isLink: true },
  { label: 'Event Details', isLink: false },
];

const EventDetailsPage = () => {
  const swiperRef = useRef<SwiperCore | null>(null);
  const searchParams = useSearchParams();
  const eventId = searchParams?.get('id');
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const { event, loading, error } = useEventDetails(eventId || undefined);
  const organizerName = event?.clientName || event?.organizerDetails?.firstName + ' ' + event?.organizerDetails?.lastName || "Event Organizer";

  const handleGetTickets = () => {
    if (event?.bookingUrl) {
      const url = event.bookingUrl.startsWith('http')
        ? event.bookingUrl
        : `https://${event.bookingUrl}`;
  
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="event-details-page">
        <div className="event-details-container">
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-details-page">
        <div className="event-details-container">
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error || 'Event not found'}</p>
              <Link href="/events" className="text-blue-600 hover:underline">
                Back to Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const eventImages = getEventImages(event);  

  // Generate breadcrumb schema with dynamic event name
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_WEBSITE_URL || '';
  const breadcrumbSchemaItems = [
    {
      position: 1,
      name: "Home",
      item: baseUrl
    },
    {
      position: 2,
      name: "Events",
      item: `${baseUrl}/events`
    },
    {
      position: 3,
      name: event.name || "Event Details",
      item: typeof window !== 'undefined' ? window.location.href : `${baseUrl}/events/${eventId}`
    }
  ];

  return (
    <div className="event-details-page">
      <BreadcrumbSchema items={breadcrumbSchemaItems} id={`breadcrumb-event-${event.id || eventId}`} />
      <div className="event-details-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <div className="breadcrumb-container">
            {breadcrumbItems.map((item, idx) => (
              <React.Fragment key={item.label}>
                {item.isLink ? (
                  <Link href={item.link!} className="breadcrumb-link">{item.label}</Link>
                ) : (
                  <span className="breadcrumb-current">{item.label}</span>
                )}
                {idx < breadcrumbItems.length - 1 && (
                  <span className="breadcrumb-separator">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </nav>

        {/* Full-width image or slider */}
        <div className="hero-image-container">
          {eventImages && eventImages.length > 1 ? (
            <Swiper
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              modules={[Pagination, Autoplay]}
              className="swiper-container"
              spaceBetween={0}
              slidesPerView={1}
              loop={true}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
            >
              {eventImages.map((image, index) => {
                const imageUrl = generateImageBase64FromUrl({ url: image, width: 315, height: 315 })?.fullEncodedUrl || generateImageBase64FromUrl({ url: tenantConfig.productPlaceholderImageUrl || "", width: 315, height: 315 })?.fullEncodedUrl || "";
                return (
                  <SwiperSlide key={index}>
                    <div className="slide-container">
                      <div 
                        className="hero-image-background"
                        style={{
                          backgroundImage: `url(${imageUrl})`,
                        }}
                      />
                      <img
                        src={imageUrl}
                        alt={`${event.name} - Image ${index + 1}`}
                        className="hero-image"
                        onError={(e) => console.error(`Failed to load image ${index + 1}:`, e)}
                      />
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          ) : eventImages && eventImages.length === 1 ? (
            (() => {
              const imageUrl = generateImageBase64FromUrl({ url: eventImages[0], width: 315, height: 315 })?.fullEncodedUrl || generateImageBase64FromUrl({ url: tenantConfig.productPlaceholderImageUrl || "", width: 315, height: 315 })?.fullEncodedUrl || "";
              return (
                <div className="slide-container">
                  <div 
                    className="hero-image-background"
                    style={{
                      backgroundImage: `url(${imageUrl})`,
                    }}
                  />
                  <img src={imageUrl} alt={event.name} className="hero-image" />
                </div>
              );
            })()
          ) : (
            <div className="hero-image-placeholder">
              <p>No images available</p>
            </div>
          )}
        </div>

        <div className="event-details-container-inner">

          {/* Tags, Title and Get Tickets Container */}
          <div className="tags-title-tickets-container">
            <div className="left-section">
              <div className="tags-wrapper">
                {event.minAge && (
                  <span className="tag flex items-center gap-2 justify-center">
                    <Icon
                      icon={`${EVENT_USER_CHECK_ICON}#event-user-check`}
                      color="var(--secondary-text)"
                      width={16}
                      height={16}
                      className="icon-inline"
                      viewBox="0 0 24 24"
                    />
                    {event.minAge}+
                  </span>
                )}
                {/* <span className="tag flex items-center gap-1 justify-center">
                  <Icon icon={EVENT_BASE_CLOCK_ICON} color="var(--primary-color)" width={16} height={16} className="icon-inline" viewBox="0 0 24 24" />
                  {getFormattedDateTime(event.startDateAndtime)}
                </span> */}
                <span className="tag flex items-center gap-2 justify-center">
                  <Icon
                    icon={`${EVENT_TIME_ICON}#event-time`}
                    color="var(--secondary-text)"
                    width={16}
                    height={16}
                    className="icon-inline"
                    viewBox="0 0 24 24"
                  />
                  {formatEventDuration(event)}
                </span>
                <span className="tag flex items-center gap-2 justify-center">
                  <Icon
                    icon={`${EVENT_PARKING_ICON}#event-parking`}
                    color="var(--secondary-text)"
                    width={16}
                    height={16}
                    className="icon-inline"
                    viewBox="0 0 24 24"
                  />
                  {lang.paidVenueParking}
                </span>
              </div>
              <h1 className="event-title">{event.name}</h1>
            </div>
            <div className="right-section desktop-only">
              <div className="price-box">
                <div className="price-range">{formatEventPrice(event, lang)}</div>
                <button className="get-tickets-btn" onClick={handleGetTickets}>
                  {lang.getTickets}
                  <Icon
                    icon={`${EVENT_RIGHT_ARROW_ICON}#right-arrow`}
                    width={20}
                    height={20}
                    className="icon-inline"
                    viewBox="0 0 19 19"
                    color="var(--white)"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile only get tickets button */}
          <div className="price-box mobile-only">
            <div className="price-range">{formatEventPrice(event, lang)}</div>
            <button className="get-tickets-btn" onClick={handleGetTickets}>
              {lang.getTickets}
              <Icon
                icon={`${EVENT_RIGHT_ARROW_ICON}#right-arrow`}
                width={20}
                height={20}
                className="icon-inline"
                viewBox="0 0 19 19"
                color="var(--white)"
              />
            </button>
          </div>

          {/* Main content */}
          <div className="main-content">
            {/* Date & Time */}
            <div className="content-card">
              <h2 className="card-title themed-heading">{lang.eventDate}</h2>
              <div className="date-time-info desktop-view-only">
                <div className="event-info-item">
                  <Icon
                    icon={`${EVENT_BASE_CLOCK_ICON}#event-base-clock`}
                    color="var(--secondary-text)"
                    width={20}
                    height={20}
                    className="icon-inline"
                    viewBox="0 0 24 24"
                  />
                  <span className="info-text pt-1">{getFormattedDateTime(event.startDateAndtime)} - {getFormattedDateTime(event.endDateAndtime)}</span>
                </div>
              </div>
              <div className="date-time-info mobile-view-only">
                <div className="event-info-item mb-2">
                  <Icon
                    icon={`${EVENT_BASE_CLOCK_ICON}#event-base-clock`}
                    color="var(--secondary-text)"
                    width={20}
                    height={20}
                    className="icon-inline"
                    viewBox="0 0 24 24"
                  />
                  <span className="info-text pt-1">{getFormattedDateTime(event.startDateAndtime)}</span>
                </div>
                <div className="event-info-item">
                  <Icon
                    icon={`${EVENT_BASE_CLOCK_ICON}#event-base-clock`}
                    color="var(--secondary-text)"
                    width={20}
                    height={20}
                    className="icon-inline"
                    viewBox="0 0 24 24"
                  />
                  <span className="info-text pt-1">{getFormattedDateTime(event.endDateAndtime)}</span>
                </div>
              </div>
            </div>

            {/* About the event */}
            {event.description && <div className="content-card">
              <h2 className="card-title themed-heading">{lang.aboutTheEvent}</h2>
              {event.description.split("\n\n").map((p, i) => (
                <p key={i} className="description-text">{parse(p)}</p>
              ))}
            </div>}

            {/* Organized by */}
            <div className="content-card">
              <h2 className="card-title themed-heading">{lang.organizedBy}</h2>
              <div className="organizer-card">
                <div className="organizer-info-main">
                  <p className="organizer-name">{organizerName}</p>
                  <div className="organizer-contact-info">
                    <a href={`tel:${event.organizerDetails.countryCode}${event.organizerDetails.phone}`} className="contact-link">
                      <Icon 
                        icon={`${EVENT_CONTACT_ICON}#contact-icon`} 
                        width={16} 
                        height={16} 
                        viewBox="0 0 24 24" 
                        color="var(--secondary-text)" 
                        className="icon-inline"
                      />
                      <span>{event.organizerDetails.countryCode}{event.organizerDetails.phone}</span>
                    </a>
                    <span className="desktop-view-only inline-block h-2 w-2 rounded-full bg-[var(--rating-border-primary)]" />
                    <a href={`mailto:${event.organizerDetails.email}`} className="contact-link">
                      <Icon 
                        icon={`${EVENT_MAIL_ICON}#mail-icon`} 
                        width={16} 
                        height={16} 
                        viewBox="0 0 24 24" 
                        color="var(--secondary-text)" 
                        className="icon-inline"
                      />
                      <span>{event.organizerDetails.email}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="content-card">
              <h2 className="card-title themed-heading">{lang.location}</h2>
              <LocationMap eventData={event as unknown as EventData} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Mobile-first responsive design */
        .event-details-page {
          background-color: var(--primary-background);
          width: 100%;
          min-height: 100vh;
        }

        /* View-specific display classes */
        .desktop-view-only {
          display: none;
        }

        .mobile-view-only {
          display: block;
        }

        .swiper-horizontal > .swiper-pagination-bullets.swiper-pagination-bullets-dynamic, .swiper-pagination-horizontal.swiper-pagination-bullets.swiper-pagination-bullets-dynamic{
          justify-content: center;
        }

        .event-details-container {
          width: 100%;
          margin: 0 auto;
          padding: 12px;
        }
        .event-details-container-inner {
          width: 100%;
          margin: 0 auto;
        }
        .get-directions-btn {
          background: var(--primary-color);
          color: var(--black);
          width: 100%;
          font-weight: var(--font-bold);
          border: none;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: var(--small-font);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background-color 0.2s ease;
        }

        .direction-icon {
          flex-shrink: 0;
        }

        .breadcrumb {
          color: var(--primary-text);
          font-size: var(--extraSmall-font);
          margin-bottom: 12px;
          overflow-x: auto;
          white-space: nowrap;
        }

        .breadcrumb-container {
          display: flex;
          align-items: center;
          gap: 0px;
          padding: 0 2px;
        }

        .event-info-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .breadcrumb-link {
          color: var(--secondary-text);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .breadcrumb-link:hover {
          color: var(--primary-text);
        }

        .breadcrumb-separator {
          margin: 0 3px;
          color: var(--secondary-text);
        }

        .breadcrumb-current {
          color: var(--primary-text);
          font-weight: var(--font-medium);
        }
        .event-sale-ended-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .sale-ended-banner {
          background-color: white;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 16px;
          text-align: center;
          box-shadow: 0 1px 3px 0 var(--box-shadow-primary);
        }

        .sale-ended-title {
          color: var(--primary-color);
          font-size: 20px;
          font-weight: var(--font-bold);
          margin: 0 0 16px 0;
          text-align: center;
        }

        .explore-events-btn {
          background:var(--black) !important;
          color: var(--white) !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          padding: 12px 24px !important;
          font-size: var(--small-font) !important;
          border: none !important;
          cursor: pointer !important;
          transition: background-color 0.2s ease !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 8px !important;
        }

        .explore-events-btn:hover {
          background: var(--black) !important;
        }

        .explore-events-btn::after {
          content: "▶";
          font-size: var(--extraSmall-font);
          margin-left: 4px;
        }

        .hero-image-container {
          width: 100%;
          background-color: var(--black);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .hero-image {
          width: 100%;
          height: 160px;
          object-fit: contain;
          position: relative;
          z-index: 2;
        }

        .hero-image-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          filter: blur(5px);
          opacity: 0.6;
          z-index: 1;
        }

        .swiper-container {
          width: 100%;
          height: 100%;
        }

        .swiper-slide {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .slide-container {
          width: 100%;
          height: 160px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .hero-image-placeholder {
          width: 100%;
          height: 160px;
          background-color: var(--primary-background);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--secondary-text);
          font-size: var(--small-font);
        }

        .swiper-pagination {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          gap: 6px;
        }

        .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: var(--secondary-text);
          border-radius: 50%;
          margin: 0;
          cursor: pointer;
          transition: all 0.3s ease;
          opacity: 1;
        }

        .swiper-pagination-bullet-active {
          background: var(--white);
          transform: scale(1.2);
        }

        .swiper-pagination-bullet:hover {
          background: var(--secondary-text);
        }

        .tags-title-tickets-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }

        .left-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .right-section {
          display: none;
        }

        .tags-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tag {
          background-color: var(--cards-containers);
          color: var(--primary-text);
          font-size: var(--small-font);
          font-weight: var(--font-medium);
          padding: 4px 8px;
          border-radius: 8px;
          box-shadow: 0 1px 2px 0 var(--box-shadow-primary);
          white-space: nowrap;
        }

        .action-buttons {
          display: flex;
          gap: 6px;
          justify-content: flex-end;
        }

        .event-title {
          font-size: var(--heading-h1);
          font-weight: var(--font-bold);
          color: var(--primary-text);
          line-height: 1.3;
          margin: 0;
        }

        .price-box {
          background: var(--primary-color);
          border-radius: 15px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 200px;
          box-shadow: 0 1px 2px 0 var(--box-shadow-primary);
        }

        .mobile-only {
          display: none;
        }

        .price-range {
          font-size: var(--description-font);
          font-weight: var(--font-bold);
          color: var(--primary-text-light);
          margin-bottom: 10px;
        }

        .get-tickets-btn {
          background: var(--black) !important;
          color: var(--white) !important;
          border-radius: 6px !important;
          font-weight: var(--font-bold) !important;
          width: 100%;
          padding: 8px 0 !important;
          font-size: var(--small-font) !important;
          border: none !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          transition: background-color 0.2s ease !important;
        }

        .get-tickets-btn:hover {
          background: var(--black) !important;
        }

        .ticket-arrow {
          font-size: var(--extraSmall-font);
          color: var(--white);
        }

        .main-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          width: 100%;
        }

        .content-card {
          background-color: var(--primary-background);
          border-radius: 8px;
        }

        .card-title {
          font-size: var(--description-font);
          font-weight: var(--font-semi-bold);
          color: var(--primary-text);
          margin: 0 0 12px 0;
        }

        .date-time-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 6px;
        }

        .info-text {
          font-size: var(--small-font);
          color: var(--secondary-text);
          line-height: 1.4;
          margin: 0;
        }

        .description-text {
          font-size: var(--small-font);
          color: var(--primary-text);
        }

        .description-text:last-child {
          margin-bottom: 0;
        }

        .location-section {
          margin-bottom: 16px;
        }

        .location-title {
          font-size: var(--description-font);
          font-weight: var(--font-semi-bold);
          color: var(--primary-text);
          margin: 0 0 12px 0;
        }

        .location-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          border: 2px solid var(--primary-color);
          border-radius: 8px;
          padding: 12px;
          background-color: var(--white);
        }

        .map-section {
          width: 100%;
        }

        .map-image {
          width: 100%;
          height: 140px;
          object-fit: cover;
          border-radius: 6px;
        }

        .info-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          font-weight: var(--font-bold);
          font-size: var(--small-font);
          color: var(--primary-text);
        }

        .info-value {
          font-size: var(--small-font);
          color: var(--secondary-text);
          line-height: 1.4;
        }

        .directions-button {
          margin-top: auto;
        }

        .organizer-card {
          background: var(--cards-containers);
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .organizer-info-main {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .organizer-name {
          font-weight: var(--font-bold);
          color: var(--primary-text);
          font-size: var(--small-font);
          margin: 0;
        }

        .organizer-contact-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .contact-link {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--primary-text);
          text-decoration: underline;
          font-size: var(--small-font);
          transition: color 0.2s ease;
        }

        .contact-link:hover {
          color: var(--primary-color);
        }

        .contact-separator {
          color: var(--borders-dividers);
          font-size: var(--description-font);
        }

        /* Small mobile devices (320px - 480px) */
        @media (min-width: 320px) and (max-width: 480px) {
          .event-details-container {
            padding: 16px;
          }
          .event-details-container-inner {
            width: 100%;
            margin: 0 auto;
          }

          .mobile-only {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: var(--primary-color);
            border-radius:0px;
            padding: 16px 20px;
            box-shadow: 0 -2px 10px var(--box-shadow-primary);
            max-width: none;
            width: 100%;
          }

          .sale-ended-banner {
            padding: 20px;
            margin-bottom: 12px;
          }

          .sale-ended-title {
            font-size: var(--heading-h3);
            margin-bottom: 12px;
          }

          .explore-events-btn {
            padding: 10px 20px !important;
            font-size: var(--small-font) !important;
          }

          .hero-image {
            height: 180px;
          }

          .slide-container {
            height: 180px;
          }

          .swiper-pagination {
            bottom: 12px;
          }

          .swiper-pagination-bullet {
            width: 10px;
            height: 10px;
            margin: 0 5px;
          }

          .event-title {
            font-size: var(--heading-h2);
          }

          .price-box {
            padding: 16px 20px;
          }

          .price-range {
            font-size: var(--description-font);
          }

          .get-tickets-btn {
            font-size: var(--small-font) !important;
            padding: 10px 0 !important;
          }

          .tag {
            font-size: var(--extraSmall-font);
            padding: 6px 10px;
          }

          .card-title {
            font-size: var(--description-font);
            margin-bottom: 14px;
          }

          .description-text {
            font-size: var(--small-font);
          }

          .info-text {
            font-size: var(--small-font);
          }

          .map-image {
            height: 160px;
          }

          .info-label {
            font-size: var(--small-font);
          }

          .info-value {
            font-size: var(--small-font);
          }

          .organizer-name {
            font-size: var(--description-font);
          }

          .organizer-address {
            font-size: var(--small-font);
          }

          .get-directions-btn {
            font-size: var(--small-font);
          }
          .organizer-address-text {
            font-size: var(--small-font);
          }
          .desktop-view-only {
            display: none;
          }

          .mobile-view-only {
            display: block;
          }
        }

        /* Medium mobile devices (481px - 768px) */
        @media (min-width: 481px) and (max-width: 768px) {
          .event-details-container {
            padding: 20px;
            padding-bottom: 100px; /* Add space for fixed price box */
          }

          .event-details-container-inner {
            width: 100%;
            margin: 0 auto;
          }

          .mobile-only {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: var(--primary-color);
            border-radius: 8px 8px 0 0;
            padding: 16px 20px;
            box-shadow: 0 -2px 10px var(--box-shadow-primary);
            max-width: none;
            width: 100%;
          }

          .sale-ended-banner {
            padding: 24px;
            margin-bottom: 16px;
          }

          .sale-ended-title {
            font-size: var(--heading-h3);
            margin-bottom: 16px;
          }

          .explore-events-btn {
            padding: 12px 24px !important;
            font-size: var(--small-font) !important;
          }

          .breadcrumb {
            font-size: var(--extraSmall-font);
            margin-bottom: 16px;
          }

          .breadcrumb-container {
            gap: 0px;
          }

          .breadcrumb-separator {
            margin: 0 4px;
          }

          .hero-image-container {
            margin-bottom: 20px;
          }

          .hero-image {
            height: 240px;
          }

          .slide-container {
            height: 240px;
          }

          .swiper-pagination {
            bottom: 15px;
          }

          .swiper-pagination-bullet {
            width: 12px;
            height: 12px;
            margin: 0 6px;
          }

          .tags-title-tickets-container {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0px;
          }

          .left-section {
            flex: 1;
            margin-right: 20px;
          }

          .tags-wrapper {
            gap: 8px;
            margin-bottom: 12px;
          }

          .tag {
            font-size: var(--extraSmall-font);
            padding: 8px 12px;
          }

          .event-title {
            font-size: var(--heading-h3);
            margin: 0;
          }

          .right-section {
            flex-shrink: 0;
            display: flex;
            justify-content: flex-end;
          }

          .price-box {
            min-width: 200px;
            max-width: 240px;
            padding: 20px 24px;
          }

          .price-range {
            font-size: var(--description-font);
          }

          .get-tickets-btn {
            font-size: var(--small-font) !important;
            padding: 10px 0 !important;
          }

          .price-range {
            font-size: var(--description-font);
          }

          .main-content {
            gap: 20px;
          }

          .content-card {
            border-radius: 12px;
          }

          .card-title {
            font-size: var(--description-font);
            margin-bottom: 16px;
          }

          .description-text {
            font-size: var(--small-font);
            margin-bottom: 16px;
          }

          .info-text {
            font-size: var(--small-font);
          }

          .info-item {
            gap: 0px;
          }

          .location-container {
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .map-image {
            height: 200px;
            border-radius: 8px;
          }

          .info-section {
            gap: 16px;
          }

          .info-label {
            font-size: var(--small-font);
          }

          .info-value {
            font-size: var(--small-font);
          }

          .organizer-card {
            padding: 18px;
            border-radius: 12px;
          }

          .organizer-info-main {
            gap: 10px;
          }

          .organizer-name {
            font-size: var(--description-font);
          }

          .organizer-contact-info {
            gap: 10px;
          }

          .contact-link {
            font-size: var(--small-font);
          }

          .get-directions-btn {
            padding: 12px 16px;
            font-size: var(--small-font);
          }
          .organizer-address-text {
            font-size: var(--small-font);
          }
          .mobile-view-only {
            display: block;
          }
          .desktop-view-only {
            display: none;
          }
        }

        /* Tablets (769px - 1024px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          .event-details-container {
            padding: 24px 32px;
          }

          .desktop-view-only {
            display: block;
          }

          .mobile-view-only {
            display: none;
          }

          .event-details-container-inner {
            width: 100%;
            margin: 0 auto;
          }

          .sale-ended-banner {
            padding: 28px;
            margin-bottom: 20px;
          }

          .sale-ended-title {
            font-size: var(--heading-h3);
            margin-bottom: 18px;
          }

          .explore-events-btn {
            padding: 14px 28px !important;
            font-size: var(--small-font) !important;
          }

          .breadcrumb {
            font-size: var(--extraSmall-font);
            margin-bottom: 20px;
          }

          .breadcrumb-container {
            gap: 0px;
          }

          .breadcrumb-separator {
            margin: 0 6px;
          }

          .hero-image-container {
            margin-bottom: 24px;
          }

          .hero-image {
            height: 300px;
          }

          .slide-container {
            height: 300px;
          }

          .swiper-pagination {
            bottom: 18px;
          }

          .swiper-pagination-bullet {
            width: 14px;
            height: 14px;
            margin: 0 7px;
          }

          .tags-title-tickets-container {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0px;
          }

          .left-section {
            flex: 1;
            margin-right: 24px;
          }

          .tags-wrapper {
            gap: 10px;
            margin-bottom: 14px;
          }

          .tag {
            font-size: 13px;
            padding: 8px 10px;
          }

          .event-title {
            font-size: var(--heading-h3);
            margin: 0;
          }

          .right-section {
            flex-shrink: 0;
            display: flex;
            justify-content: flex-end;
          }

          .price-box {
            min-width: 240px;
            max-width: 280px;
            padding: 20px 24px;
          }

          .price-range {
            font-size: var(--description-font);
          }

          .get-tickets-btn {
            font-size: var(--small-font) !important;
            padding: 12px 0 !important;
          }

          .main-content {
            gap: 24px;
          }

          .content-card {
            border-radius: 16px;
          }

          .card-title {
            font-size: var(--description-font);
            margin-bottom: 18px;
          }

          .description-text {
            font-size: var(--small-font);
            margin-bottom: 18px;
          }

          .info-text {
            font-size: var(--description-font);
          }

          .info-item {
            gap: 0px;
          }

          .location-container {
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }

          .map-image {
            height: 240px;
            border-radius: 12px;
          }

          .info-section {
            gap: 18px;
          }

          .info-label {
            font-size: var(--small-font);
          }

          .info-value {
            font-size: var(--small-font);
          }

          .organizer-card {
            padding: 22px;
            border-radius: 16px;
          }

          .organizer-info-main {
            gap: 12px;
          }

          .organizer-name {
            font-size: var(--description-font);
          }

          .organizer-contact-info {
            gap: 12px;
          }

          .contact-link {
            font-size: var(--small-font);
          }

          .get-directions-btn {
            font-size: var(--small-font);
          }
          .organizer-address-text {
            font-size: var(--small-font);
          }
          .desktop-only {
            display: block;
          }
        }

        /* Desktop (1025px - 1440px) */
        @media (min-width: 1025px) and (max-width: 1440px) {
          .event-details-container {
            padding: 32px 40px;
          }

          .desktop-only {
            display: block;
          }

          .desktop-view-only {
            display: block;
          }

          .mobile-view-only {
            display: none;
          }

          .event-details-container-inner {
            width: 100%;
            margin: 0 auto;
          }

          .sale-ended-banner {
            padding: 32px;
            margin-bottom: 24px;
          }

          .sale-ended-title {
            font-size: var(--heading-h3);
            margin-bottom: 20px;
          }

          .explore-events-btn {
            padding: 16px 32px !important;
            font-size: var(--small-font) !important;
          }

          .breadcrumb {
            font-size: var(--small-font);
            margin-bottom: 24px;
          }

          .breadcrumb-container {
            gap: 0px;
          }

          .breadcrumb-separator {
            margin: 0 8px;
          }

          .hero-image-container {
            margin-bottom: 28px;
          }

          .hero-image {
            height: 400px;
          }

          .slide-container {
            height: 400px;
          }

          .swiper-pagination {
            bottom: 20px;
          }

          .swiper-pagination-bullet {
            width: 16px;
            height: 16px;
            margin: 0 8px;
          }

          .tags-title-tickets-container {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0px;
          }

          .left-section {
            flex: 1;
            margin-right: 32px;
          }

          .tags-wrapper {
            gap: 12px;
            margin-bottom: 16px;
          }

          .tag {
            font-size: var(--small-font);
            padding: 8px 10px;
          }

          .event-title {
            font-size: var(--heading-h1);
            margin: 0;
          }

          .right-section {
            flex-shrink: 0;
            display: flex;
            justify-content: flex-end;
          }

          .price-box {
            min-width: 280px;
            max-width: 320px;
            padding: 20px 24px;
          }

          .price-range {
            font-size: var(--description-font);
          }

          .get-tickets-btn {
            font-size: var(--small-font) !important;
            padding: 8px 0 !important;
          }

          .main-content {
            gap: 28px;
          }

          .content-card {
            border-radius: 20px;
            width: 70%;
          }

          .card-title {
            font-size: var(--heading-h2);
            margin-bottom: 20px;
          }

          .description-text {
            font-size: var(--small-font);
            margin-bottom: 20px;
          }

          .info-text {
            font-size: var(--small-font);
          }

          .info-item {
            gap: 0px;
          }

          .location-container {
            grid-template-columns: 1fr 1fr;
            gap: 28px;
          }

          .map-image {
            height: 280px;
            border-radius: 16px;
          }

          .info-section {
            gap: 20px;
          }

          .info-label {
            font-size: var(--small-font);
          }

          .info-value {
            font-size: var(--small-font);
          }

          .organizer-card {
            padding: 24px;
            border-radius: 20px;
          }

          .organizer-info-main {
            gap: 14px;
          }

          .organizer-name {
            font-size: var(--description-font);
          }

          .organizer-contact-info {
            gap: 14px;
          }

          .contact-link {
            font-size: var(--small-font);
          }

          .get-directions-btn {
            font-size: var(--small-font);
          }
          .organizer-address-text {
            font-size: var(--description-font);
          }
        }

        /* Large Desktop (1441px and above) */
        @media (min-width: 1441px) {
          .event-details-container {
            padding: 40px 48px;
          }

          .desktop-only {
            display: block;
          }

          .desktop-view-only {
            display: block;
          }

          .mobile-view-only {
            display: none;
          }

          .event-details-container-inner {
            width: 100%;
            margin: 0 auto;
          }

          .sale-ended-banner {
            padding: 36px;
            margin-bottom: 28px;
          }

          .sale-ended-title {
            font-size: var(--heading-h3);
            margin-bottom: 24px;
          }

          .explore-events-btn {
            padding: 18px 36px !important;
            font-size: var(--small-font) !important;
          }

          .breadcrumb {
            font-size: var(--small-font);
            margin-bottom: 28px;
          }

          .breadcrumb-container {
            gap: 0px;
          }

          .breadcrumb-separator {
            margin: 0 10px;
          }

          .hero-image-container {
            margin-bottom: 32px;
          }

          .hero-image {
            height: 500px;
          }

          .slide-container {
            height: 500px;
          }

          .swiper-pagination {
            bottom: 25px;
          }

          .swiper-pagination-bullet {
            width: 18px;
            height: 18px;
            margin: 0 9px;
          }

          .tags-title-tickets-container {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0px;
          }

          .left-section {
            flex: 1;
            margin-right: 40px;
          }

          .tags-wrapper {
            gap: 14px;
            margin-bottom: 18px;
          }

          .tag {
            font-size: 15px;
            padding: 10px 12px;
          }

          .event-title {
            font-size: var(--heading-h1);
            margin: 0;
          }

          .right-section {
            flex-shrink: 0;
            display: flex;
            justify-content: flex-end;
          }

          .price-box {
            min-width: 320px;
            max-width: 360px;
            padding: 32px 36px;
          }

          .price-range {
            font-size: var(--heading-h3);
          }

          .get-tickets-btn {
            font-size: var(--small-font) !important;
            padding: 16px 0 !important;
          }

          .main-content {
            gap: 32px;
          }

          .content-card {
            border-radius: 24px;
          }

          .card-title {
            font-size: var(--heading-h3);
            margin-bottom: 24px;
          }

          .description-text {
            font-size: var(--small-font);
            margin-bottom: 24px;
          }

          .info-text {
            font-size: var(--small-font);
          }

          .info-item {
            gap: 0px;
          }

          .location-container {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }

          .map-image {
            height: 320px;
            border-radius: 20px;
          }

          .info-section {
            gap: 24px;
          }

          .info-label {
            font-size: var(--small-font);
          }

          .info-value {
            font-size: var(--small-font);
          }

          .organizer-card {
            padding: 28px;
            border-radius: 24px;
          }

          .organizer-info-main {
            gap: 16px;
          }

          .organizer-name {
            font-size: var(--heading-h3);
          }

          .organizer-contact-info {
            gap: 16px;
          }

          .contact-link {
            font-size: var(--small-font);
          }
        }

        /* Landscape orientation adjustments for mobile */
        @media (max-width: 768px) and (orientation: landscape) {
          .hero-image {
            height: 200px;
          }

          .slide-container {
            height: 200px;
          }

          .event-details-container-inner {
            width: 100%;
            margin: 0 auto;
          }

          .tags-title-tickets-container {
            flex-direction: row;
            align-items: flex-start;
          }

          .left-section {
            flex: 1;
            margin-right: 16px;
          }

          .event-title {
            font-size: var(--description-font);
            margin: 0;
          }

          .right-section {
            display: flex;
            justify-content: flex-end;
          }

          .price-box {
            min-width: 180px;
            max-width: 200px;
          }

          .location-container {
            grid-template-columns: 1fr 1fr;
          }

          .organizer-card {
            flex-direction: column;
            align-items: flex-start;
          }
        }

      `}</style>
    </div>
  );
};

export default EventDetailsPage;