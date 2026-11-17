"use client";

import React, { useState, useEffect } from "react";
import { MeetOurTeamSectionProps, TeamMember } from "./fields";
import dynamic from "next/dynamic";
import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";
import SliderNavigation from "@components/ui/SliderNavigation";
import useSwiperNavigation from "@hooks/useSwiperNavigation";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import useIsMobile from "@hooks/useIsMobile";
import Link from "next/link";

const FacebookIcon = dynamic(() => import("@components/icons/FacebookIcon"));
const InstagramIcon = dynamic(() => import("@components/icons/InstagramIcon"));
const XIcon = dynamic(() => import("@components/icons/XIcon"));
const LinkedInIcon = dynamic(() => import("@components/icons/LinkedinIcon"));
const TiktokIcon = dynamic(() => import("@components/icons/TiktokIcon"));

interface MeetOurTeamSectionWithResolvedData extends MeetOurTeamSectionProps {
  resolvedData?: {
    teamMembers: Array<{
      id: string;
      name: string;
      designation: string;
      image: string;
      socialUrl?: {
        facebookUrl?: string;
        twitterUrl?: string;
        linkedinUrl?: string;
        instagramUrl?: string;
        [key: string]: string | undefined;
      };
    }>;
    loading: boolean;
    error: string | null;
    totalCount: number;
  };
}

