import { getPresignedUrl } from "@services/useS3";

interface PresignedUrlResponse {
  data?: Array<{
    data?: {
      URL?: string;
      SignedHeader?: Record<string, string[]>;
    };
  }>;
}

export async function uploadDeliveryVoiceNote(blob: Blob): Promise<string | null> {
  const extension = blob.type.includes("webm") ? "webm" : blob.type.includes("mp4") ? "m4a" : "webm";
  const fileName = `delivery-instruction-${Date.now()}.${extension}`;
  const contentType = blob.type || "audio/webm";

  const payload = {
    case: "AWS",
    files: [
      {
        fileName,
        contentType,
        source: "newkommerce/delivery-instructions",
        fileOverwrite: true,
      },
    ],
  };

  try {
    const response = (await getPresignedUrl(payload)) as PresignedUrlResponse;
    const presignedData = response?.data?.[0]?.data;
    if (!presignedData?.URL) return null;

    const headers: Record<string, string> = { "Content-Type": contentType };
    if (presignedData.SignedHeader) {
      Object.entries(presignedData.SignedHeader).forEach(([key, value]) => {
        if (key.toLowerCase() === "host") return;
        if (Array.isArray(value) && value.length > 0) {
          headers[key] = value[0];
        }
      });
    }

    const uploadResponse = await fetch(presignedData.URL, {
      method: "PUT",
      body: blob,
      headers,
    });

    if (!uploadResponse.ok) return null;
    return presignedData.URL.split("?")[0];
  } catch {
    return null;
  }
}
