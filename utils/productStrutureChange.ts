import { Ingredients, LinkedModifier, Media, ModifierGroup, NutritionInfo, ProductResponse, Variant } from "@components/type/pdp.type";
import { NutritionInfoTS, TypesenseProduct } from "@services/typesense";

export const mapTypesenseProductToProductResponse = (product: TypesenseProduct): ProductResponse => {
    const convertNutritionInfo = (nutritionInfo: NutritionInfoTS): NutritionInfo => ({
      servingSize: nutritionInfo?.servingSize,
      values: {
        calories: Number(nutritionInfo?.values?.calories),
        totalFat: Number(nutritionInfo?.values?.totalFat),
        saturatedFat: Number(nutritionInfo?.values?.saturatedFat),
        transFat: Number(nutritionInfo?.values?.transFat),
        cholesterol: Number(nutritionInfo?.values?.cholesterol),
        sodium: Number(nutritionInfo?.values?.sodium),
        dietaryFiber: Number(nutritionInfo?.values?.dietaryFiber),
        sugar: Number(nutritionInfo?.values?.sugar),
        protein: Number(nutritionInfo?.values?.protein),
        totalCarbohydrate: Number(nutritionInfo?.values?.totalCarbohydrate),
      },
      vitaminsAndMinerals: {
        vitaminA: Number(nutritionInfo?.vitaminsAndMinerals?.vitaminA),
        calcium: Number(nutritionInfo?.vitaminsAndMinerals?.calcium),
        iron: Number(nutritionInfo?.vitaminsAndMinerals?.iron),
        potassium: Number(nutritionInfo?.vitaminsAndMinerals?.potassium),
      },
    });
  
    const convertIngredients = (product: TypesenseProduct): Ingredients => ({
      items: product?.ingredients?.items?.map(item => ({
        name: item?.name,
        isAllergenic: item?.isAllergenic,
        allergenSeverity: item?.allergenSeverity as 'High' | 'Medium' | 'Low',
        isRemovable: item?.isRemovable,
      })),
      dietaryInfo: {
        containsEgg: product?.ingredients?.dietaryInfo?.containsEgg,
        containsDairy: product?.ingredients?.dietaryInfo?.containsDairy,
        containsNuts: product?.ingredients?.dietaryInfo?.containsNuts,
        containsShellfish: product?.ingredients?.dietaryInfo?.containsShellfish,
        containsSoy: product?.ingredients?.dietaryInfo?.containsSoy,
        containsWheat: product?.ingredients?.dietaryInfo?.containsWheat,
        containsPeanuts: product?.ingredients?.dietaryInfo?.containsPeanuts,
        containsFish: product?.ingredients?.dietaryInfo?.containsFish,
      },
    });
  
    const convertMedia = (): Media[] =>
      (product?.media || [])?.map((m) => ({
        value: m?.url || '', // Adding the required value property
        _id: m._id,
        type: m?.type,
        url: m?.url,
        metadata: m.metadata,
      }));
    
    const convertModifiers = (groups: ModifierGroup[]): LinkedModifier[] => {
    return groups.map(group => ({
        id: group.id,
        _id: group._id,
        modifierGroupId: group.id,
        name: { en: group.name?.en || '' },
        status: 'ACTIVE',
        displayOrder: 0,
        config: {
        min: group.config.min,
        max: group.config.max,
        isMandatory: group.config.isMandatory,
        isMultiple: group.config.max > 1,
        allowHalfAndHalf: false,
        freeQuantity: 0,
        },
        modifiers: group.modifiers.map(mod => ({
        modifierId: mod.modifierId,
        name: { en: mod.name?.en || '' },
        sku: mod.sku || '',
        status: 'ACTIVE',
        displayOrder: 0,
        price: mod.price,
        halfNHalfPrice: 0,
        })),
    }));
    };
    const convertVariants = (): Variant[] => {
        if (!product.variants) return [];
        return product.variants.map((variant) => ({
            _id: variant._id,
            sku: variant.sku || '',
            attributes: variant.attributes.map(attr => ({
                name: attr.name,
                value: attr.value,
            })),
            bestOffer: variant.bestOffer,
            basePrice: variant.basePrice,
            discountedPrice: variant.discountedPrice,
            nutritionInfo: convertNutritionInfo(variant.nutritionInfo), // Assuming same nutrition for simplicity
            linkedModifiers: variant.linkedModifiers
            ? convertModifiers(variant.linkedModifiers)
            : [],
        }));
    };
    return {
      status: 'success',
      message: 'Product fetched successfully',
      totalCount: 1,
      data: {
        id: product?.productId,
        name: product?.name?.en,
        bestOffer: product?.bestOffer,
        description: product?.description?.en,
        productCategoryName: product?.productCategoryName?.en,
        productCategoryId: product?.productCategoryId,
        productCategorySlug: product?.productCategorySlug,
        customSlug: product?.seo?.urlManagement?.customSlug || product?.slug || '',
        seo: {
          urlManagement: {
            customSlug: product?.seo?.urlManagement?.customSlug || product?.slug || ''
          }
        },
        media: convertMedia(),
        basePrice: product?.basePrice,
        discountedPrice: product?.discountedPrice,
        ingredients: convertIngredients(product),
        nutritionInfo: convertNutritionInfo(product.nutritionInfo),
        variants: convertVariants(),
        linkedModifiers: product.linkedModifiers
            ? convertModifiers(product.linkedModifiers)
            : [],
        overallRatings: {
          average: product.overallRatings?.average || 0,
          totalReview: product.overallRatings?.totalReview || 0,
          starDistribution: (product.overallRatings as any)?.starDistribution || {},
          percentages: (product.overallRatings as any)?.percentages || {},
          verifiedStatus: {
            verified: product.overallRatings?.verifiedStatus?.verified || 0,
            average: product.overallRatings?.verifiedStatus?.average || 0,
          },
        },
        parameterAverages: (product as any).parameterAverages || [],
      },
    };
  };