'use client';
import { useState, useEffect, useCallback } from 'react';
import { getStoreProducts } from '@services/storePage';

interface Product {
    basePrice: number;
    categoryId: string;
    description: string;
    discountedPrice: number;
    id: string;
    mediaUrl: string;
    name: string;
    promotion: string;
    nutritionalInfo :{
        values: {
        calories?: number;
        };
    }
}

interface UseStoreProductsResult {
    products: Product[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage store products
 * @param menuId The ID of the menu to fetch products for
 * @param categoryId The ID of the category to fetch products for
 * @returns Products data and status
 */
const useStoreProducts = (menuId: string, categoryId: string, selectedCat: string): UseStoreProductsResult => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        if (!menuId || !categoryId) return;

        try {
            setLoading(true);
            const productsData = await getStoreProducts(menuId, selectedCat ? selectedCat : categoryId);
            setProducts(productsData);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Failed to fetch store products';

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [menuId, categoryId, selectedCat]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts, selectedCat]);

    return {
        products,
        loading,
        error,
        refetch: fetchProducts
    };
};

export default useStoreProducts;