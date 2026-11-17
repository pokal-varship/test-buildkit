import { TypesenseProduct } from "@services/typesense";
import { ProductResponse, Variant, Media, NutritionInfo, IngredientItem, LinkedModifier } from "@components/type/pdp.type";
import { ApiProductData } from "./combo.types";

// Constants
export const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.plateaway.com';

// Utility functions
export const processImageUrl = (rawUrl: string): string => {
  if (!rawUrl) return '';
  return rawUrl.startsWith('http') ? rawUrl : IMAGE_BASE_URL + rawUrl;
};

// Unified function to process any product data from API response
export const processProductData = (productData: ApiProductData, stepIndex: number = 0): TypesenseProduct => {
  const originalProductId = productData.productId || `step-${stepIndex}-${Date.now()}`;
  const variantId = productData.variantId || '';
  const uniqueProductId = variantId ? `${originalProductId}-${variantId}` : originalProductId;
  const productName = productData.name?.en || 'Product';
  const productMedia = productData.media || [];
  const productBasePrice = productData.basePrice || 0;
  const productDiscountedPrice = productData.discountedPrice || productBasePrice;
  const productCategorySlug = productData.productCategorySlug || '';
  const productCategoryName = typeof productData.productCategoryName === 'string' 
    ? productData.productCategoryName 
    : productData.productCategoryName?.en || '';
  const productRating = productData.rating || { average: 0, count: 0 };
  const productVariants = productData.variants || [];
  const productLinkedModifiers = productData.linkedModifiers || [];
  const productBestOffer = productData.bestOffer;
  
  // Process linked modifiers to match the expected structure
  const processedLinkedModifiers = productLinkedModifiers.map((modifierGroup: unknown) => {
    const group = modifierGroup as Record<string, unknown>;
    return {
      _id: group._id as string || group.id as string || '',
      id: group.id as string || group._id as string || '',
      name: group.name as { en: string } || { en: 'Modifier Group' },
      status: group.status as string || 'ACTIVE',
      displayOrder: group.displayOrder as number || 0,
      config: {
        min: (group.config as Record<string, unknown>)?.min as number || 0,
        max: (group.config as Record<string, unknown>)?.max as number || 1,
        isMandatory: (group.config as Record<string, unknown>)?.isMandatory as boolean || false,
        isMultiple: (group.config as Record<string, unknown>)?.isMultiple as boolean || false,
        allowHalfAndHalf: (group.config as Record<string, unknown>)?.allowHalfAndHalf as boolean || false,
        freeQuantity: (group.config as Record<string, unknown>)?.freeQuantity as number || 0
      },
      modifiers: ((group.modifiers as Record<string, unknown>[]) || []).map((modifier: Record<string, unknown>) => ({
        modifierId: modifier.modifierId as string || modifier._id as string || '',
        name: modifier.name as { en: string } || { en: 'Modifier' },
        sku: modifier.sku as string || '',
        status: modifier.status as string || 'ACTIVE',
        displayOrder: modifier.displayOrder as number || 0,
        price: modifier.price as number || 0,
        halfNHalfPrice: modifier.halfNHalfPrice as number || 0
      })),
      modifierGroupId: group.modifierGroupId as string || group.id as string || group._id as string || ''
    };
  });
  
  // Process ingredients and allergens properly
  const productIngredients = {
    dietaryInfo: productData.ingredients?.dietaryInfo || {
      containsDairy: false,
      containsEgg: false,
      containsFish: false,
      containsNuts: false,
      containsPeanuts: false,
      containsShellfish: false,
      containsSoy: false,
      containsWheat: false
    },
    items: productData.ingredients?.items || []
  };

  // Extract allergens from ingredients items
  const allergenItems = productIngredients.items?.filter((item) => item.isAllergenic) || [];
  const allergenNames = allergenItems.map((item) => item.name).filter(Boolean);
  
  // Generate description from ingredients
  const ingredients = productIngredients.items || [];
  const ingredientNames = ingredients.map((item) => item.name).filter(Boolean);
  const descriptionText = ingredientNames.length > 0 
    ? `Available with ${ingredientNames.join(', ')}`
    : (typeof productData.description === 'string' ? productData.description : productData.description?.en || '');
  
  // Add allergens array to ingredients for ProductCardList compatibility
  const ingredientsWithAllergens = {
    ...productIngredients,
    allergens: allergenNames
  };

  // Use dynamic product attributes
  const productAttributes = {
    containsMeat: productData.productAttributes?.containsMeat || false,
    glutenFree: productData.productAttributes?.glutenFree || false,
    spicy: productData.productAttributes?.spicy || false,
    vegan: productData.productAttributes?.vegan || false,
    vegetarian: productData.productAttributes?.vegetarian || false
  };

  // Use dynamic product type
  const productType = {
    allowHalfHalf: productData.type?.allowHalfHalf || false,
    canBeSoldIndependently: productData.type?.canBeSoldIndependently || true,
    category: productData.type?.category || 'REGULAR',
    hasModifiers: productData.type?.hasModifiers || false,
    hasVariants: productData.type?.hasVariants || false,
    isAlsoAProduct: productData.type?.isAlsoAProduct || false,
    isModifier: productData.type?.isModifier || false
  };

  // Extract calories from nutrition info or kcal field
  let productKcal = productData.kcal || "";
  if (productData.nutritionInfo?.values?.calories) {
    const caloriesValue = productData.nutritionInfo.values.calories;
    productKcal = typeof caloriesValue === 'string' ? parseFloat(caloriesValue) : Number(caloriesValue);
  }

  // Initialize nutrition values with all required properties
  const nutritionValues = {
    calories: 0,
    totalFat: 0,
    saturatedFat: 0,
    transFat: 0,
    cholesterol: 0,
    sodium: 0,
    dietaryFiber: 0,
    sugar: 0,
    protein: 0
  };

  const vitaminsAndMinerals = {
    vitaminA: 0,
    calcium: 0,
    iron: 0,
    potassium: 0
  };

  // Process nutrition values - only update if > 0
  if (productData.nutritionInfo?.values) {
    Object.entries(productData.nutritionInfo.values).forEach(([key, value]) => {
      const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
      if (numValue > 0 && key in nutritionValues) {
        nutritionValues[key as keyof typeof nutritionValues] = numValue;
      }
    });
  }

  // Process vitamins and minerals - only update if > 0
  if (productData.nutritionInfo?.vitaminsAndMinerals) {
    Object.entries(productData.nutritionInfo.vitaminsAndMinerals).forEach(([key, value]) => {
      const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
      if (numValue > 0 && key in vitaminsAndMinerals) {
        vitaminsAndMinerals[key as keyof typeof vitaminsAndMinerals] = numValue;
      }
    });
  }

  // Only create nutrition info if there are actual values
  const productNutritionInfo = Object.values(nutritionValues).some(val => val > 0) || Object.values(vitaminsAndMinerals).some(val => val > 0) ? {
    servingSize: productData.nutritionInfo?.servingSize || '1 serving',
    values: nutritionValues,
    vitaminsAndMinerals: vitaminsAndMinerals
  } : undefined;

  const productOverallRatings = {
    average: productData.overallRatings?.average || productRating.average || 0,
    totalReview: productData.overallRatings?.totalReview || productRating.count || 0,
    starDistribution: productData.overallRatings?.starDistribution || {},
    percentages: productData.overallRatings?.percentages || {},
    verifiedStatus: productData.overallRatings?.verifiedStatus || {
      verified: 0,
      average: 0
    }
  };

  return {
    id: uniqueProductId,
    productId: originalProductId,
    name: { en: productName },
    media: productMedia.map((mediaItem) => ({
      type: 'image',
      url: processImageUrl(mediaItem.url),
      _id: '',
      metadata: {
        displayOrder: 0,
        thumbnail: mediaItem.url,
        isPrimary: true
      }
    })),
    basePrice: productBasePrice,
    discountedPrice: productDiscountedPrice,
    description: { en: descriptionText },
    productCategorySlug: productCategorySlug,
    productCategoryName: { en: productCategoryName },
    seo: {
      description: '',
      slug: '',
      title: '',
      urlManagement: {
        canonicalUrl: '',
        currentUrl: '',
        customSlug: ''
      }
    },
    accountId: productData.accountId || '',
    linkedMenus: [],
    calculatedPrice: {
      withTax: productDiscountedPrice,
      withoutTax: productDiscountedPrice,
      taxAmount: 0,
      updatedAt: Date.now()
    },
    rating: productRating,
    sku: productData.sku || '',
    slug: productData.slug || '',
    status: productData.status || 'active',
    storefrontId: productData.storefrontId || '',
    productCategoryId: productData.productCategoryId || originalProductId,
    productAttributes: productAttributes,
    ingredients: ingredientsWithAllergens,
    nutritionInfo: productNutritionInfo as unknown as NutritionInfo,
    overallRatings: productOverallRatings,
    type: productType,
    taxConfig: {
      taxCode: '',
      taxInclusive: false
    },
    displayOrder: productData.displayOrder || 0,
    createdAt: productData.createdAt || Date.now(),
    lastModifiedAt: productData.lastModifiedAt || Date.now(),
    group: productData.group || [],
    linkedModifiers: processedLinkedModifiers,
    variantAttributes: productData.variantAttributes || {},
    variants: productVariants,
    bestOffer: productBestOffer,
    kcal: productKcal,
    originalIndex: undefined // Will be set by ComboFlow
  } as unknown as TypesenseProduct;
};

