import PuckClientRenderer from "components/PuckClientRenderer";
import UnauthorizedAccess from "components/UnauthorizedAccess";
import Link from "next/link";
import { getDraftPage } from "pageEditor/lib/get-page";
import {
  appendAuthTokenToHref,
  extractTokenFromSearchParams,
  validateToken,
} from "lib/tokenValidation";

type DraftPreviewPageProps = {
  pagePath: string;
  liveHref: string;
  editPath: string;
  pageLabel: string;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DraftPreviewPage({
  pagePath,
  liveHref,
  editPath,
  pageLabel,
  searchParams,
}: DraftPreviewPageProps) {
  const resolvedSearchParams = await searchParams;
  const token = extractTokenFromSearchParams(resolvedSearchParams);

  if (!validateToken(token)) {
    return (
      <UnauthorizedAccess
        message="You are not allowed to view draft previews. A valid authentication token is required."
        showReturnHome={true}
      />
    );
  }

  const draftData = await getDraftPage(pagePath, token, true);
  const editHref = appendAuthTokenToHref(editPath, token);

  if (!draftData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-orange-100">
              <span className="text-4xl">📝</span>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              No Draft Available
            </h1>
            <p className="mb-6 text-gray-600">
              There&apos;s no draft version of {pageLabel} yet. Create one by
              editing the page and saving as draft.
            </p>
          </div>
          <div className="space-x-4">
            <Link
              href={liveHref}
              className="inline-block rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
            >
              View Live Page
            </Link>
            <Link
              href={editHref}
              className="inline-block rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Edit Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="sticky top-0 z-50 bg-orange-500 px-4 py-3 text-center font-medium text-white">
        <div className="flex items-center justify-center space-x-4">
          <span>📝 DRAFT PREVIEW - This is not the live version</span>
          <Link
            href={liveHref}
            className="rounded bg-white px-3 py-1 text-sm text-orange-600 transition-colors hover:bg-gray-100"
          >
            View Live Version
          </Link>
          <Link
            href={editHref}
            className="rounded bg-orange-700 px-3 py-1 text-sm text-white transition-colors hover:bg-orange-800"
          >
            Edit Draft
          </Link>
        </div>
      </div>
      <PuckClientRenderer data={draftData} />
    </div>
  );
}
