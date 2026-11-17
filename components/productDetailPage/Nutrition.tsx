import React, { FC, useMemo } from 'react'
import dynamic from "next/dynamic";
import { ProductResponse, Variant } from '@components/type/pdp.type'
import useLang from "@hooks/useLang";
import { TranslationKeys, LanguageCode } from "types";
import { getTenantConfig } from "@config/tenant.config";

const NoNutritionData = dynamic(() => import('@components/ui/NoNutritionData'));

type NutritionProps = {
    selectedVariant: Variant | null;
    productData: ProductResponse | null
}
const Nutrition: FC<NutritionProps> = ({ selectedVariant, productData }) => {
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const { showCaloriesInfo } = getTenantConfig();
    const nutrition = useMemo(() => {
        const shouldUseProductNutrition = !selectedVariant || !productData?.data?.type?.hasVariants;
        const values = shouldUseProductNutrition ? productData?.data.nutritionInfo?.values || {} : selectedVariant?.nutritionInfo?.values || {};
        const vitamins = shouldUseProductNutrition ? productData?.data.nutritionInfo?.vitaminsAndMinerals || {} : selectedVariant?.nutritionInfo?.vitaminsAndMinerals || {};


        const fromValues = Object.entries(values)?.filter(([name, value]) => {
            if (!value) return false;
            if (!showCaloriesInfo && name === 'calories') return false;
            return true;
        })?.map(([name, value]) => {
            let unit = 'g';
            if (name === 'calories') unit = 'kcal';
            if (!!value) return {
                name: name?.charAt(0)?.toUpperCase() + name?.slice(1),
                value: `${value} ${unit}`,
            };
        });

        const fromVitamins = Object.entries(vitamins)?.filter(([, value]) => !!value)?.map(([name, value]) => {
            if (!!value) return {
                name: name?.charAt(0)?.toUpperCase() + name?.slice(1),
                value: `${value} mcg`,
            }
        });

        return [...fromValues, ...fromVitamins].filter(itm => !!itm);
    }, [selectedVariant, productData, showCaloriesInfo]);

    const mid = Math.ceil(nutrition.length / 2);
    const leftColumn = nutrition.slice(0, mid);
    const rightColumn = nutrition.slice(mid);

    const NutritionRow = ({ item }: { item: { name: string; value: string } }) => (
        <div className='w-full flex items-center justify-between'>
            <h2 className='font-500 heading-6 flex-1 min-w-0'>{item?.name}</h2>
            <p className='heading-6 text-right shrink-0 ml-2'>{item?.value}</p>
        </div>
    );

    return (
        <>
            {/* Mobile view - only show if there is data */}
            {nutrition.length > 0 && (
                <div className='w-full flex flex-col gap-5 md:hidden pl-0'>
                    <div className={`flex flex-col gap-3 border-b border-[var(--rating-border-primary)] pb-5`}>
                        <h2 className='description-font font-600'>{lang.nutrition}</h2>
                        <div className='grid grid-cols-2 gap-5'>
                            <div className='flex flex-col gap-3'>
                                {leftColumn.map((item, index) => (
                                    <NutritionRow key={index} item={item} />
                                ))}
                            </div>
                            <div className='flex flex-col gap-3'>
                                {rightColumn.map((item, index) => (
                                    <NutritionRow key={mid + index} item={item} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Desktop view - show always (with NoNutritionData when empty) */}
            <div className='w-full hidden md:flex flex-col gap-5 md:gap-0 pl-0'>
                {(nutrition.length < 1) ? (
                    <NoNutritionData 
                      title={lang.noNutritionDataTitle} 
                      description={lang.noNutritionDataDescription} 
                    />
                ) : (
                    <div className={`flex flex-col gap-4 mt-0 md:border-none`}>
                        {nutrition.map((item, index) => (
                            <div key={index} className='w-full flex items-center justify-between'>
                                <h2 className='font-600 text-sm w-2/3'>{item?.name}</h2>
                                <p className='text-sm w-1/3 text-right'>{item?.value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style>
                {`
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

export default Nutrition;