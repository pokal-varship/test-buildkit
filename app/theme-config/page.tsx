import React from 'react';
import ThemeConfigClient from './client';
import { extractTokenFromSearchParams } from 'lib/tokenValidation';

export default async function ThemeConfigPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const token = extractTokenFromSearchParams(params);

  return <ThemeConfigClient token={token} />;
}