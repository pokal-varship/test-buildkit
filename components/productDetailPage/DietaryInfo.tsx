import React, { FC, useMemo } from 'react'
import { ProductResponse, Variant } from '@components/type/pdp.type'
import useLang from "@hooks/useLang";
import { TranslationKeys, LanguageCode } from "types";
import NoNutritionData from '@components/ui/NoNutritionData';
import { getTenantConfig } from '@config/tenant.config';

type DietaryInfoProps = {
  productData: ProductResponse | null;
  selectedVariant: Variant | null
}
const DietaryInfo: FC<DietaryInfoProps> = ({ productData, selectedVariant }) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const { showCaloriesInfo } = getTenantConfig();
  const dietaryInfo = useMemo(() => {
    const dietaryKeys = Object.entries(productData?.data?.ingredients?.dietaryInfo || {})?.filter(([, value]) => value)?.map(([key]) =>
      key
        .replace('contains', '')
        .replace(/([A-Z])/g, ' $1')
        .trim()
    )
      .map(k => k.charAt(0).toUpperCase() + k.slice(1));

    // Get allergenic item names
    const allergenNames = productData?.data?.ingredients?.items?.filter((item) => item.isAllergenic)?.map((item) => `${item.name} (${item.allergenSeverity})`)
      .join(', ');

    const shouldUseProductNutrition = !selectedVariant || !productData?.data?.type?.hasVariants;
    const calories = shouldUseProductNutrition
      ? productData?.data?.nutritionInfo?.values?.calories
      : selectedVariant?.nutritionInfo?.values?.calories;
    const energyValue = showCaloriesInfo && calories && typeof calories === 'number'
      ? `${calories} kcal / ${(calories * 4.184).toFixed(1)} kJ`
      : '';
    return [
      {
        id: 1,
        title: 'Energy',
        value: energyValue,
      },
      {
        id: 2,
        title: 'Contains',
        value: dietaryKeys.join(', ') || '',
      },
      {
        id: 3,
        title: 'Allergens',
        value: allergenNames || '',
      },
    ].filter((info) => info.value.trim() !== '');
  }, [productData, selectedVariant, showCaloriesInfo]);

  const hasData = dietaryInfo.length > 0;

  return (
    <>
      {!hasData ? (
        // Show NoNutritionData only on desktop when there's no data
        <div className='hidden md:flex justify-center'>
          <NoNutritionData 
            title={lang.noDietaryInfoTitle} 
            description={lang.noDietaryInfoDescription} 
          />
        </div>
      ) : (
        // Show dietary info data when available
        <div className={`small-font flex flex-col gap-2 md:gap-5 mt-0 md:mt-0 md:border-none md:pb-0`}>
          <div className={`border-b border-[var(--rating-border-primary)] md:border-none flex flex-col gap-2 pb-3 md:pb-0 md:pl-0`}>
            <h2 className='description-font font-600 md:hidden mb-2'>{lang.dietaryInfo}</h2>
            {
              dietaryInfo.map((info) => (
                <div key={info.id} className="flex items-start mb-2 gap-8">
                  <span className="font-600 small-font w-16 md:w-[25%] ">{info.title}</span>
                  <p className='small-font md:w-[75%] '>{info.value}</p>
                </div>
              ))
            }
          </div>
        </div>
      )}
      <style>
        {`
      .small-font{
        font-size: var(--small-font);
      }
        .description-font{
          font-size: var(--description-font);
        }
        .font-600{
          font-weight: var(--font-semi-bold);
        }
    `}
      </style>
    </>
  )

}

export default DietaryInfo