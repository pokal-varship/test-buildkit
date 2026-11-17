// Utility to map combo API response to ComboOption[]

// API Response interfaces
interface ComboApiMedia {
  url: string;
}

interface ComboApiProduct {
  productId: string;
  productCategoryName?: {
    en: string;
  };
  productCategorySlug?: string;
  basePrice: number;
  discountedPrice: number;
  name?: {
    en: string;
  };
  media?: ComboApiMedia[];
  seo?: {
    urlManagement?: {
      customSlug?: string;
    };
  };
}

interface ComboApiGroupDetail {
  name?: {
    en: string;
  };
  media?: ComboApiMedia[];
}

interface ComboApiGroup {
  name: string;
  groupDetails: ComboApiGroupDetail[];
}

export interface ComboApiResponse {
  id: string;
  basePrice: number;
  discountedPrice: number;
  primaryProduct: ComboApiProduct;
  group?: ComboApiGroup[];
}

export interface ComboOption {
  id: string;
  type: 'single' | 'combo';
  title: string;
  price: number;
  discountedPrice: number;
  savings?: number | null;
  primaryProduct: {
    image: string;
    name: string;
    customSlug?: string;
    productCategorySlug?: string;
    productCategoryName?: string; // Add category name
  };
  groupDetails?: Array<{
    image: string;
    name: string;
    categoryName?: string; // Add category name for group details
  }>;
}

export function mapComboApiToOptions(comboData: ComboApiResponse, imageBaseUrl: string): ComboOption[] {
  const primaryProduct = comboData.primaryProduct;
  const groups = comboData.group || [];
  
  // Start with the single product option
  const options: ComboOption[] = [
    {
      id: primaryProduct.productId,
      type: 'single',
      title: primaryProduct.name?.en || '',
      price: primaryProduct.basePrice,
      discountedPrice: primaryProduct.discountedPrice || primaryProduct.basePrice,
      savings: primaryProduct.discountedPrice ? (primaryProduct.basePrice - primaryProduct.discountedPrice) : 0,
      primaryProduct: {
        image: primaryProduct.media?.[0]?.url
          ? (primaryProduct.media[0].url.startsWith('http')
              ? primaryProduct.media[0].url
              : imageBaseUrl + primaryProduct.media[0].url)
          : '',
        name: primaryProduct.name?.en || '',
        customSlug: primaryProduct.seo?.urlManagement?.customSlug,
        productCategorySlug: primaryProduct.productCategorySlug,
        productCategoryName: primaryProduct.productCategoryName?.en || '',
      },
    }
  ];

  // Create a combined combo option with first item from each group
  if (groups.length > 0) {
    const combinedGroupDetails: Array<{ image: string; name: string; categoryName?: string }> = [];
    
    // Add first item from each group
    groups.forEach((group) => {
      const firstItem = group.groupDetails?.[0];
      if (firstItem) {
        combinedGroupDetails.push({
          image: firstItem.media?.[0]?.url
            ? (firstItem.media[0].url.startsWith('http') ? firstItem.media[0].url : imageBaseUrl + firstItem.media[0].url)
            : '',
          name: firstItem.name?.en || '',
          categoryName: group.name, // Use group name as category name
        });
      }
    });
    
    // Add the combined combo option
    if (combinedGroupDetails.length > 0) {
      options.push({
        id: `${comboData.id}-combined`,
        type: 'combo',
        title: groups.map(group => group.name).join(' + '), // Combine group names like "Beverages + Deserts"
        price: comboData.basePrice,
        discountedPrice: comboData.discountedPrice,
        savings: (comboData.basePrice - comboData.discountedPrice),
        primaryProduct: {
          image: primaryProduct.media?.[0]?.url
            ? (primaryProduct.media[0].url.startsWith('http')
                ? primaryProduct.media[0].url
                : imageBaseUrl + primaryProduct.media[0].url)
            : '',
          name: primaryProduct.name?.en || '',
          customSlug: primaryProduct.seo?.urlManagement?.customSlug,
          productCategorySlug: primaryProduct.productCategorySlug,
          productCategoryName: primaryProduct.productCategoryName?.en || '',
        },
        groupDetails: combinedGroupDetails,
      });
    }
  }

  return options;
} 