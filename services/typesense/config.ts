/**
 * Typesense configuration file
 * This file contains the configuration for the Typesense client
 */

export const typesenseConfig = {
  host: process.env.NEXT_PUBLIC_TYPESENSE_HOST || '',
  port: parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT || '443'),
  protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || 'https',
  apiKey: process.env.NEXT_PUBLIC_TYPESENSE_API_KEY || '',
  connectionTimeoutSeconds: parseInt(process.env.NEXT_PUBLIC_TYPESENSE_CONNECTION_TIMEOUT || '10'),
};

export const getProductCollectionName = (storeId: string | undefined): string => {
  
  // Otherwise construct the collection name using the storeId
  return `ecom-products-${storeId}`;
};

// Default storeId to use when none is provided
export const DEFAULT_STORE_ID = process.env.NEXT_PUBLIC_TENANT_ID;
export const DEFAULT_TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

export const AWS_BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_S3BUCKET;

export function getFileType(file: any) {
  const imageFormats = ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif", 'jfif'];
  const videoFormats = ["mp4", "avi", "mov", "quicktime", "wmv", 'webm', 'ogv', 'ogg', 'm3u8', 'vid', 'wmv', 'x-quicktime', 'x-msvideo'];
  const audioFormates = ["mp3", "wav", "ogg", "aac", "m4a", "audio/webm", "audio/ogg", "audio/mp4", "opus", "mpeg"]

  const extension = file?.type?.split("/").pop().toLowerCase() || file.name?.split(".").pop().toLowerCase();
  if (imageFormats.includes(extension)) {
    return "IMAGE";
  } else if (audioFormates.includes(extension) || audioFormates?.includes(file?.type?.split?.(";")?.[0])) {
    return "AUDIO";
  } else if (videoFormats.includes(extension)) {
    return "VIDEO";
  } else {
    return "unknown";
  }
}