// Helper function to convert variant nutrition info to proper type
const convertVariantNutritionInfo = (variantNutritionInfo: unknown): NutritionInfo | null => {
  if (!variantNutritionInfo) return null;
  
  const nutritionValues = {
    calories: 0,
    totalFat: 0,
    saturatedFat: 0,
    transFat: 0,
    cholesterol: 0,
    sodium: 0,
    dietaryFiber: 0,
    sugar: 0,
    protein: 0
  };
  
  const vitaminsAndMinerals = {
    vitaminA: 0,
    calcium: 0,
    iron: 0,
    potassium: 0
  };

  // Process nutrition values - convert strings to numbers
  if (variantNutritionInfo && typeof variantNutritionInfo === 'object' && 'values' in variantNutritionInfo) {
    const values = (variantNutritionInfo as Record<string, unknown>).values;
    if (values && typeof values === 'object') {
      Object.entries(values).forEach(([key, value]) => {
        const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
        if (!isNaN(numValue) && key in nutritionValues) {
          nutritionValues[key as keyof typeof nutritionValues] = numValue;
        }
      });
    }
  }

  // Process vitamins and minerals - convert strings to numbers
  if (variantNutritionInfo && typeof variantNutritionInfo === 'object' && 'vitaminsAndMinerals' in variantNutritionInfo) {
    const vitamins = (variantNutritionInfo as Record<string, unknown>).vitaminsAndMinerals;
    if (vitamins && typeof vitamins === 'object') {
      Object.entries(vitamins).forEach(([key, value]) => {
        const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
        if (!isNaN(numValue) && key in vitaminsAndMinerals) {
          vitaminsAndMinerals[key as keyof typeof vitaminsAndMinerals] = numValue;
        }
      });
    }
  }

  return {
    servingSize: (variantNutritionInfo as Record<string, unknown>)?.servingSize as string || '1 serving',
    values: nutritionValues,
    vitaminsAndMinerals: vitaminsAndMinerals
  };
};