export const MeetOurTeamSection = (props: MeetOurTeamSectionWithResolvedData & Record<string, any>) => {
  const {
    basicContent = {
      title: "Meet Our Team",
      subtitle: "The passionate people behind your exceptional dining experience"
    },
    styling = {},
    advanceSettings = {
      teamMembers: [],
      loading: false,
      error: null,
      totalCount: 0,
      showSocialLinks: true
    },
    resolvedData
  } = props;

  // Layout, Spacing, Typography, Card
  const layout = styling.layout || {};
  const spacing = styling.spacing || {};
  const typography = styling.typography || {};
  const card = styling.card || {};

  // Mobile overrides
  const layoutMobile = layout.mobile || {};
  const spacingMobile = spacing.mobile || {};
  const titleMobile = typography.title?.mobile || {};
  const subtitleMobile = typography.subtitle?.mobile || {};
  const cardTitleMobile = card.title?.mobile || {};
  const cardDesignationMobile = card.designation?.mobile || {};

  const { title, subtitle } = basicContent;
  
  // Use resolvedData if available, otherwise fall back to advanceSettings
  const teamData = resolvedData || advanceSettings;
  const { teamMembers, loading, error } = teamData;
  const showSocialLinks = String(advanceSettings.showSocialLinks) === "true" || advanceSettings.showSocialLinks === true || advanceSettings.showSocialLinks === undefined;
  
  // Limit team members based on maxTeamMembers setting
  const displayTeamMembers = teamMembers?.slice(0, teamMembers?.length) || [];
  
  // State to track current breakpoint and slides per view
  const [currentSlidesPerView, setCurrentSlidesPerView] = useState(3);
  const [showNavigation, setShowNavigation] = useState(false);

  // Use the navigation hook for slider functionality
  const { swiperRef, onPrevClick, onNextClick, isBeginning, isEnd } = useSwiperNavigation();
 
  // Check if the screen is mobile
  const isMobile = useIsMobile();
  
  // Ensure isMobile is safely handled
  const isMobileSafe = typeof isMobile === 'boolean' ? isMobile : false;
  
  // Don't render the section if:
  // 1. No resolvedData (API returned empty or 204)
  // 2. Team members array is empty
  // 3. Loading is false and we have no data
  const shouldHideSection = !resolvedData || 
    !teamMembers || 
    teamMembers.length === 0 || 
    displayTeamMembers.length === 0;

  // Ensure Swiper initializes properly on page load
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const swiper = swiperRef.current?.swiper;
    if (swiper && swiper.el && swiper.el.offsetWidth) {
      // Force Swiper to update its dimensions and layout
      setTimeout(() => {
        try {
          if (swiper.el && swiper.el.offsetWidth) {
            swiper.update();
            swiper.updateSize();
            swiper.updateSlides();
          }
        } catch {

        }
      }, 100);
    }
  }, [displayTeamMembers?.length]);

  // Update slides per view and navigation visibility based on screen size
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const updateSlidesPerView = () => {
      const width = window?.innerWidth || 0;
      let slidesPerView = 3; // default

      if (width < 640) {
        slidesPerView = 1;
      } else if (width < 1024) {
        slidesPerView = 3;
      } else {
        slidesPerView = 4;
      }

      setCurrentSlidesPerView(slidesPerView);
      setShowNavigation(Boolean(displayTeamMembers && displayTeamMembers.length > slidesPerView));
    };

    updateSlidesPerView();
    window.addEventListener('resize', updateSlidesPerView);
    
    return () => window.removeEventListener('resize', updateSlidesPerView);
  }, [displayTeamMembers]);

  // Early return after all hooks - don't render if no data
  if (shouldHideSection) {
    return <></>;
  }

  return (
    <section className="meetOurTeamSection container">
      <div className="meetOurTeamContainer">
        <div className="meetOurTeamHeader">
          <h2 className="meetOurTeamTitle">{title}</h2>
          <h3 className="meetOurTeamSubtitle">{subtitle}</h3>
        </div>
        
        {loading ? (
          <div className="loadingState">Loading team members...</div>
        ) : error ? (
          <div className="errorState">Error: {error}</div>
        ) : displayTeamMembers && displayTeamMembers.length > 0 ? (
          <div className="teamSliderContainer">
            <Swiper
              ref={swiperRef}
              modules={[Navigation, Pagination, Autoplay]}
              slidesPerView={currentSlidesPerView}
              spaceBetween={isMobileSafe ? 8 : 24}
              breakpoints={{
                320: { slidesPerView: 1.125, spaceBetween: 8 },
                640: { slidesPerView: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 24 },
              }}
              autoplay={false}
              loop={true}
              className="teamSwiper"
              onSwiper={(swiper) => {
                // Ensure swiper is properly initialized
                if (swiper && swiper.el) {
                  setTimeout(() => {
                    try {
                      swiper.update();
                    } catch {

                    }
                  }, 50);
                }
              }}
            >
              {displayTeamMembers.map((member: TeamMember) => (
                <SwiperSlide key={member.id}>
                  <div className="teamCard">
                    <img
                      fetchPriority="high"
                      src={
                        generateImageBase64FromUrl({
                          url: member.image || "",
                          width: 800,
                          height: 800,
                          quality: 100,
                        })?.fullEncodedUrl
                      }
                      alt={member?.name}
                      title={member?.name}
                      className="teamImage cursor-pointer w-full"
                    />
                    <div className="teamCardContent p-3 md:px-5 md:py-6 flex flex-col gap-3">
                      <div className="teamCardName ">{member?.name}</div>
                      <div className="teamCardDesignation">{member?.designation}</div>
                      {showSocialLinks && (
                        <div className="teamCardSocial min-h-[20px] flex items-center gap-2 justify-start">
                          {member?.socialUrl?.facebookUrl && (
                            <Link href={member?.socialUrl?.facebookUrl} target="_blank" rel="noopener noreferrer">
                              <FacebookIcon height={20} width={20} />
                            </Link>
                          )}
                          {member?.socialUrl?.instagramUrl && (
                            <Link href={member?.socialUrl?.instagramUrl} target="_blank" rel="noopener noreferrer">
                              <InstagramIcon height={20} width={20} />
                            </Link>
                          )}
                          {member?.socialUrl?.twitterUrl && (
                            <Link href={member?.socialUrl?.twitterUrl} target="_blank" rel="noopener noreferrer">
                              <XIcon height={20} width={20} />
                            </Link>
                          )}
                          {member?.socialUrl?.linkedinUrl && (
                            <Link href={member?.socialUrl?.linkedinUrl} target="_blank" rel="noopener noreferrer">
                              <LinkedInIcon height={20} width={20} />
                            </Link>
                          )}
                          {member?.socialUrl?.tiktokUrl && (
                            <Link className="tiktok-icon" href={member?.socialUrl?.tiktokUrl} target="_blank" rel="noopener noreferrer">
                              <TiktokIcon height={21} width={21} />
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {showNavigation && (
              <SliderNavigation
                onPrevClick={onPrevClick}
                onNextClick={onNextClick}
                disabled={isBeginning && isEnd}
                size="md"
                variant="default"
                hideOnMobile={true}
                className="teamNavigation"
              />
            )}
          </div>
        ) : (
          <div className="noTeamMembers">No team members found.</div>
        )}
      </div>
      <style>{`
        .meetOurTeamSection {
          padding: ${spacing.padding || "30px 30px"};
          background-color: ${layout.backgroundColor || "#fff"};
          margin: 0 auto;

        }
        .meetOurTeamContainer {
          margin: ${spacing.margin || "0 auto"};
        }
        .meetOurTeamHeader {
          text-align: center;
          margin-bottom: 56px;
        }
        .meetOurTeamTitle {
          font-size: ${typography.title?.fontSize || "40px"};
          font-weight: ${typography.title?.fontWeight || 700};
          color: ${typography.title?.color || "#282828"};
          line-height: ${typography.title?.lineHeight || "1.2"};
          text-align: ${typography.title?.alignment || "center"};
          margin-bottom: 24px;
          margin-top: 0;
        }
        .meetOurTeamSubtitle {
          font-size: ${typography.subtitle?.fontSize || "18px"};
          font-weight: ${typography.subtitle?.fontWeight || 400};
          color: ${typography.subtitle?.color || "#757575"};
          line-height: ${typography.subtitle?.lineHeight || "1.5"};
          text-align: ${typography.subtitle?.alignment || "center"};
          margin: 0;
        }
        .teamSliderContainer {
          position: relative;
          margin-bottom: 0;
        }
        .teamSwiper {
          overflow: hidden;
          padding-bottom: 56px;
        }
        .teamSwiper .swiper-wrapper {
          justify-content: center;
        }
        .teamNavigation {
          margin-top: 0;
          margin-bottom: 56px;
        }
        .teamCard {
          background: ${card.backgroundColor || "var(--cards-containers)"};
          border-radius: ${card.borderRadius || "10px"};
          border: 1px solid ${card.borderColor || "var(--rating-border-primary)"};
          box-shadow: ${card.boxShadow || "none"};
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          height: 100%;
          min-height: 320px;
        }
        
        .teamImage {
          width: 100%;
          aspect-ratio: 1/1;
          object-fit: cover;
          border-radius: 10px 10px 0 0;
        }
        
        .teamCardContent {
          width: 100%;
        }
        .teamCardName {
          font-weight: ${card.title?.fontWeight || 600};
          font-size: ${card.title?.fontSize || "18px"};
          color: ${card.title?.color || "#282828"};
          line-height: ${card.title?.lineHeight || "1.2"};
          text-align: ${card.title?.alignment || "left"};
        }
        .teamCardDesignation {
          color: ${card.designation?.color || "#C9A94B"};
          font-weight: ${card.designation?.fontWeight || 500};
          font-size: ${card.designation?.fontSize || "15px"};
          line-height: ${card.designation?.lineHeight || "1.2"};
          text-align: ${card.designation?.alignment || "left"};
          margin-bottom: 4px;
        }
        .teamCardExperience {
          color: #B0AFAF;
          font-size: 13px;
          margin-bottom: 8px;
        }
      
        .loadingState, .errorState, .noTeamMembers {
          text-align: center;
          padding: 48px 20px;
          color: #757575;
          font-size: 16px;
          width: 100%;
        }
        .errorState {
          color: #dc2626;
        }

        .teamSwiper .swiper-slide {
            width: calc(100% / 4.22) !important;
            margin-right: 20px !important;
          }

        .tiktok-icon {
          margin-top: 2px;
        }
        @media (max-width: 768px) {
          .meetOurTeamSection {
            padding: ${spacingMobile.padding || "24px 16px"} !important;
            background-color: ${layoutMobile.backgroundColor || layout.backgroundColor || "#fff"} !important;
             overflow: hidden !important;
            }
          .meetOurTeamContainer {
            max-width: ${layoutMobile.maxWidth || "100%"} !important;
            margin: ${spacingMobile.margin || "0 auto"} !important;
          }
          .meetOurTeamHeader {
            margin-bottom: 24px !important;
          }
          .meetOurTeamTitle {
            font-size: ${titleMobile.fontSize || "30px"} !important;
            font-weight: ${titleMobile.fontWeight || 700} !important;
            color: ${titleMobile.color || "#282828"} !important;
            line-height: ${titleMobile.lineHeight || "1.2"} !important;
            text-align: ${titleMobile.alignment || "center"} !important;
            margin-bottom: 20px !important;
          }
          .meetOurTeamSubtitle {
            font-size: ${subtitleMobile.fontSize || "16px"} !important;
            font-weight: ${subtitleMobile.fontWeight || 400} !important;
            color: ${subtitleMobile.color || "#757575"} !important;
            line-height: ${subtitleMobile.lineHeight || "1.5"} !important;
            text-align: ${subtitleMobile.alignment || "center"} !important;
            margin-bottom: 0 !important;
          }
          .teamCard {
            min-height: 340px;
          }
          .teamImage {
            height: 294px !important;
            width: 100% !important;
          }
          .teamCardName {
            font-size: ${cardTitleMobile.fontSize || "18px"} !important;
            font-weight: ${cardTitleMobile.fontWeight || 600} !important;
            color: ${cardTitleMobile.color || "#282828"} !important;
            line-height: ${cardTitleMobile.lineHeight || "1.2"} !important;
            text-align: ${cardTitleMobile.alignment || "left"} !important;
          }
          .teamCardDesignation {
            font-size: ${cardDesignationMobile.fontSize || "15px"} !important;
            font-weight: ${cardDesignationMobile.fontWeight || 500} !important;
            color: ${cardDesignationMobile.color || "#C9A94B"} !important;
            line-height: ${cardDesignationMobile.lineHeight || "1.2"} !important;
            text-align: ${cardDesignationMobile.alignment || "left"} !important;
          }
          .teamSwiper {
            margin-right: -16px !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            overflow: visible !important;
            padding-bottom: 0px !important;
          }

          .teamSwiper .swiper-slide {
            width: calc(100% / 1.125) !important;
            margin-right: 15px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default MeetOurTeamSection; 