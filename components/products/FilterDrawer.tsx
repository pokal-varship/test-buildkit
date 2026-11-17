'use client';
import React, { useState, useEffect, useRef } from 'react';
import Slider from '@mui/material/Slider';
import { SortBarFilters } from './SortBar';
import useLang from '@hooks/useLang';
import { LanguageCode, TranslationKeys } from 'types';
import { DiscountOffer } from '@services/typesense';
import { CheckboxSvg } from '../ui/CheckboxSvg';
import { useSelector } from 'react-redux';
import { selectIsQrFlowActive } from '@redux/slices/qrFlowSlice';
import { getTenantConfig } from '@config/tenant.config';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange?: (filters: SortBarFilters) => void;
  currentFilters: SortBarFilters;
  offerFacets: DiscountOffer[] | undefined;
}

type TabType = 'allergens' | 'calorie' | 'veg' | 'offers';

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  onFilterChange,
  currentFilters,
  offerFacets,
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const { showCaloriesInfo, showOfferFilter, showDietaryRestrictions, showContainsMeat } = getTenantConfig();
  const showOffers = showOfferFilter && !!offerFacets?.length;
  const defaultTab: TabType = showDietaryRestrictions
    ? 'allergens'
    : showCaloriesInfo
      ? 'calorie'
      : showContainsMeat
        ? 'veg'
        : showOffers
          ? 'offers'
          : 'veg';
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [vegetarianFilter, setVegetarianFilter] = useState<string>(currentFilters.vegetarianFilter);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(currentFilters.dietaryRestrictions);
  const [selectedOffers, setSelectedOffers] = useState<string[]>(currentFilters.offer || []);
  const [calorieFilterType, setCalorieFilterType] = useState<'all' | 'range'>('all');
  const [calorieRange, setCalorieRange] = useState<[number, number]>([10, 900]);

  const drawerRef = useRef<HTMLDivElement>(null);
  const isQrFlowActive = useSelector(selectIsQrFlowActive);

  /** When QR flow bottom nav is visible, add bottom padding so Apply button sits above it */
  const applySectionPaddingClass = isOpen && isQrFlowActive ? 'pb-24' : 'pb-6';

  // Update local state when currentFilters change
  useEffect(() => {
    // Only update if values are different to prevent unnecessary re-renders
    if (!arraysEqual(selectedAllergens, currentFilters.dietaryRestrictions)) {
      setSelectedAllergens(currentFilters.dietaryRestrictions);
    }

    if (!arraysEqual(selectedOffers, currentFilters.offer || [])) {
      setSelectedOffers(currentFilters.offer || []);
    }

    if (calorieRange[0] !== currentFilters.calorieRange[0] || calorieRange[1] !== currentFilters.calorieRange[1]) {
      setCalorieRange(currentFilters.calorieRange);
    }

    if (vegetarianFilter !== currentFilters.vegetarianFilter) {
      setVegetarianFilter(currentFilters.vegetarianFilter);
    }
  }, [currentFilters]);

  // Helper function to compare arrays
  const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  };

  // Handle click outside to close drawer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scrolling when drawer is open
      document.body.style.overflow = 'hidden';
      // Add body class to track filter drawer state
      document.body.classList.add('filter-drawer-open');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
      // Remove body class when drawer closes
      document.body.classList.remove('filter-drawer-open');
    };
  }, [isOpen, onClose]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleOfferChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const offerVal = event.target.value;
    const isChecked = event.target.checked;

    let newSelectOffer: string[];

    if (offerVal === 'any') {
      newSelectOffer = isChecked ?
        offerFacets?.map(item => item.offerName.en) || [] :
        [];
    } else {
      if (isChecked) {
        newSelectOffer = currentFilters?.offer?.length ? [...currentFilters?.offer?.filter(item => item !== 'any'), offerVal] : [offerVal];
      } else {
        newSelectOffer = currentFilters?.offer?.length ? [...currentFilters?.offer?.filter(item => item !== offerVal && item !== "any")] : [];
      }
    };

    setSelectedOffers(newSelectOffer);
  };

  const handleAllAllergenToggle = () => {
    // Toggle "All" option - if already selected, unselect all; otherwise, select all
    if (selectedAllergens.includes('any')) {
      setSelectedAllergens([]);
    } else {
      setSelectedAllergens(['any', "containsEgg", "containsDairy", "containsNuts", "containsShellfish", "containsSoy", "containsWheat", "containsPeanuts", "containsFish"]);
    }
  };

  const handleAllergenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const allergenValue = event.target.value;
    const isChecked = event.target.checked;

    let newSelectedAllergens: string[];

    if (allergenValue === 'any') {
      // If "All" is already selected, unselect all. Otherwise, select all.
      if (selectedAllergens.includes('any')) {
        newSelectedAllergens = [];
      } else {
        newSelectedAllergens = ['any', "containsEgg", "containsDairy", "containsNuts", "containsShellfish", "containsSoy", "containsWheat", "containsPeanuts", "containsFish"];
      }
    } else {
      if (isChecked) {
        newSelectedAllergens = [...selectedAllergens.filter(item => item !== 'any'), allergenValue];
      } else {
        newSelectedAllergens = [...selectedAllergens.filter(item => item !== allergenValue && item !== "any")];
      }
    }

    setSelectedAllergens(newSelectedAllergens);
  };

  const handleCalorieChange = (event: Event, newValue: number | number[]) => {
    const newRange = newValue as [number, number];
    setCalorieRange(newRange);
  };

  const handleCalorieFilterTypeChange = (type: 'all' | 'range') => {
    setCalorieFilterType(type);
    if (type === 'all') {
      setCalorieRange([10, 900]);
    }
  };

  const handleVegetarianToggle = (value: string) => {
    setVegetarianFilter(vegetarianFilter === value ? '' : value);
  };

  const handleClearAll = () => {
    setSelectedAllergens([]);
    setCalorieRange([10, 900]);
    setCalorieFilterType('all');
    setVegetarianFilter('non-veg');

    if (onFilterChange) {
      onFilterChange({
        dietaryRestrictions: [],
        calorieRange: [10, 900],
        vegetarianFilter: 'non-veg',
        offer: []
      });
    }
    onClose();
  };

  const applyFilters = () => {
    if (onFilterChange) {
      onFilterChange({
        dietaryRestrictions: selectedAllergens,
        calorieRange: calorieFilterType === 'all' ? [10, 900] : calorieRange,
        vegetarianFilter: vegetarianFilter,
        offer: selectedOffers
      });
    }
    onClose();
  };

  // Check if filters are in their default state
  const isFiltersInDefaultState = () => {
    const isDefaultDietaryRestrictions = selectedAllergens.length === 0;
    const isDefaultCalorieRange = calorieRange[0] === 10 && calorieRange[1] === 900;
    const isDefaultVegetarianFilter = vegetarianFilter === 'non-veg';
    const isDefaultOffers = selectedOffers.length === 0;

    return isDefaultDietaryRestrictions && isDefaultCalorieRange && isDefaultVegetarianFilter && isDefaultOffers;
  };

  const filtersApplied = !isFiltersInDefaultState();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-end justify-center filter-drawer-container">
      <div
        ref={drawerRef}
        className="bg-[var(--cards-containers)] rounded-t-xl w-full overflow-hidden flex flex-col animate-slide-up relative z-[10001]"
      >
        <div className="flex justify-between items-center p-4 pt-5">
          <h3 className="heading-2 font-500">{lang.filters}</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={handleClearAll}
              className="text-[var(--accent-color)] font-[var(--font-semi-bold)]"
            >
              Clear all
            </button>
            <button
              onClick={onClose}
            >
              <span className="text-4xl">&times;</span>
            </button>
          </div>
        </div>

        <div className='flex'>
          {/* Tabs */}
          <div className="flex border-r w-[min-content] flex-wrap content-start justify-left">
            {showDietaryRestrictions && (
              <button
                className={`p-3 text-left text-base w-full ${activeTab === 'allergens' ? 'border-l-4 border-[var(--primary-color)] text-[var(--primary-text)] bg-[var(--primary-background)]' : 'pl-4'}`}
                onClick={() => handleTabChange('allergens')}
              >
                {lang.DietaryResrtrictions}
              </button>
            )}
            {showCaloriesInfo && (
              <button
                className={`p-3 text-left text-base w-full whitespace-nowrap ${activeTab === 'calorie' ? 'border-l-4 border-[var(--primary-color)] text-[var(--primary-text)] bg-[var(--primary-background)]' : 'pl-4'}`}
                onClick={() => handleTabChange('calorie')}
              >
                {lang.Calorie}
              </button>
            )}
            {showContainsMeat && (
              <button
                className={`p-3 text-left text-base w-full whitespace-nowrap ${activeTab === 'veg' ? 'border-l-4 border-[var(--primary-color)] text-[var(--primary-text)] bg-[var(--primary-background)]' : 'pl-4'}`}
                onClick={() => handleTabChange('veg')}
              >
                {lang.containsMeat}
              </button>
            )}
            {showOffers && <button
              className={`p-3 text-left text-base w-full whitespace-nowrap ${activeTab === 'offers' ? 'border-l-4 border-[var(--primary-color)] text-[var(--primary-text)] bg-[var(--primary-background)]' : 'pl-4'}`}
              onClick={() => handleTabChange('offers')}
            >
              Offers
            </button>}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto py-2 px-4 h-[30vh]">
            {/* Allergens Tab */}
            {showDietaryRestrictions && activeTab === 'allergens' && (
              <div className="allergen-list">
                <label className='w-full text-left block py-2 heading-5 font-medium'>
                  <input
                    type="radio"
                    className="mr-2 transition-colors custom-radio border-gray-400"
                    name="Any"
                    id="Any"
                    value={"any"}
                    checked={selectedAllergens.includes("any")}
                    onChange={handleAllAllergenToggle}
                    onClick={handleAllAllergenToggle}
                  />
                  {lang.all}
                </label>
                <CheckboxSvg
                  checked={selectedAllergens.includes("any") || selectedAllergens.includes("containsEgg")}
                  onChange={handleAllergenChange}
                  name="Egg Free"
                  id="Egg Free"
                  value="containsEgg"
                >
                  {lang.eggFree}
                </CheckboxSvg>
                
                <CheckboxSvg
                  checked={selectedAllergens.includes("any") || selectedAllergens.includes("containsDairy")}
                  onChange={handleAllergenChange}
                  name="Dairy Free"
                  id="Dairy Free"
                  value="containsDairy"
                 
                >
                  {lang.dairyFree}
                </CheckboxSvg>
                
                <CheckboxSvg
                  checked={selectedAllergens.includes("any") || selectedAllergens.includes("containsNuts")}
                  onChange={handleAllergenChange}
                  name="Nut Free"
                  id="Nut Free"
                  value="containsNuts"
                >
                  {lang.nutFree}
                </CheckboxSvg>
                
                <CheckboxSvg
                  checked={selectedAllergens.includes("any") || selectedAllergens.includes("containsShellfish")}
                  onChange={handleAllergenChange}
                  name="Shellfish Free"
                  id="Shellfish Free"
                  value="containsShellfish"
                >
                  {lang.shellfishFree}
                </CheckboxSvg>
                
                <CheckboxSvg
                  checked={selectedAllergens.includes("any") || selectedAllergens.includes("containsSoy")}
                  onChange={handleAllergenChange}
                  name="Soy Free"
                  id="Soy Free"
                  value="containsSoy"
                >
                  {lang.soyFree}
                </CheckboxSvg>
                
                <CheckboxSvg
                  checked={selectedAllergens.includes("any") || selectedAllergens.includes("containsWheat")}
                  onChange={handleAllergenChange}
                  name="glutenFree"
                  id="Gluten Free"
                  value="containsWheat"
                >
                  {lang.glutenFree}
                </CheckboxSvg>
                
                <CheckboxSvg
                  checked={selectedAllergens.includes("any") || selectedAllergens.includes("containsPeanuts")}
                  onChange={handleAllergenChange}
                  name="Peanut Free"
                  id="Peanut Free"
                  value="containsPeanuts"
                >
                  {lang.peanutFree}
                </CheckboxSvg>
                
                <CheckboxSvg
                  checked={selectedAllergens.includes("any") || selectedAllergens.includes("containsFish")}
                  onChange={handleAllergenChange}
                  name="Fish Free"
                  id="Fish Free"
                  value="containsFish"
                >
                  {lang.fishFree}
                </CheckboxSvg>
              </div>
            )}
            {showOffers && activeTab === 'offers' && (
              <div className="offer-list">
                {!!offerFacets?.length && offerFacets?.length > 1 &&
                  <CheckboxSvg
                    checked={selectedOffers.includes("any")}
                    onChange={handleOfferChange}
                    name="All offer"
                    id="All offer"
                    value="any"
                  >
                    {lang.all}
                  </CheckboxSvg>
                }
                {offerFacets?.map((ofr: DiscountOffer) =>
                  <CheckboxSvg
                    key={ofr.offerId}
                    checked={selectedOffers?.includes("any") || selectedOffers?.includes(ofr.offerName.en)}
                    onChange={handleOfferChange}
                    name={ofr.offerName.en}
                    id={ofr.offerId}
                    value={ofr.offerName.en}
                  >
                    {ofr.offerName.en}
                  </CheckboxSvg>
                )}
              </div>
            )}

            {/* Calorie Tab */}
            {showCaloriesInfo && activeTab === 'calorie' && (
              <div className="calorie-filter">
                <div>
                  <label className="flex items-center mb-4 cursor-pointer">
                    <div className="radio-container mr-2">
                      <input
                        type="radio"
                        name="calorieFilterType"
                        className="radio-input"
                        checked={calorieFilterType === 'all'}
                        onChange={() => handleCalorieFilterTypeChange('all')}
                      />
                      <div className="radio-circle"></div>
                    </div>
                    <span className="text-base">All</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <div className="radio-container mr-2">
                      <input
                        type="radio"
                        name="calorieFilterType"
                        className="radio-input"
                        checked={calorieFilterType === 'range'}
                        onChange={() => handleCalorieFilterTypeChange('range')}
                      />
                      <div className="radio-circle"></div>
                    </div>
                    <div className="text-base">
                      Select Range
                      <div className='text-[var(--primary-color)] text-sm'>
                        {calorieRange[0]}-{calorieRange[1]} {lang.kcal}
                      </div>
                    </div>
                  </label>
                </div>

                {calorieFilterType === 'range' && (
                  <div className="slider-range-container w-full px-2">
                    <Slider
                      getAriaLabel={() => 'Calorie range'}
                      value={calorieRange}
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
            )}

            {/* Veg/Non-Veg Tab */}
            {showContainsMeat && activeTab === 'veg' && (
              <div className="veg-filter">
                <label className='w-full text-left flex items-center py-2'>
                  <input
                    type="checkbox"
                    className="mr-2 hidden"
                    name="Non Veg"
                    id="Non Veg"
                    value="non-veg"
                    checked={vegetarianFilter === "non-veg"}
                    onChange={() => handleVegetarianToggle("non-veg")}
                  />
                  <span className={`inline-flex items-center justify-center w-3 h-3 mr-2 ${vegetarianFilter === "non-veg" ? 'bg-[var(--primary-color)]' : 'border border-gray-300'} rounded-sm`}>
                    {vegetarianFilter === "non-veg" && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  {lang.containsMeat}
                </label>
              </div>
            )}
          </div>

        </div>

        {/* Apply Button */}
        <div className={`p-4 ${applySectionPaddingClass} relative z-[10002]`}>
          <button
            onClick={applyFilters}
            disabled={!filtersApplied}
            className="w-full py-3 bg-[var(--button-primary-background)] text-[var(--button-primary-text)] rounded-md font-[var(--font-semi-bold)] disabled:opacity-50 relative z-[10002]"
          >
            Apply
          </button>
        </div>
      </div>

      <style>{`
        /* Hide filter drawer when menu popup is open */
        body.menu-popup-open .filter-drawer-container {
          opacity: 0 !important;
          pointer-events: none !important;
          z-index: -1 !important;
        }
        
        /* Ensure filter drawer container and content have highest z-index */
        .filter-drawer-container {
          z-index: 10000 !important;
        }
        
        .filter-drawer-container > div {
          z-index: 10001 !important;
          position: relative;
        }
        
        .radio-container {
          position: relative;
          width: 20px;
          height: 20px;
          display: inline-block;
        }
           .font-600 {
            font-weight: var(--font-semi-bold);
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
          height: 15px;
          width: 15px;
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
          top: 3px;
          left: 3px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--primary-color);
        }
        
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        /* Custom radio button styling */
        .custom-radio {
          appearance: none;
          width: 16px;
          height: 16px;
          border: ${selectedAllergens.includes("any") ? "1px solid var(--primary-color)" : "1px solid rgb(156 163 175 / var(--tw-border-opacity, 1))"};
          border-radius: 50%;
          // background-color: white;
          position: relative;
          cursor: pointer;
        }

        .custom-radio:checked {
          border-color: var(--primary-color);
          background-color: white;
        }

        .custom-radio:checked::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--primary-color);
        }

        .custom-radio:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};