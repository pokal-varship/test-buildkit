"use client";

import type { Data } from "@measured/puck";
import { Render } from "@measured/puck";
import { config } from "puck.config";

interface ClientProps {
  data: Data;
  path?: string;
}

export function Client({ data, path }: ClientProps) {
  // Check if this is a new page with no content
  const isNewPage = !data?.content || data.content.length === 0;

  if (isNewPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-6xl mb-4">📄</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              This page hasn&apos;t been created yet. The content for this page is not available.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                <strong>Path:</strong> {path || "/"}
              </p>
              <p className="text-sm text-gray-500">
                Please check back later or contact support if you believe this is an error.
              </p>
            </div>
            <div className="mt-6">
              <a
                href={`${path}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Create This Page
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Render config={config} data={data} />;
}
