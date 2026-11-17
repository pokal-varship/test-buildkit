import React, { FC, useState, useMemo } from 'react';
import DietaryInfo from './DietaryInfo';
import Nutrition from './Nutrition';
import Ingredients from './Ingredients';
import useLang from '@hooks/useLang';
import useIsMobile from '@hooks/useIsMobile';
import { LanguageCode, TranslationKeys } from 'types';
import { ProductResponse, Variant } from '@components/type/pdp.type';
import { getTenantConfig } from '@config/tenant.config';

// Export function to check if there's any data to display
export const hasTabData = (productData: ProductResponse | null, selectedVariant: Variant | null, calories?: number | null): boolean => {
    const { showPdpProductTabs } = getTenantConfig();
    if (!showPdpProductTabs) return false;

    if (!productData?.data) return false;

    const { showCaloriesInfo } = getTenantConfig();

    // Check DietaryInfo data
    const cal = calories !== undefined ? calories : (selectedVariant ? selectedVariant?.nutritionInfo?.values?.calories : productData?.data?.nutritionInfo?.values?.calories);
    const hasEnergy = showCaloriesInfo && cal && typeof cal === 'number';
    const dietaryKeys = Object.entries(productData?.data?.ingredients?.dietaryInfo || {})?.filter(([, value]) => value)?.length > 0;
    const hasAllergens = productData?.data?.ingredients?.items?.some((item) => item.isAllergenic);
    const hasDietaryInfo = hasEnergy || dietaryKeys || hasAllergens;

    // Check Ingredients data
    const hasIngredients = !!(productData?.data?.ingredients?.items?.length > 0);

    // Check Nutrition data
    const shouldUseProductNutrition = !selectedVariant || !productData?.data?.type?.hasVariants;
    const nutritionValues = shouldUseProductNutrition ? productData?.data?.nutritionInfo?.values || {} : selectedVariant?.nutritionInfo?.values || {};
    const vitamins = shouldUseProductNutrition ? productData?.data?.nutritionInfo?.vitaminsAndMinerals || {} : selectedVariant?.nutritionInfo?.vitaminsAndMinerals || {};
    const hasNutritionValues = Object.entries(nutritionValues).some(([name, value]) => {
        if (!value) return false;
        if (!showCaloriesInfo && name === 'calories') return false;
        return true;
    });
    const hasVitamins = Object.values(vitamins).some(value => !!value);
    const hasNutrition = hasNutritionValues || hasVitamins;

    return hasDietaryInfo || hasIngredients || hasNutrition;
};

type TabChangeProps = {
    productData: ProductResponse | null,
    selectedVariant: Variant | null
}
const TabChange: FC<TabChangeProps> = ({ productData, selectedVariant }) => {
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const isMobile = useIsMobile();
    const { showPdpProductTabs } = getTenantConfig();
    const tabs = [{ id: 1, label: lang.dietaryInfo }, { id: 2, label: lang.ingredients }, { id: 3, label: lang.nutrition }];
    const [activeTab, setActiveTab] = useState(1);

    // Check if there's any data to display
    const calories = selectedVariant ? selectedVariant?.nutritionInfo?.values?.calories : productData?.data?.nutritionInfo?.values?.calories;
    const hasData = useMemo(() => {
        return hasTabData(productData, selectedVariant, calories);
    }, [productData, selectedVariant, calories]);

    if (!showPdpProductTabs) {
        return null;
    }

    // Don't render if there's no data - only on mobile view
    if (isMobile && !hasData) {
        return null;
    }

    return (
        <div className="w-full">
            <div className=" w-full justify-between mb-6 hidden md:flex">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`py-[15px] w-full text-sm ${activeTab === tab.id ? 'border-b-2 font-semibold  border-[var(--primary-text-light)] ' : 'border-bottom'
                            }`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="w-full mt-6 hidden md:block">
                {activeTab === 1 && <DietaryInfo productData={productData} selectedVariant={selectedVariant} />}
                {activeTab === 2 && <Ingredients productData={productData} />}
                {activeTab === 3 && <Nutrition productData={productData} selectedVariant={selectedVariant} />}
            </div>



            <div className="w-full md:hidden flex flex-col gap-5">
                <DietaryInfo productData={productData} selectedVariant={selectedVariant} />
                <Ingredients productData={productData} />
                <Nutrition productData={productData} selectedVariant={selectedVariant} />
            </div>
            <style>{`
                .border-bottom{
                    border-bottom: 1px solid #EEE8D980;
                }`}
            </style>
        </div>
    );
};

export default TabChange;