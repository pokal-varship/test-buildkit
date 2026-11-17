import ArrowLeftIcon from "@components/icons/ArrowLeft";
import CloseCircleIcon from "@components/icons/CloseCircleIcon";
import Icon from "@components/image/Icons";
import MediaTumbnail from "@components/MediaTumbnail";
import { MediaType } from "@components/type/pdp.type";
import dynamic from "next/dynamic";
const VideoPlayer = dynamic(() => import("./VideoPlayer"), { ssr: false });
import 'swiper/css/navigation';
import 'swiper/css';
import 'swiper/css/pagination';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperCore } from 'swiper'

import {
  LEFT_ARROW_ICON,
  RIGHT_ARROW_ICON,
} from "@config/Header/image.config";
import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";
import React, { FC, useState, useRef, useEffect } from "react";
import Loader from "@components/loader/Loader";
type MediaModalProps = {
  mediaItems: MediaType[];
  onClose: () => void;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  handleMediaClick?: (index: number) => void;
};
const MediaModal: FC<MediaModalProps> = ({ mediaItems, onClose, currentIndex, setCurrentIndex, handleMediaClick }) => {
  // State for pinch-to-zoom functionality
  const [scale, setScale] = useState<number>(1);
  const [positionX, setPositionX] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState<number>(1);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperCore | null>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true);

  const onMediaClick = (index: number) => {
    setCurrentIndex(index);
    swiperRef.current?.slideToLoop(index);
    handleMediaClick?.(index);
  }

  // Reset zoom when image changes
  useEffect(() => {
    resetZoom();
  }, [currentIndex]);

  // Scroll to active thumbnail when currentIndex changes
  useEffect(() => {
    if (thumbnailRefs.current[currentIndex] && thumbnailContainerRef.current) {
      const thumbnailElement = thumbnailRefs.current[currentIndex];
      if (thumbnailElement) {
        thumbnailElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [currentIndex]);

  // Reset image loading state when currentIndex or media type changes
  useEffect(() => {
    if (!mediaItems[currentIndex]?.type?.startsWith("video/")) {
      setIsImageLoading(true);
    }
  }, [currentIndex, mediaItems]);

  // Video preloading is now handled by VideoPlayer component

  const resetZoom = () => {
    setScale(1);
    setPositionX(0);
    setPositionY(0);
    setInitialDistance(null);
    setInitialScale(1);
    setLastTouchX(null);
    setLastTouchY(null);
    setLastMouseX(null);
    setLastMouseY(null);
    setIsDragging(false);
  };

  const handleNext = () => {
    const newIndex = currentIndex < mediaItems.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    swiperRef.current?.slideToLoop(newIndex);
  };

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : mediaItems.length - 1;
    setCurrentIndex(newIndex);
    swiperRef.current?.slideToLoop(newIndex); // <- this moves the swiper
  };

  // State for panning functionality
  const [lastTouchX, setLastTouchX] = useState<number | null>(null);
  const [lastTouchY, setLastTouchY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMouseX, setLastMouseX] = useState<number | null>(null);
  const [lastMouseY, setLastMouseY] = useState<number | null>(null);

  // Handle touch start event to capture initial distance for pinch or position for pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture starting
      const distance = getDistanceBetweenTouches(e);
      setInitialDistance(distance);
      setInitialScale(scale);
    } else if (e.touches.length === 1 && scale > 1) {
      // Single touch for panning (only when zoomed in)
      setLastTouchX(e.touches[0].clientX);
      setLastTouchY(e.touches[0].clientY);
    }
  };

  // Mouse events for desktop panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setLastMouseX(e.clientX);
      setLastMouseY(e.clientY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1 && lastMouseX !== null && lastMouseY !== null) {
      e.preventDefault();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Calculate the distance moved
      const deltaX = mouseX - lastMouseX;
      const deltaY = mouseY - lastMouseY;

      // Adjust panning sensitivity based on zoom level
      const panSensitivity = 1.5 / scale;

      // Calculate max pan distance based on image dimensions and zoom level
      const containerWidth = imageContainerRef.current?.clientWidth || 0;
      const containerHeight = imageContainerRef.current?.clientHeight || 0;
      const maxPanX = (scale - 1) * (containerWidth / 2);
      const maxPanY = (scale - 1) * (containerHeight / 2);

      // Update position with constraints to prevent excessive panning
      setPositionX(prev => Math.max(-maxPanX, Math.min(maxPanX, prev + deltaX * panSensitivity)));
      setPositionY(prev => Math.max(-maxPanY, Math.min(maxPanY, prev + deltaY * panSensitivity)));

      // Update last mouse position
      setLastMouseX(mouseX);
      setLastMouseY(mouseY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setLastMouseX(null);
    setLastMouseY(null);
  };

  // Handle touch move event for pinch zoom or panning
  const handleTouchMove = (e: React.TouchEvent) => {
    if (initialDistance && e.touches.length === 2) {
      // Pinch zooming
      e.preventDefault(); // Prevent default behavior like page scrolling
      const currentDistance = getDistanceBetweenTouches(e);
      const pinchSensitivity = 0.01; // Adjust sensitivity here (lower = less sensitive)

      // Calculate new scale based on the change in distance between fingers
      const scaleFactor = 1 + ((currentDistance - initialDistance) * pinchSensitivity);
      const newScale = Math.max(1, Math.min(5, initialScale * scaleFactor)); // Limit zoom between 1x and 5x

      setScale(newScale);
    } else if (e.touches.length === 1 && scale > 1 && lastTouchX !== null && lastTouchY !== null) {
      // Panning (only when zoomed in)
      e.preventDefault();
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;

      // Calculate the distance moved
      const deltaX = touchX - lastTouchX;
      const deltaY = touchY - lastTouchY;

      // Adjust panning sensitivity based on zoom level
      const panSensitivity = 1.5 / scale;

      // Calculate max pan distance based on image dimensions and zoom level
      const containerWidth = imageContainerRef.current?.clientWidth || 0;
      const containerHeight = imageContainerRef.current?.clientHeight || 0;
      const maxPanX = (scale - 1) * (containerWidth / 2);
      const maxPanY = (scale - 1) * (containerHeight / 2);

      // Update position with constraints to prevent excessive panning
      setPositionX(prev => Math.max(-maxPanX, Math.min(maxPanX, prev + deltaX * panSensitivity)));
      setPositionY(prev => Math.max(-maxPanY, Math.min(maxPanY, prev + deltaY * panSensitivity)));

      // Update last touch position
      setLastTouchX(touchX);
      setLastTouchY(touchY);
    }
  };

  // Handle touch end event to reset initial distance and touch positions
  const handleTouchEnd = () => {
    setInitialDistance(null);
    setLastTouchX(null);
    setLastTouchY(null);

    // If scale is close to 1, snap back to 1
    if (scale < 1.1) {
      resetZoom();
    }
  };

  // Calculate distance between two touch points
  const getDistanceBetweenTouches = (e: React.TouchEvent) => {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    return Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  };

  // Handle double tap to reset zoom
  const handleDoubleTap = () => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2); // Zoom to 2x on double tap when not zoomed
    }
  };

  // Handle keyboard navigation for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (scale <= 1) return; // Only handle keyboard when zoomed in

      const panStep = 20 / scale; // Adjust step size based on zoom level

      // Calculate max pan distance based on image dimensions and zoom level
      const containerWidth = imageContainerRef.current?.clientWidth || 0;
      const containerHeight = imageContainerRef.current?.clientHeight || 0;
      const maxPanX = (scale - 1) * (containerWidth / 2);
      const maxPanY = (scale - 1) * (containerHeight / 2);

      switch (e.key) {
        case 'ArrowLeft':
          setPositionX(prev => Math.max(-maxPanX, Math.min(maxPanX, prev - panStep)));
          e.preventDefault();
          break;
        case 'ArrowRight':
          setPositionX(prev => Math.max(-maxPanX, Math.min(maxPanX, prev + panStep)));
          e.preventDefault();
          break;
        case 'ArrowUp':
          setPositionY(prev => Math.max(-maxPanY, Math.min(maxPanY, prev - panStep)));
          e.preventDefault();
          break;
        case 'ArrowDown':
          setPositionY(prev => Math.max(-maxPanY, Math.min(maxPanY, prev + panStep)));
          e.preventDefault();
          break;
        case 'Escape':
          resetZoom();
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [scale]); // Re-add event listener when scale changes

  return (
    <div className="fixed inset-0 bg-[var(--black)] bg-opacity-75 z-50 flex items-center justify-center h-screen w-screen">
      <div className="relative w-full max-w-4xl h-screen md:h-[90vh] px-4 md:px-14 py-24 bg-[var(--primary-background)] md:rounded-lg">
        <CloseCircleIcon
          width={30}
          height={30}
          className="cursor-pointer absolute top-5 right-5 z-10"
          onClick={onClose}
        />

        <div className="relative h-[80%] w-full">
          {/* Mobile Navigation Arrows - Left */}
          {mediaItems?.length > 1 && (
            <button
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 md:hidden cursor-pointer bg-transparent border-none p-2"
              aria-label="Previous image"
            >
              <Icon
                icon= {`${LEFT_ARROW_ICON}#left-arrow` }
                width={30}
                height={30}
                viewBox="0 0 30 30"
                className="cursor-pointer"
                color="var(--primary-background)"
              />
            </button>
          )}

          {/* Mobile Navigation Arrows - Right */}
          {mediaItems?.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 md:hidden cursor-pointer bg-transparent border-none p-2"
              aria-label="Next image"
            >
              <Icon
                icon= {`${RIGHT_ARROW_ICON}#right-arrow` }
                width={30}
                height={30}
                viewBox="0 0 30 30"
                className="cursor-pointer"
                color="var(--primary-background)"
              />
            </button>
          )}

          <Swiper
            modules={[Navigation, Pagination]}
            slidesPerView={1}
            spaceBetween={10}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              swiper.slideToLoop(currentIndex); // optional, to sync on init
            }}
            initialSlide={currentIndex}
            onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
            className="h-full w-full"
          >
            {mediaItems.map((item, index) => {
              // console.log(item,"item")
              return (
              <SwiperSlide key={index}>
                <div className="relative h-full w-full" ref={currentIndex === index ? imageContainerRef : null}>
               
                    {item.type?.startsWith("video") ? (
                      <VideoPlayer
                        videoUrl={item.url || item.media || ""}
                        thumbnail={item.thumbnail}
                        type={item.type}
                        className="w-full h-full"
                        isActive={currentIndex === index}
                        index={index}
                      />
                  ) : (
                    <div
                      className="w-full h-full overflow-hidden"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onDoubleClick={handleDoubleTap}
                    >
                      {currentIndex === index && isImageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <Loader size={48} type="spinner" />
                        </div>
                      )}
                      <img
                        fetchPriority="high"
                        src={
                          generateImageBase64FromUrl({
                            url: item?.url || "",
                            width: 800,
                            height: 800,
                            quality: 100,
                          })?.fullEncodedUrl
                        }
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-contain transition-transform duration-200 ease-out"
                        style={{
                          transform: `scale(${currentIndex === index ? scale : 1}) translate(${currentIndex === index ? positionX : 0}px, ${currentIndex === index ? positionY : 0}px)`,
                          transformOrigin: 'center',
                          touchAction: 'none',
                          cursor: isDragging && scale > 1 ? 'grabbing' : (scale > 1 ? 'grab' : 'default')
                        }}
                        onLoad={() => setIsImageLoading(false)}
                        onError={() => setIsImageLoading(false)}
                      />
                      {currentIndex === index && scale > 1 && (
                        <>
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="text-[var(--white)] bg-[var(--black)] bg-opacity-50 px-3 py-1 rounded-md small-font animate-fade-out hidden md:block">
                              Use arrows or mouse to pan image
                            </div>
                            <div className="text-[var(--white)] bg-[var(--black)] bg-opacity-50 px-3 py-1 rounded-md small-font animate-fade-out block md:hidden">
                              Use touch to pan image
                            </div>
                          </div>
                          <button
                            onClick={resetZoom}
                            className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md small-font"
                          >
                            Reset Zoom
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* Thumbnails Section */}
        <div className="flex justify-between items-center gap-4 mt-20 md:mt-12">
          {/* Desktop Navigation Arrows - Left */}
          {mediaItems?.length > 1 && (
            <ArrowLeftIcon 
              className="cursor-pointer hidden md:block" 
              onClick={handlePrevious} 
            />
          )}
          
          <div 
            ref={thumbnailContainerRef}
            className="flex gap-4 w-full overflow-x-auto hide-scrollbar justify-start md:justify-center"
          >
            {mediaItems.map((item, idx) => (
              <div
                key={idx}
                ref={(el) => {
                  thumbnailRefs.current[idx] = el;
                }}
              >
                <MediaTumbnail
                  onClick={() => onMediaClick(idx)}
                  containerClassName="min-w-[80px] h-[80px] max-w-[80px] max-h-[80px] rounded-md overflow-hidden"
                  isActive={currentIndex === idx}
                  showActiveBorder={true}
                  showTotalCount={false}
                  media={item}
                  index={idx}
                />
              </div>
            ))}
          </div>
          
          {/* Desktop Navigation Arrows - Right */}
          {mediaItems?.length > 1 && (
            <ArrowLeftIcon 
              className="cursor-pointer rotate-180 hidden md:block" 
              onClick={handleNext} 
            />
          )}
        </div>
      </div>
      <style>
        {`
        .small-font{
          font-size: var(--small-font);
        }
           @keyframes fadeOut {
                0% { opacity: 1; }
                70% { opacity: 1; }
                100% { opacity: 0; }
            }
            .animate-fade-out {
              animation: fadeOut 3s forwards;
            }
      `}
      </style>
    </div>
  );
};

export default MediaModal;
