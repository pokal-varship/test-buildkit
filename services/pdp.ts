import axiosClient from "./axios";
import { ADD_TO_CART_ENDPOINT, PRODUCT_DETAILS_ENDPOINT, PRODUCT_REVIEWS_ENDPOINT } from "@config/api.config";
import { AddToCartPayload, AddToCartResponse, PatchCartPayload, ProductResponse, ReviewResponse, GetProductRatingsAndReviewsArgs, Review } from "@components/type/pdp.type";
import { DEFAULT_TENANT_ID } from "./typesense";
import { getLocationHeader } from "@lib/utils/location";
import { applyRetailStorefrontPricesToProductResponse } from "../utils/retailStorefrontPricing";

export const getProductDetails = async (categoryId: string ,productId: string, storeId: string): Promise<ProductResponse> => {
  const locationHeader = await getLocationHeader('get-product-details');
    try {
        const response = await axiosClient.get(PRODUCT_DETAILS_ENDPOINT, {
            params: {
                categorySlug: categoryId,
                productSlug: productId,
                storeSlug: storeId
            },
            headers: {
                "X-User-Location": locationHeader,
            }
        });
        // Retail/Grocery only: map unitPrice/salesPrice → basePrice/discountedPrice
        // Restaurant/Laundry: identity (unchanged response)
        return (
          applyRetailStorefrontPricesToProductResponse(response.data) ??
          response.data
        );
    } catch (error) {

        throw error;
    }
};

export const addToCart = async (
    storeId: string,
    payload: AddToCartPayload
  ): Promise<AddToCartResponse> => {
    try {
      // Get dynamic user location data
      const locationHeader = await getLocationHeader('add-to-cart');
      const response = await axiosClient.post(
        ADD_TO_CART_ENDPOINT,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "Store-Id": storeId,
            "Tenant-Id": DEFAULT_TENANT_ID,
            "X-User-Location": locationHeader,
          },
        }
      );
      return response.data;
    } catch (error) {

      throw error;
    }
  };

  export const patchCart = async (
    storeId: string,
    payload: PatchCartPayload
  ): Promise<AddToCartResponse> => {
    try {
      // Get dynamic user location data
      const locationHeader = await getLocationHeader('patch-cart');
      
      const response = await axiosClient.patch(
        ADD_TO_CART_ENDPOINT,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "Store-Id": storeId,
            "Tenant-Id": DEFAULT_TENANT_ID,
            "X-User-Location": locationHeader,
          },
        }
      );
      return response.data;
    } catch (error) {

      throw error;
    }
  };

  export const getProductReviews = async (productId: string,status:number): Promise<ReviewResponse> => {
    try {
      const response = await axiosClient.get(`${PRODUCT_REVIEWS_ENDPOINT}`, {
        params: {
          product_id: productId,
          status: status,
        },
      });
      return response.data;
    } catch (error) {

      throw error;
    }
  };

export const getProductRatingsAndReviews = async ({
  productId,
  storeId,
  tenantId,
  page = 1,
  limit = 10,
  isProductReview = 1,
}: GetProductRatingsAndReviewsArgs) => {
  try {
    const response = await axiosClient.get(
      PRODUCT_REVIEWS_ENDPOINT,
      {
        params: {
          product_id: productId,
          page,
          limit,
          is_product_review: isProductReview,
        },
        headers: {
          "Tenant-Id": tenantId,
          "Store-Id": storeId,
        },
      }
    );
    return response.data;
  } catch (error) {

    throw error;
  }
};

export const fetchAllProductReviews = async (
  productId: string,
  storeId: string,
  limit = 100
) => {
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || '';
  const token = process.env.NEXT_PUBLIC_API_TOKEN || '';
  let page = 1;
  const allReviews: Review[] = [];

  while (true) {
    const response = await getProductRatingsAndReviews({
      productId,
      storeId,
      tenantId,
      token,
      page,
      limit,
      isProductReview: 1,
    });
    const reviews = response.data?.reviews || [];
    allReviews.push(...reviews);
    if (reviews.length < limit) break;
    page += 1;
  }

  return allReviews;
};