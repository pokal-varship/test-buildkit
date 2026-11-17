import React from "react";
import { extractTokenFromSearchParams } from "lib/tokenValidation";
import TokenProtectedClientWrapper from "@components/TokenProtectedClientWrapper";
import CategoryImagesClient from "./CategoryImagesClient";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const token = extractTokenFromSearchParams(params);

  return (
    <TokenProtectedClientWrapper token={token}>
      <CategoryImagesClient token={token as string} />
    </TokenProtectedClientWrapper>
  );
}
