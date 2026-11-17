import { useEffect, useRef } from 'react';
 
const useDisableBodyScroll = (isOpen: boolean) => {
  const scrollPositionRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      scrollPositionRef.current = window.scrollY;
      
      // Lock scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Unlock scroll and restore position
      const scrollY = scrollPositionRef.current;
      
      // Restore body styles
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      // Restore scroll position
      if (scrollY > 0) {
        // Use requestAnimationFrame to ensure styles are cleared before scrolling
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollY);
        });
      }
    }

    // Cleanup on unmount - only restore if dialog was open
    return () => {
      if (isOpen) {
        const scrollY = scrollPositionRef.current;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        
        if (scrollY > 0) {
          requestAnimationFrame(() => {
            window.scrollTo(0, scrollY);
          });
        }
      }
    };
  }, [isOpen]);
};
 
export default useDisableBodyScroll;