'use client';
import React, { useState, useEffect, useRef } from 'react';
import Slider from '@mui/material/Slider';
import useLang from '@hooks/useLang';
import { LanguageCode, TranslationKeys } from 'types';
import { FilterDrawer } from './FilterDrawer';
import { FILTER_ICON, FILTER_ICON_WHITE } from '@config/Header/image.config';
import { useTheme } from 'context/ThemeProvider';
import { DiscountOffer } from '@services/typesense';
import { ToggleView } from './ToggleView';
import { useAnalytics } from '@hooks/useAnalytics';
import { useSelector } from 'react-redux';
import { selectIsQrFlowActive } from '@redux/slices/qrFlowSlice';
import { DINE_IN_ANALYTICS_CONTEXT } from '@lib/analytics/dineInAnalytics';
import { getTenantConfig } from '@config/tenant.config';

export interface SortBarFilters {
  dietaryRestrictions: string[];
  calorieRange: [number, number];
  vegetarianFilter: string; // 'veg', 'non-veg', or ''
  offer?: string[];
}

interface SortBarProps {
  onFilterChange?: (filters: SortBarFilters) => void;
  currentFilters?: SortBarFilters;
  facets?: DiscountOffer[];
  productsCount?: number;
}

// export const SortBar: React.FC<SortBarProps> = ({ onFilterChange, currentFilters, facets }) => {
export const SortBar: React.FC<SortBarProps> = ({ onFilterChange, currentFilters, facets}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const { theme } = useTheme();
  const [calorieSlider, setCalorieSlider] = useState<boolean>(false);
  const [allergensPopUp, setAllergensPopUp] = useState<boolean>(false);
  const [offerPopUp, setOffersPopUp] = useState<boolean>(false);
  const [calorieFilterType, setCalorieFilterType] = useState<'all' | 'range'>(currentFilters?.calorieRange[0] === 10 && currentFilters?.calorieRange[1] === 900 ? 'all' : 'range');
  /** Local range so the MUI range Slider updates while dragging; parent still receives debounced updates */
  const [localCalorieRange, setLocalCalorieRange] = useState<[number, number]>(() =>
    currentFilters?.calorieRange ?? [10, 900]
  );
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  const offerFacets = facets;
  
  const calorieSliderRef = React.useRef<HTMLDivElement>(null);
  const allergensRef = React.useRef<HTMLDivElement>(null);
  const offersRef = React.useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { trackFilterApplied } = useAnalytics();
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const dineInTrackExtra = isQrFlowActive ? DINE_IN_ANALYTICS_CONTEXT : undefined;
  const { showOfferFilter, showCaloriesInfo, showDietaryRestrictions, showContainsMeat } = getTenantConfig();
  const showOffers = showOfferFilter && !!offerFacets?.length;
  const hasAvailableFilters =
    showDietaryRestrictions || showCaloriesInfo || showContainsMeat || showOffers;

  // Check if filters are in their initial state
  const isFiltersInInitialState = () => {
    const initialState = {
      dietaryRestrictions: [],
      calorieRange: [10, 900] as [number, number],
      vegetarianFilter: 'non-veg',
      offer: []
    };

    return (
      (currentFilters?.dietaryRestrictions?.length || 0) === 0 &&
      currentFilters?.calorieRange?.[0] === initialState.calorieRange[0] &&
      currentFilters?.calorieRange?.[1] === initialState.calorieRange[1] &&
      currentFilters?.vegetarianFilter === initialState.vegetarianFilter &&
      (currentFilters?.offer?.length || 0) === 0
    );
  };

  // Count applied filters
  const getAppliedFiltersCount = () => {
    let count = 0;
    
    // Count dietary restrictions (only when dietary filter is enabled)
    if (showDietaryRestrictions && currentFilters?.dietaryRestrictions?.length) {
      count += 1;
    }
    
    // Count calorie range if not default
    if (currentFilters?.calorieRange && 
        (currentFilters.calorieRange[0] !== 10 || currentFilters.calorieRange[1] !== 900)) {
      count += 1;
    }
    
    // Count vegetarian filter if not default (only when contains meat filter is enabled)
    if (showContainsMeat && currentFilters?.vegetarianFilter && currentFilters.vegetarianFilter !== 'non-veg') {
      count += 1;
    }
    
    // Count offers (only when offer filter is enabled)
    if (showOfferFilter && currentFilters?.offer?.length) {
      count += 1;
    }
    
    return count;
  };

  const filtersApplied = !isFiltersInInitialState();
  const appliedFiltersCount = getAppliedFiltersCount();

  const handleClearAll = () => {
    
    if (onFilterChange) {
      onFilterChange({
        dietaryRestrictions: [],
        calorieRange: [10, 900],
        vegetarianFilter: 'non-veg',
        offer: []
      });
    }
  };

  const handleCalorieChange = (event: Event, newValue: number | number[]) => {
    const newRange = newValue as [number, number];
    setLocalCalorieRange(newRange);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (onFilterChange) {
        onFilterChange({
          dietaryRestrictions: currentFilters?.dietaryRestrictions || [],
          calorieRange: calorieFilterType === 'all' ? [10, 900] : newRange,
          vegetarianFilter: currentFilters?.vegetarianFilter || '',
          offer: currentFilters?.offer || []
        });
      }
    }, 500);
  };

  const handleCalorieFilterTypeChange = (type: 'all' | 'range') => {
    setCalorieFilterType(type);
    if (type === 'range') {
      setCalorieSlider(true);
    } else if(type === 'all'){
      setCalorieSlider(false);
    }
    
    if (onFilterChange) {
      onFilterChange({
        dietaryRestrictions: currentFilters?.dietaryRestrictions || [],
        calorieRange: type === 'all' ? [10, 900] : currentFilters?.calorieRange || [10, 900],
        vegetarianFilter: currentFilters?.vegetarianFilter || '',
        offer: currentFilters?.offer || []
      });

      trackFilterApplied('calorie', type === 'all' ? 'all' : 'range', dineInTrackExtra);
    }
  };

  const handleAllergenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const allergenValue = event.target.value;
    const isChecked = event.target.checked;
    
    let newSelectedAllergens;
    
    if (allergenValue === 'any') {
      newSelectedAllergens = isChecked ? 
        ['any',"containsEgg","containsDairy","containsNuts","containsShellfish","containsSoy","containsWheat","containsPeanuts","containsFish"] : 
        [];
    } else {
      if (isChecked) {
        newSelectedAllergens = currentFilters?.dietaryRestrictions?.length ? [...currentFilters?.dietaryRestrictions?.filter(item => item !== 'any'), allergenValue] : [allergenValue];
      } else {
        newSelectedAllergens = currentFilters?.dietaryRestrictions?.length ? [...currentFilters?.dietaryRestrictions?.filter(item => item !== allergenValue && item !== "any")] : [];
      }
    }
    
    if (onFilterChange) {
      onFilterChange({
        dietaryRestrictions: newSelectedAllergens,
        calorieRange: currentFilters?.calorieRange || [10, 900],
        vegetarianFilter: currentFilters?.vegetarianFilter || '',
        offer: currentFilters?.offer || []
      });

      trackFilterApplied('dietary_restrictions', allergenValue, dineInTrackExtra);
    }
  };

  const handleOfferChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const offerVal = event.target.value;
    const isChecked = event.target.checked;
    setOffersPopUp(!offerPopUp);
    
    let newSelectOffer: string[];
    
    if (offerVal === 'any') {
      newSelectOffer = isChecked ? 
        offerFacets?.map(item => item?.offerName?.en) || [] : 
        [];
    } else {
      if (isChecked) {
        newSelectOffer = currentFilters?.offer?.length ? [...currentFilters?.offer?.filter(item => item !== 'any'), offerVal] : [offerVal];
      } else {
        newSelectOffer = currentFilters?.offer?.length ? [...currentFilters?.offer?.filter(item => item !== offerVal && item !== "any")] : [];
      }
    }
    
    if (onFilterChange) {
      onFilterChange({
        dietaryRestrictions: currentFilters?.dietaryRestrictions || [],
        calorieRange: currentFilters?.calorieRange || [10, 900],
        vegetarianFilter: currentFilters?.vegetarianFilter || '',
        offer: newSelectOffer || []
      });

      trackFilterApplied('offer', offerVal, dineInTrackExtra);
    }
  };

  const handletoggle = (togl: string) => {
    if (onFilterChange) {
      onFilterChange({
        dietaryRestrictions: currentFilters?.dietaryRestrictions || [],
        calorieRange: currentFilters?.calorieRange || [10, 900],
        vegetarianFilter: currentFilters?.vegetarianFilter === togl? '' : togl,
        offer: currentFilters?.offer || []
      });

      trackFilterApplied('vegetarian', currentFilters?.vegetarianFilter === togl ? '' : togl, dineInTrackExtra);
    }
  };

  // Handle click outside to close calorie slider popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calorieSliderRef.current && !calorieSliderRef.current.contains(event.target as Node)) {
        setCalorieSlider(false);
      }
      if (allergensRef.current && !allergensRef.current.contains(event.target as Node)) {
        setAllergensPopUp(false);
      }
      if (offersRef.current && !offersRef.current.contains(event.target as Node)) {
        setOffersPopUp(false);
      }
    };

    if (calorieSlider || allergensPopUp || offerPopUp) {
      document.addEventListener('mousedown', handleClickOutside);
    };

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [calorieSlider, allergensPopUp, offerPopUp]);

  const calorieMinFromParent = currentFilters?.calorieRange?.[0];
  const calorieMaxFromParent = currentFilters?.calorieRange?.[1];

  useEffect(() => {
    if (typeof calorieMinFromParent === 'number' && typeof calorieMaxFromParent === 'number') {
      setLocalCalorieRange([calorieMinFromParent, calorieMaxFromParent]);
    }
  }, [calorieMinFromParent, calorieMaxFromParent]);

  // Handle click outside to close allergens popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (allergensRef.current && !allergensRef.current.contains(event.target as Node)) {
        setAllergensPopUp(false);
      }
    };
    if (allergensPopUp) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [allergensPopUp]);

  return (
    <div className="flex items-center gap-2 px-0 lg:px-3 md:py-2 md:w-auto w-full scrollbar-hide">
      <div className="flex items-center gap-2 text-sm w-full md:py-0 py-2 relative filter-scrollbar mobile-scroll">

        <div className="relative flex">        

          {/* Dietary Restrictions - Desktop only */}
          {showDietaryRestrictions && <div className="relative overflow-visible mr-2 hidden md:block" ref={allergensRef}>
            <div className={`${ currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.length > 0 ? "bg-[var(--warning-opac)] border border-[var(--button-primary-background)] px-2" : "bg-[var(--primary-background)] filter-item-container px-4 md:px-2"} rounded-md py-2`}>
              <div className='flex justify-center items-center cursor-pointer whitespace-nowrap' onClick={() => {
                setAllergensPopUp(!allergensPopUp);
              }}>
                {currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.length > 0 && <div className='font-bold text-[10px] bg-[var(--warning)] rounded-full w-[30px] h-[20px] flex justify-center items-center mr-1 md:hidden'>{currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.length >= 8 ? 8 : currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.length}</div>} {lang.DietaryResrtrictions} <span className='hidden md:block'>: {currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.length > 0 ? `${currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.length >= 8 ? 8 : currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.length} ${lang.selected}` : lang.Any} </span>
                <img fetchPriority="high"  
                  src="/images/arrow-down.png" 
                  alt="Allergens Sort Slider Popup" 
                  title='Allergens Sort Slider Popup' 
                  width={10} 
                  height={10}
                  className={`ml-2`}
                />
              </div>
            </div>
            {!!allergensPopUp && <div className='allergen-container border'>
                <div className='allergen'>
                  <label className='w-full text-left'><input type="checkbox" className="mr-2 transition-colors [&:checked]:accent-[var(--primary-color)]" name="Any" id="Any" value={"any"} checked={currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.includes("any")} onChange={handleAllergenChange} />{lang.all}</label>
                  <label className='w-full text-left'><input type="checkbox" className="mr-2 transition-colors [&:checked]:accent-[var(--primary-color)]" name="Egg Free" id="Egg Free" value={"containsEgg"} checked={currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.includes("any") || currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.includes("containsEgg")} onChange={handleAllergenChange} />{lang.eggFree}</label>
                  <label className='w-full text-left'><input type="checkbox" className="mr-2 transition-colors [&:checked]:accent-[var(--primary-color)]" name="Dairy Free" id="Dairy Free" value={"containsDairy"} checked={currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.includes("any") || currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.includes("containsDairy")} onChange={handleAllergenChange} />{lang.dairyFree}</label>
                  <label className='w-full text-left'><input type="checkbox" className="mr-2 transition-colors [&:checked]:accent-[var(--primary-color)]" name="Nut Free" id="Nut Free" value={"containsNuts"} checked={currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.includes("any") || currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.includes("containsNuts")} onChange={handleAllergenChange} />{lang.nutFree}</label>
                  <label className='w-full text-left'><input type="checkbox" className="mr-2 transition-colors [&:checked]:accent-[var(--primary-color)]" name="Shellfish Free" id="Shellfish Free" value={"containsShellfish"} checked={currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.includes("any") || currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.includes("containsShellfish")} onChange={handleAllergenChange} />{lang.shellfishFree}</label>
                  <label className='w-full text-left'><input type="checkbox" className="mr-2 transition-colors [&:checked]:accent-[var(--primary-color)]" name="Soy Free" id="Soy Free" value={"containsSoy"} checked={currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.includes("any") || currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.includes("containsSoy")} onChange={handleAllergenChange} />{lang.soyFree}</label>
                  <label className='w-full text-left'><input type="checkbox" className="mr-2 transition-colors [&:checked]:accent-[var(--primary-color)]" name="glutenFree" id="Gluten Free" value={"containsWheat"} checked={currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.includes("any") || currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.includes("containsWheat")} onChange={handleAllergenChange} />{lang.glutenFree}</label>
                  <label className='w-full text-left'><input type="checkbox" className="mr-2 transition-colors [&:checked]:accent-[var(--primary-color)]" name="Peanut Free" id="Peanut Free" value={"containsPeanuts"} checked={currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.includes("any") || currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.includes("containsPeanuts")} onChange={handleAllergenChange} />{lang.peanutFree}</label>
                  <label className='w-full text-left'><input type="checkbox" className="mr-2 transition-colors [&:checked]:accent-[var(--primary-color)]" name="Fish Free" id="Fish Free" value={"containsFish"} checked={currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.includes("any") || currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.includes("containsFish")} onChange={handleAllergenChange} />{lang.fishFree}</label>
                </div>
              </div>}
          </div>}

          {/* Calorie filter - Desktop only */}
          {showCaloriesInfo && <div className={`${currentFilters?.calorieRange[0] !== 10 || currentFilters?.calorieRange[1] !== 900 ? "bg-[var(--warning-opac)] border border-[var(--button-primary-background)]" : "bg-[var(--primary-background)] filter-item-container"} rounded-md px-2 md:px-2 py-2 relative mr-2 hidden md:block`} ref={calorieSliderRef}>
            <span className='flex justify-center items-center cursor-pointer whitespace-nowrap'
              onClick={() => {
                setCalorieSlider(!calorieSlider);
              }}>
              {lang.Calorie} : {currentFilters?.calorieRange[0] !== 10 || currentFilters?.calorieRange[1] !== 900 ? `${currentFilters?.calorieRange[0]}-${currentFilters?.calorieRange[1]} ${lang.kcal}` : lang.all} 
              <img fetchPriority="high"  
                src="/images/arrow-down.png" 
                alt="Calorie Sort Slider Popup" 
                title='Calorie Sort Slider Popup' 
                width={10} 
                height={10}
                className={`ml-2`}
              />
            </span>
            {!!calorieSlider && <div className='slider-container filter-item-container'>
              <div className='slider'>
                <div className="w-full mb-3">
                  <label className="flex items-center mb-4 cursor-pointer">
                    <div className="radio-container mr-2">
                      <input 
                        type="radio" 
                        name="calorieFilterPopup" 
                        className="radio-input" 
                        checked={calorieFilterType === 'all'} 
                        onChange={() => handleCalorieFilterTypeChange('all')}
                      />
                      <div className="radio-circle"></div>
                    </div>
                    <span className="text-base">{lang.all}</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <div className="radio-container mr-2">
                      <input 
                        type="radio" 
                        name="calorieFilterPopup" 
                        className="radio-input" 
                        checked={calorieFilterType === 'range'} 
                        onChange={() => setCalorieFilterType('range')}
                      />
                      <div className="radio-circle"></div>
                    </div>
                    <span className="text-base">{lang.selectRange} : {localCalorieRange[0]}-{localCalorieRange[1]} {lang.kcal}</span>
                  </label>
                </div>
                {calorieFilterType === 'range' && (
                  <div className="slider-range-container w-[95%]">
                    <Slider
                      getAriaLabel={() => 'Calorie range'}
                      value={localCalorieRange}
                      onChange={handleCalorieChange}
                      valueLabelDisplay="auto"
                      min={10}
                      max={900}
                      getAriaValueText={(value) => `${value} calories`}
                      sx={{
                        '& .MuiSlider-thumb': {
                          backgroundColor: 'var(--primary-color)',
                          border: '3px solid white',
                        },
                        '& .MuiSlider-track': {
                          backgroundColor: 'var(--primary-color)',
                          border: 'none',
                        },
                        '& .MuiSlider-rail': {
                          backgroundColor: '#E0E0E0',
                        }
                      }}
                    />
                    <div className='flex items-center justify-between w-full'>
                      <span className="text-sm">10 {lang.kcal}</span>
                      <span className="text-sm">900 {lang.kcal}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>}
          </div>}

          {/* Contains meat filter - Mobile only (1st position) */}
          {showContainsMeat && <div className={`${currentFilters?.vegetarianFilter === "non-veg" ? `border-[var(--button-primary-background)] border bg-[var(--warning-opac)]` : "filter-item-container bg-[var(--cards-containers)]"} rounded-md px-2 py-2 mr-2 block md:hidden`}>
            <span className='flex justify-center items-center cursor-pointer whitespace-nowrap mx-3'>
              <img fetchPriority="high" src="/images/icon/non-veg.svg" alt="Non Veg Sort Icon" title='Non Veg Sort Icon' height={15} width={15} className='mr-2'/>
              {lang.containsMeat}
           
              <div className={`${currentFilters?.vegetarianFilter === "non-veg" ? "border border-[var(--button-primary-border-color)]" : ""} ml-1 w-[30px] h-[18px] rounded-full bg-[var(--cards-containers)]`}>
                <label htmlFor="non-veg-toggle-mobile" className='themeSwitcherTwo relative cursor-pointer select-none items-center w-full h-full'>
                  <input
                    id="non-veg-toggle-mobile"
                    type='checkbox'
                    checked={currentFilters?.vegetarianFilter === "non-veg"}
                    onChange={() => handletoggle("non-veg")}
                    className='sr-only w-full h-full'
                  />
                  <span
                    className={`slider flex h-4 w-[30px] items-center rounded-full border duration-200 ${
                      currentFilters?.vegetarianFilter === "non-veg" ? '' : 'bg-[var(--cards-containers)]'
                    }`}
                  >
                    <span
                      className={`dot h-2 w-2 rounded-full duration-200 ${
                        currentFilters?.vegetarianFilter === "non-veg" ? 'translate-x-[7px] bg-[green]' : 'translate-x-[-7px] bg-[#D7D5C4]'
                      }`}
                    ></span>
                  </span>
                </label>
              </div>
            </span>
          </div>}

          {/* Dietary Restrictions - Mobile only (2nd position) */}
          {showDietaryRestrictions && <div className={`${currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.length > 0 ? "bg-[var(--warning-opac)] border border-[var(--button-primary-background)]" : "bg-[var(--cards-containers)] filter-item-container"} rounded-md px-2 md:px-2 py-2 relative mr-2 block md:hidden`}>
            <span className='flex justify-center items-center cursor-pointer whitespace-nowrap'
              onClick={() => {
                setIsFilterDrawerOpen(true);
              }}>
              {currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.length > 0 && 
              <div className='font-bold text-[10px] text-[var(--primary-text-light)] bg-[var(--warning-light)] rounded-full w-4 h-4 min-w-4 min-h-4 flex justify-center items-center mr-1'>
                {(() => {
                  const count = currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.length >= 8 ? 8 : currentFilters?.dietaryRestrictions && currentFilters?.dietaryRestrictions.length;
                  return count < 10 ? '0' + count : count;
                })()}
              </div>} 
              {lang.DietaryResrtrictions}
              <img fetchPriority="high"  
                src="/images/arrow-down.png" 
                alt="Dietary Restrictions Sort Filter" 
                title='Dietary Restrictions Sort Filter' 
                width={10} 
                height={10}
                className={`ml-2`}
              />
            </span>
          </div>}

          {/* Calorie filter - Mobile only (3rd position) */}
          {showCaloriesInfo && <div className={`${currentFilters?.calorieRange[0] !== 10 || currentFilters?.calorieRange[1] !== 900 ? "bg-[var(--warning-opac)] border border-[var(--button-primary-background)]" : "bg-[var(--cards-containers)] filter-item-container"} rounded-md px-2 md:px-2 py-2 relative mr-2 block md:hidden`}>
            <span className='flex justify-center items-center cursor-pointer whitespace-nowrap'
              onClick={() => {
                setIsFilterDrawerOpen(true);
              }}>
              {lang.Calorie} : {currentFilters?.calorieRange[0] !== 10 || currentFilters?.calorieRange[1] !== 900 ? `${currentFilters?.calorieRange[0]}-${currentFilters?.calorieRange[1]} ${lang.kcal}` : lang.all} 
              <img fetchPriority="high"  
                src="/images/arrow-down.png" 
                alt="Calorie Sort Slider Popup" 
                title='Calorie Sort Slider Popup' 
                width={10} 
                height={10}
                className={`ml-2`}
              />
            </span>
          </div>}

          {/* Offers filter - Mobile only (4th position) */}
          {showOffers && <div className={`${currentFilters?.offer && currentFilters?.offer.length > 0 ? "bg-[var(--warning-opac)] border border-[var(--button-primary-background)]" : "bg-[var(--cards-containers)] filter-item-container"} rounded-md px-2 md:px-2 py-2 relative mr-2 block md:hidden`}>
            <span className='flex justify-center items-center cursor-pointer whitespace-nowrap'
              onClick={() => {
                setIsFilterDrawerOpen(true);
              }}>
              {currentFilters?.offer && currentFilters?.offer.length > 0 && <div className='font-bold text-[10px] text-[var(--primary-text-light)] bg-[var(--warning-light)] rounded-full w-4 h-4 min-w-4 min-h-4 flex justify-center items-center mr-1'>{currentFilters?.offer && currentFilters?.offer.length >= 8 ? 8 : currentFilters?.offer && currentFilters?.offer.length}</div>} Offers : {currentFilters?.offer && currentFilters?.offer.length > 0 ? `${currentFilters?.offer && currentFilters?.offer.length >= 8 ? 8 : currentFilters?.offer && currentFilters?.offer.length} ${lang.selected}` : lang.Any}
              <img fetchPriority="high"  
                src="/images/arrow-down.png" 
                alt="Offers Sort Filter" 
                title='Offers Sort Filter' 
                width={10} 
                height={10}
                className={`ml-2`}
              />
            </span>
          </div>}
          
          {/* Contains meat filter - Desktop only */}
          {showContainsMeat && <div className={`${currentFilters?.vegetarianFilter === "non-veg" ? `border-[var(--button-primary-background)] border bg-[var(--warning-opac)]` : "filter-item-container bg-[var(--cards-containers)]"} rounded-md px-2 md:px-2 py-2 mr-2 hidden md:block`}>
            <span className='flex justify-center items-center cursor-pointer whitespace-nowrap'>
              <img fetchPriority="high"  src="/images/icon/non-veg.svg" alt="Non Veg Sort Icon" title='Non Veg Sort Icon' height={15} width={15}  className='ml-2 md:ml-0 mr-2'/>
              {lang.containsMeat} 
              <div className={`${currentFilters?.vegetarianFilter === "non-veg" ? "border border-[var(--button-primary-border-color)]" : ""} ml-1 w-[30px] h-[18px] rounded-full bg-[var(--cards-containers)]`}>
                <>
                  <label htmlFor="non-veg-toggle" className='themeSwitcherTwo relative cursor-pointer select-none items-center w-full h-full'>
                    <input
                      id="non-veg-toggle"
                      type='checkbox'
                      checked={currentFilters?.vegetarianFilter === "non-veg"}
                      onChange={() => handletoggle("non-veg")}
                      className='sr-only w-full h-full'
                    />
                    <span
                      className={`slider flex h-4 w-[30px] items-center rounded-full border duration-200 ${
                        currentFilters?.vegetarianFilter === "non-veg" ? '' : 'bg-[var(--cards-containers)]'
                      }`}
                    >
                      <span
                        className={`dot h-2 w-2 rounded-full duration-200 ${
                          currentFilters?.vegetarianFilter === "non-veg" ? 'translate-x-[7px] bg-[green]' : 'translate-x-[-7px] bg-[#D7D5C4]'
                        }`}
                      ></span>
                    </span>
                  </label>
                </>
              </div>
            </span>
          </div>}

          {/* Offers filter - Desktop only */}
          {showOffers && <div className="relative overflow-visible mr-2 hidden md:block" ref={offersRef}>
            <div className={`${currentFilters?.offer && currentFilters?.offer.length > 0 ? "bg-[var(--warning-opac)] border border-[var(--button-primary-background)] px-2" : "bg-[var(--primary-background)] filter-item-container px-4 md:px-2"} rounded-md py-2 block`}>
              <div className='flex justify-center items-center cursor-pointer whitespace-nowrap'
                onClick={() => {
                  setOffersPopUp(!offerPopUp);
                }}>
                {currentFilters?.offer && currentFilters?.offer.length > 0 && <div className='font-bold text-[10px] bg-[var(--warning)] rounded-full w-[20px] h-[20px] flex justify-center items-center mr-1 md:hidden'>{currentFilters?.offer && currentFilters?.offer.length >= 8 ? 8 : currentFilters?.offer && currentFilters?.offer.length}</div>} {lang.offers} <span className='hidden md:block'>: {currentFilters?.offer && currentFilters?.offer.length > 0 ? `${currentFilters?.offer && currentFilters?.offer.length >= 8 ? 8 : currentFilters?.offer && currentFilters?.offer.length} ${lang.selected}` : lang.Any} </span>
                <img fetchPriority="high"  
                  src="/images/arrow-down.png" 
                  alt="Allergens Sort Slider Popup" 
                  title='Allergens Sort Slider Popup' 
                  width={10} 
                  height={10}
                  className={`ml-2`}
                />
              </div>
            </div>
            {!!offerPopUp && <div className='allergen-container border'>
                <div className='allergen'>
                  {!!offerFacets?.length && offerFacets?.length > 1 && <label className='w-full text-left'>
                    <input 
                      type="checkbox" 
                      className="mr-2 transition-colors [&:checked]:accent-[var(--primary-color)]" 
                      name="All offer" id="All offer" value={"any"} 
                      checked={currentFilters?.offer && currentFilters?.offer.includes("any")}
                      onChange={handleOfferChange} 
                    />
                    {lang.all}
                  </label>}
                {offerFacets.map((ofr: DiscountOffer) => 
                  <label className='w-full text-left flex items-center' key={ofr.offerId}>
                    <input 
                      type="checkbox" 
                      className="mr-2 transition-colors [&:checked]:accent-[var(--primary-color)] checkbox-icon" 
                      name={ofr.offerName.en} id={ofr.offerId} value={ofr.offerName.en} 
                      checked={currentFilters?.offer?.includes("any") || currentFilters?.offer?.includes(ofr.offerName.en)} 
                      onChange={handleOfferChange}
                    />
                    {ofr.offerName.en}
                  </label>
                )}
                </div>
              </div>}
          </div>}
        </div>

        {/* <span className='absolute left-0 top-0 w-full h-full bg-[transparent] block md:hidden' onClick={() => setIsFilterDrawerOpen(true)}></span> */}
        
      {/* Mobile Filter and ToggleView container - side by side, both sticky */}
      <div className="ml-auto flex items-center gap-2 md:hidden sticky top-4 right-0 z-[9]">
        {hasAvailableFilters && (
          <button
            className={`filter-btn p-2 rounded-[8px] bg-[var(--cards-containers)] min-w-[37px] min-h-[37px] flex items-center justify-center ${filtersApplied ? 'border-2 border-[var(--primary-color)]' : 'border border-[var(--borders-dividers)]'} ${!selectIsQrFlowActive ? 'shadow-[20px_0px_20px_30px_var(--primary-background)]' : 'shadow-[20px_0px_20px_30px_var(--cards-containers)]'}`}
            onClick={() => setIsFilterDrawerOpen(true)}
          >
            <img 
              fetchPriority="high"  
             src={theme === "light" ? FILTER_ICON : FILTER_ICON_WHITE} 
              alt="Filter drawer open" 
              title="Filter drawer open" 
              className="w-5 h-5 flex-shrink-0 block relative z-10"
              style={{ display: 'block', position: 'relative' }}
            />
            {appliedFiltersCount > 0 && (
            <div className="filter-count-badge absolute -top-1 -right-1 z-20 min-w-[18px] h-[18px] flex items-center justify-center">
              {appliedFiltersCount > 99 ? '99+' : appliedFiltersCount < 10 ? '0' + appliedFiltersCount : appliedFiltersCount}
            </div>
            )}
          </button>
        )}
        
        {/* Mobile ToggleView - show next to filter button */}
        <ToggleView mobile={true} />
      </div>  
       
        <FilterDrawer 
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          onFilterChange={onFilterChange}
          offerFacets={offerFacets}
          currentFilters={{
            dietaryRestrictions: currentFilters?.dietaryRestrictions || [],
            calorieRange: currentFilters?.calorieRange || [10, 900],
            vegetarianFilter: currentFilters?.vegetarianFilter || "",
            offer: currentFilters?.offer || [],
          }}
        />
        {filtersApplied && (
          <button 
            onClick={handleClearAll}
            type="button"
            aria-label={`${lang?.clearAll} - Reset all applied filters`}
            title={`${lang?.clearAll} - Reset all applied filters`}
            className="text-[var(--accent-color)] text-sm font-medium hidden md:block clear-all-btn"
          >
            {lang?.clearAll}
          </button>
        )}
      </div>
      <style>{`
        .filter-item-container {
          border: 1px solid var(--borders-dividers);
        }
        .slider-container {
          padding: 16px;
          position: absolute;
          background-color: var(--cards-containers);
          border-radius: 8px;
          width: 300px;
          max-width: 90vw;
          top: 110%;
          left: 10px; 
          z-index: 9999;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .allergen-container {
          position: absolute;
          background-color: var(--cards-containers);
          border-radius: 8px;
          max-height: 350px;
          overflow-y: auto;
          top: 110%;
          left: 10px; 
          z-index: 9999;
        }
        .MuiSlider-rail {
          background-color: #E0E0E0!important;
        }
        .MuiSlider-track {
          border: none!important;
          background-color: var(--primary-color)!important;
        }
        .MuiSlider-thumb {
          height: 24px!important;
          width: 24px!important;
          background-color: var(--primary-color)!important;
          border: 3px solid var(--white)!important;
        }
        .MuiSlider-root {
          height: 10px!important;
        }
        .MuiSlider-thumbColorPrimary {
          background-color: var(--primary-color)!important;
          border: 3px solid var(--white)!important;
        }
        .slider {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center; 
        }

        .radio-container {
          position: relative;
          width: 20px;
          height: 20px;
          display: inline-block;
        }

        .radio-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .radio-circle {
          position: absolute;
          top: 0;
          left: 0;
          height: 20px;
          width: 20px;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 50%;
        }

        .radio-input:checked + .radio-circle {
          border: 1px solid var(--primary-color);
        }

        .radio-input:checked + .radio-circle:after {
          content: "";
          position: absolute;
          display: block;
          top: 4px;
          left: 4px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--primary-color);
        }

        .allergen {
          display: flex;
          flex-wrap: wrap;
          justify-content: start;
          align-items: center; 
        }
        
        .allergen > label { 
          padding: 10px 20px 0 20px;
          white-space: nowrap;
        }

        .allergen > label:last-child {
          padding-bottom: 10px;
        }

        .slider > span {
          font-weight: var(--font-bold);
        }
        .checkbox-icon {
          width: 0.875rem;
          height: 0.875rem; 
        }

        .filter-count-badge {
          position: absolute;
          top: -8px;
          right: 40px;
          background-color: var(--warning-light);
          color: var(--primary-text-light);
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--font-bold);
          font-size: 10px;
        }

        /* Hide scrollbar for filter bar but keep it scrollable */
        .filter-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 10+ */
        }
        .filter-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        .clear-all-btn {
           border:none !important;
           outline:none !important;
        }

        @media(max-width:786px){
          .mobile-scroll{
          overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};