// Unified function to create ProductResponse
export const createProductResponse = (product: TypesenseProduct): ProductResponse => {
  // Initialize nutritionValues with all required properties set to 0
  const nutritionValues = {
    calories: 0,
    totalFat: 0,
    saturatedFat: 0,
    transFat: 0,
    cholesterol: 0,
    sodium: 0,
    dietaryFiber: 0,
    sugar: 0,
    protein: 0
  };
  
  const vitaminsAndMinerals = {
    vitaminA: 0,
    calcium: 0,
    iron: 0,
    potassium: 0
  };

  // Process nutrition values - update with non-zero values
  if (product.nutritionInfo?.values) {
    Object.entries(product.nutritionInfo.values).forEach(([key, value]) => {
      const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
      if (numValue > 0 && key in nutritionValues) {
        nutritionValues[key as keyof typeof nutritionValues] = numValue;
      }
    });
  }

  // Process vitamins and minerals - only update if > 0
  if (product.nutritionInfo?.vitaminsAndMinerals) {
    Object.entries(product.nutritionInfo.vitaminsAndMinerals).forEach(([key, value]) => {
      const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
      if (numValue > 0 && key in vitaminsAndMinerals) {
        vitaminsAndMinerals[key as keyof typeof vitaminsAndMinerals] = numValue;
      }
    });
  }

  // Only create nutrition info if there are actual values
  const productNutritionInfo: NutritionInfo | undefined = Object.values(nutritionValues).some(val => val > 0) || Object.values(vitaminsAndMinerals).some(val => val > 0) ? {
    servingSize: product.nutritionInfo?.servingSize || '1 serving',
    values: nutritionValues,
    vitaminsAndMinerals: vitaminsAndMinerals
  } : undefined;

  const productOverallRatings = {
    average: product.overallRatings?.average || product.rating?.average || 0,
    totalReview: product.overallRatings?.totalReview || product.rating?.count || 0,
    starDistribution: (product.overallRatings as unknown as Record<string, unknown>)?.starDistribution as Record<string, number> || {},
    percentages: (product.overallRatings as unknown as Record<string, unknown>)?.percentages as Record<string, number> || {},
    verifiedStatus: product.overallRatings?.verifiedStatus || {
      verified: 0,
      average: 0
    }
  };

  const productDietaryInfo = product.ingredients?.dietaryInfo || {
    containsDairy: false,
    containsEgg: false,
    containsFish: false,
    containsNuts: false,
    containsPeanuts: false,
    containsShellfish: false,
    containsSoy: false,
    containsWheat: false
  };

  const productType = {
    category: product.type?.category || 'REGULAR',
    allowHalfHalf: product.type?.allowHalfHalf || false,
    canBeSoldIndependently: product.type?.canBeSoldIndependently || true,
    hasModifiers: product.type?.hasModifiers || false,
    hasVariants: product.type?.hasVariants || false,
    isAlsoAProduct: product.type?.isAlsoAProduct || false,
    isModifier: product.type?.isModifier || false
  };

  const productAttributes = {
    containsMeat: product.productAttributes?.containsMeat || false,
    glutenFree: product.productAttributes?.glutenFree || false,
    spicy: product.productAttributes?.spicy || false,
    vegan: product.productAttributes?.vegan || false,
    vegetarian: product.productAttributes?.vegetarian || false
  };

  // Create dynamic variant based on product data with proper variant attributes
  const variantAttributes = product.variantAttributes || {};
  const variantAttributesArray = Object.entries(variantAttributes).map(([name, value]) => ({
    name,
    value: String(value)
  }));
  
  const dynamicVariant: Variant = {
    _id: product.variants?.[0]?._id || `${product.id}-default-variant`,
    sku: product.variants?.[0]?.sku || product.sku || 'default',
    attributes: variantAttributesArray.length > 0 ? variantAttributesArray : product.variants?.[0]?.attributes || [{ 
      name: 'Size', 
      value: 'Regular' 
    }],
    basePrice: product.variants?.[0]?.basePrice || product.basePrice || 0,
    discountedPrice: product.variants?.[0]?.discountedPrice || product.discountedPrice || 0,
    nutritionInfo: convertVariantNutritionInfo(product.variants?.[0]?.nutritionInfo) || productNutritionInfo || {
      servingSize: '1 serving',
      values: { calories: 0, totalFat: 0, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 0, dietaryFiber: 0, sugar: 0, protein: 0 },
      vitaminsAndMinerals: { vitaminA: 0, calcium: 0, iron: 0, potassium: 0 }
    },
    linkedModifiers: (product.linkedModifiers || []) as unknown as LinkedModifier[],
    bestOffer: product.variants?.[0]?.bestOffer || product.bestOffer
  };

  // Convert media to proper Media type
  const mediaItems: Media[] = (product.media || []).map((mediaItem) => ({
    value: mediaItem.url,
    _id: mediaItem._id || '',
    type: mediaItem.type || 'image',
    url: mediaItem.url,
    metadata: {
      displayOrder: mediaItem.metadata?.displayOrder || 0,
      thumbnail: mediaItem.metadata?.thumbnail,
      isPrimary: mediaItem.metadata?.isPrimary
    }
  }));

  // Convert ingredients items to proper IngredientItem type
  const ingredientItems: IngredientItem[] = (product.ingredients?.items || []).map((item) => ({
    name: item.name || '',
    isAllergenic: item.isAllergenic || false,
    allergenSeverity: (item.allergenSeverity as 'High' | 'Medium' | 'Low') || 'Low',
    isRemovable: item.isRemovable || false
  }));

  return {
    status: 'success',
    message: 'Product loaded successfully',
    totalCount: 1,
    data: {
      id: product.id,
      name: typeof product.name === 'string' ? product.name : product.name?.en || '',
      description: typeof product.description === 'string' ? product.description : product.description?.en || '',
      media: mediaItems,
      basePrice: product.basePrice || 0,
      discountedPrice: product.discountedPrice || 0,
      productCategorySlug: product.productCategorySlug || '',
      productCategoryName: typeof product.productCategoryName === 'string' ? product.productCategoryName : product.productCategoryName?.en || '',
      productCategoryId: product.id,
      customSlug: product.seo?.urlManagement?.customSlug || product.slug || '',
      seo: {
        urlManagement: {
          customSlug: product.seo?.urlManagement?.customSlug || product.slug || ''
        }
      },
      variants: product.variants && product.variants.length > 0 ? product.variants as unknown as Variant[] : [dynamicVariant],
      linkedModifiers: (product.linkedModifiers || []) as unknown as LinkedModifier[],
      nutritionInfo: productNutritionInfo || {
        servingSize: '1 serving',
        values: { calories: 0, totalFat: 0, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 0, dietaryFiber: 0, sugar: 0, protein: 0 },
        vitaminsAndMinerals: { vitaminA: 0, calcium: 0, iron: 0, potassium: 0 }
      },
      overallRatings: productOverallRatings,
      parameterAverages: [],
      productAttributes: productAttributes,
      ingredients: {
        dietaryInfo: productDietaryInfo,
        items: ingredientItems
      },
      type: productType
    }
  };
};