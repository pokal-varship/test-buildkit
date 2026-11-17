import axiosClient from "./axios";
import { PAGE_CONFIG_ENDPOINT } from "@config/api.config";
import { AxiosError } from "axios";
import { pageConfigCache } from "../utils/cache";

export const CATEGORY_IMAGE_SOURCE = "newkommerce/categories";

export interface PageConfigImage {
  id: number;
  url: string;
}

export interface UpdateStorePageImagesPayload {
  pageType: "STORE";
  storeId: string;
  images: PageConfigImage[];
}

export interface UpdateStorePageImagesResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

/**
 * PATCH tenant/config with store category/banner images.
 */
export const updateStorePageImages = async (
  payload: UpdateStorePageImagesPayload,
  token?: string | null,
): Promise<UpdateStorePageImagesResult> => {
  try {
    const headers: Record<string, string> = {
      Language: "en",
      "Content-Type": "application/json",
    };
    if (token) {
      const trimmed = token.trim();
      headers.Authorization = trimmed.startsWith("Bearer ")
        ? trimmed
        : `Bearer ${trimmed}`;
    }

    const response = await axiosClient.patch(
      PAGE_CONFIG_ENDPOINT,
      payload,
      { headers },
    );

    pageConfigCache.clear();

    return {
      success: true,
      message: "Category image updated successfully",
      data: response.data,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to update category image",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update category image",
    };
  }
};

/**
 * Build the relative S3 key expected by tenant/config from an Uppy upload result.
 */
export const getCategoryImagePathFromUpload = (
  file: unknown,
  sourceDirectory: string = CATEGORY_IMAGE_SOURCE,
): string | null => {
  const uploaded = file as {
    meta?: { name?: string; key?: string };
    name?: string;
    uploadURL?: string;
    response?: { uploadURL?: string; body?: { url?: string } };
  };

  if (uploaded.meta?.name) {
    return `${sourceDirectory}/${uploaded.meta.name}`;
  }

  if (uploaded.meta?.key) {
    return uploaded.meta.key.startsWith(sourceDirectory)
      ? uploaded.meta.key
      : `${sourceDirectory}/${uploaded.meta.key}`;
  }

  const rawUrl =
    uploaded.uploadURL ||
    uploaded.response?.uploadURL ||
    uploaded.response?.body?.url;

  if (!rawUrl) return null;

  try {
    const pathname = new URL(rawUrl.split("?")[0]).pathname.replace(/^\//, "");
    if (pathname.includes(sourceDirectory)) {
      return pathname.slice(pathname.indexOf(sourceDirectory));
    }
    return pathname || null;
  } catch {
    return null;
  }
};
