import React, { FC, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";
import { getTenantConfig } from '@config/tenant.config';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnail?: string;
  type: string;
  className?: string;
  isActive?: boolean;
  index?: number;
}

const VideoPlayer: FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnail,
  type,
  className = "",
  isActive = false,
//   index = 0
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<'low' | 'medium' | 'high'>('low');
  
  // Track preloaded videos for cleanup
  const preloadedVideosRef = useRef<HTMLVideoElement[]>([]);

  // Cleanup preloaded videos on unmount
  useEffect(() => {
    return () => {
      // Clean up any preloaded video elements
      preloadedVideosRef.current.forEach(video => {
        if (video.parentNode) {
          video.parentNode.removeChild(video);
        }
      });
      preloadedVideosRef.current = [];
    };
  }, []);

  // Memoize tenant config to avoid calling on every render
  const tenantConfig = useMemo(() => getTenantConfig(), []);

  // Use original video URL directly for reliable loading
  const videoUrls = useMemo(() => {
    // If URL is already a full URL, use it as is
    if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
      return {
        low: videoUrl,
        medium: videoUrl,
        high: videoUrl,
        original: videoUrl
      };
    }

    // Normalize the path: ensure it starts with '/'
    const cleanVideoUrl = videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`;
    
    // Build the final URL
    const cleanUrl = `${tenantConfig?.videoBaseUrl}${cleanVideoUrl}`;
    
    return {
      low: cleanUrl,
      medium: cleanUrl,
      high: cleanUrl,
      original: cleanUrl
    };
  }, [videoUrl, tenantConfig?.videoBaseUrl]);

  // Memoized event handlers to prevent recreation
  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    // Since we're using same URL, no need for quality upgrades
  }, []);

  const handleError = useCallback(() => {

    setError(true);
    setIsLoading(false);
  }, []);

  const handleLoadStart = useCallback(() => setIsLoading(true), []);
  const handleLoadedData = useCallback(() => setIsLoading(false), []);

  // Load video when active - simplified approach
  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    const video = videoRef.current;
    setIsLoading(true);
    setError(false);

    // Use original URL directly
    video.src = videoUrls.original;
    video.load();

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [isActive, videoUrls, handleCanPlay, handleError, handleLoadStart, handleLoadedData]);

  // Removed preloading for simplicity and reliability

  // Further reduced poster quality for faster loading
  const optimizedPoster = useMemo(() => {
    return thumbnail 
      ? generateImageBase64FromUrl({
          url: thumbnail,
          width: 150,
          height: 150,
          quality: 30,
        })?.fullEncodedUrl || ""
      : "";
  }, [thumbnail]);

  // Retry function
  const handleRetry = useCallback(() => {
    setError(false);
    setCurrentQuality('low');
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

    return (
    <div className={`relative overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={optimizedPoster}
        controls
        controlsList="nodownload noremoteplayback"
        preload={isActive ? "auto" : "metadata"}
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 'inherit'
        }}
        onClick={(e) => e.stopPropagation()}
            >
        <source src={videoUrls.original} type={type} />
        Your browser does not support the video tag.
      </video>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="text-white text-sm">
              Loading...
            </span>
          </div>
        </div>
      )}

      {/* Quality indicator */}
      {!isLoading && !error && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
          {currentQuality.toUpperCase()}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-20 rounded-lg">
          <div className="text-white text-center">
            <div className="text-lg mb-2">⚠️</div>
            <div className="text-sm">Video failed to load</div>
                         <button 
               className="mt-2 px-3 py-1 bg-white text-black rounded text-xs"
               onClick={handleRetry}
             >
               Retry
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer; 