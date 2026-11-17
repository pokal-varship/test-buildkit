import React, { FC, useMemo } from 'react'
import { ProductResponse } from '@components/type/pdp.type'
import useLang from "@hooks/useLang";
import { TranslationKeys, LanguageCode } from "types";
import NoNutritionData from '@components/ui/NoNutritionData';

type IngredientsProps = {
  productData: ProductResponse | null
}
const Ingredients: FC<IngredientsProps> = ({ productData }) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const dietaryInfo = useMemo(() => {
    const allIngredients = productData?.data?.ingredients?.items?.map((item) => item.name)?.join(', ');
    return [
      {
        id: 1,
        title: 'Items',
        value: allIngredients || '',
      },
    ];
  }, [productData]);

  const hasData = !!dietaryInfo?.[0]?.value;

  return (
    <>
      {!hasData ? (
        // Show NoNutritionData only on desktop when there's no data
        <div className='hidden md:flex justify-center'>
          <NoNutritionData 
            title={lang.noIngredientsTitle} 
            description={lang.noIngredientsDescription} 
          />
        </div>
      ) : (
        // Show ingredients data when available
        <div className={`small-font flex flex-col gap-5  md:pl-0 md:pb-0`}>
          {dietaryInfo.map((info) => (
            <div key={info.id} className={`flex flex-col gap-2 md:flex-row  md:gap-8 border-b border-[var(--rating-border-primary)] md:mt-0 pb-5 md:border-none`}>
              <h2 className='description-font font-600 md:hidden'>{lang.ingredients}</h2>
              <h2 className="font-600 small-font  hidden md:block md:w-[25%] break-all">{info.title}</h2>
              <p className='small-font md:w-[75%]'>{info.value}</p>
            </div>
          ))}
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

export default Ingredients