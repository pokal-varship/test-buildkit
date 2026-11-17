import { useRef, useCallback, useState, useEffect } from 'react';
import type { SwiperRef } from 'swiper/react';

export interface UseSwiperNavigationReturn {
  swiperRef: React.RefObject<SwiperRef | null>;
  onPrevClick: () => void;
  onNextClick: () => void;
  isBeginning: boolean;
  isEnd: boolean;
}

export const useSwiperNavigation = (): UseSwiperNavigationReturn => {
  const swiperRef = useRef<SwiperRef | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(true);

  const onPrevClick = useCallback(() => {
    swiperRef.current?.swiper?.slidePrev();
  }, []);

  const onNextClick = useCallback(() => {
    swiperRef.current?.swiper?.slideNext();
  }, []);

  useEffect(() => {
    const swiper = swiperRef.current?.swiper;
    if (!swiper) return;

    const updateState = () => {
      setIsBeginning(swiper.isBeginning);
      setIsEnd(swiper.isEnd);
    };

    swiper.on('slideChange', updateState);
    swiper.on('init', updateState);
    
    // Initial state
    updateState();

    return () => {
      swiper.off('slideChange', updateState);
      swiper.off('init', updateState);
    };
  }, []);

  return {
    swiperRef,
    onPrevClick,
    onNextClick,
    isBeginning,
    isEnd,
  };
};

export default useSwiperNavigation; 