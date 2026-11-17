import { getThemeConfig } from "@config/theme.config";

type ImageConfigOptions = {
    url: string;
    quality?: number;
    format?: string;
    width?: number | null;
    height?: number;
    blur?: number | null;
    baseUrl?: string;
  };
   
  type ImageBase64Result = {
    base64String: string;
    fullEncodedUrl: string;
  };
   
  export function generateImageBase64FromUrl({
    url,
    quality = 85,
    format = 'webp',
    width = null,
    height,
    blur = null,
    baseUrl = getThemeConfig().imageBaseUrl // fallback
  }: ImageConfigOptions): ImageBase64Result {
    let key = url;
    let resolvedBaseUrl = baseUrl;
   
    if(url?.startsWith?.("http")) {
      try {
        const parsed = new URL(url);
        key = parsed?.pathname?.startsWith('/')
          ? parsed.pathname.slice(1)
          : parsed?.pathname || '';
        resolvedBaseUrl = (parsed?.origin || baseUrl);
      } catch (e: unknown) {
          if (e instanceof Error) {

          } else {

          }
      }
    }
    key = decodeURIComponent(key);
    const imageConfig: Record<string, number | string | null> = {
      key,
      quality,
      format,
      width,
      blur
    };
   
    if (height !== undefined) {
      imageConfig.height = height;
    }
   
    const jsonString = JSON.stringify(imageConfig);
    const base64String =
      typeof window === 'undefined'
        ? Buffer.from(jsonString).toString('base64')
        : btoa(unescape(encodeURIComponent(jsonString)));
   
    const fullEncodedUrl = `${resolvedBaseUrl}/${base64String}`;
   
    return {
      base64String,
      fullEncodedUrl,
    };
  }
