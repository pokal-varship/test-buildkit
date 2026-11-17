import { useEffect } from "react";

// Function to return image URL as is (no conversion)
export const convertToWebP = (imageUrl: string): string => {
    if (!imageUrl) return imageUrl;
    
    // Return the original URL without any conversion
    return imageUrl;
  };

  export const getOptimizedImageUrl = (
    imageUrl: string, 
    isMobile: boolean = false, 
    mobileWidth: number = 480, 
    mobileHeight: number = 216
  ): string => {
    if (!imageUrl) return imageUrl;
    
    // Return original URL without conversion
    let optimizedUrl = imageUrl;
    
    // Apply mobile optimization if needed
    if (isMobile) {
      // For Cloudinary URLs
      if (optimizedUrl.includes('cloudinary.com')) {
        optimizedUrl = optimizedUrl.replace(
          /\/c_crop,w_\d+,h_\d+\//,
          `/c_fill,w_${mobileWidth},h_${mobileHeight},q_85,f_auto/`
        );
      }
      // For other CDNs, add mobile-specific parameters
      else {
        try {
          const url = new URL(optimizedUrl);
          url.searchParams.set('w', mobileWidth.toString());
          url.searchParams.set('h', mobileHeight.toString());
          url.searchParams.set('q', '85');
          optimizedUrl = url.toString();
        } catch {
          // If URL parsing fails, return original URL
          return optimizedUrl;
        }
      }
    }
    
    return optimizedUrl;
  };

  // Custom hook for image preloading 
  // Custom hook for image preloading
export const useImagePreload = (imageUrl: string) => {
  useEffect(() => {
    if (imageUrl) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageUrl;
      link.setAttribute('fetchPriority', 'high');
      document.head.appendChild(link);

      // Cleanup function to remove the preload link
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [imageUrl]);
};

  


  // Function to generate responsive image URLs
  // export const generateResponsiveUrls = (baseUrl: string) => {
  //   if (!baseUrl) return { src: baseUrl, srcSet: '', sizes: '' };
    
  //   try {
  //     const url = new URL(baseUrl);
  //     const originalWidth = url.searchParams.get('w') || '1200';
      
  //     // Generate different sizes for responsive loading
  //     const sizes = [
  //       { width: 480, suffix: '480w' },
  //       { width: 768, suffix: '768w' },
  //       { width: 1024, suffix: '1024w' },
  //       { width: 1440, suffix: '1440w' },
  //       { width: 1920, suffix: '1920w' },
  //       { width: 2560, suffix: '2560w' },
  //       { width: 3840, suffix: '3840w' },
  //       { width: 4096, suffix: '4096w' },
  //     ];
      
  //     const srcSet = sizes.map(size => {
  //       const responsiveUrl = new URL(baseUrl);
  //       responsiveUrl.searchParams.set('w', size.width.toString());
  //       return `${responsiveUrl.toString()} ${size.suffix}`;
  //     }).join(', ');
      
  //     return {
  //       src: baseUrl,
  //       srcSet,
  //       sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px'
  //     };
  //   } catch {
  //     // Fallback if URL parsing fails
  //     return { src: baseUrl, srcSet: '', sizes: '' };
  //   }
  // };