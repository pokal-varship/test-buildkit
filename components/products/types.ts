export interface NutritionalInfo {
    values: {
        calories?: number; // Optional, as it may not always be present
        // Add other nutritional properties as needed
    };
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  allergens: string[];
  calories: number;
  nutritionalInfo?: NutritionalInfo;
  image: string;
  promotion: string;
}