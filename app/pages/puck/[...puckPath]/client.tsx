"use client";

import type { Data } from "@measured/puck";
import { Puck } from "@measured/puck";
import { getConfig } from "puck.config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  appendAuthTokenToHref,
  getClientAuthToken,
} from "lib/tokenValidation";
import {
  publishPageDraft,
  publishDraftToLive,
  getPageDraftClient,
  buildEditorUrl,
} from "services/pageManagement";
import "../../styles.css";

// Shared ref for latest Puck data - accessible by both Client and CustomHeaderActions
let sharedLatestDataRef: React.MutableRefObject<Partial<Data>> | null = null;

const EMPTY_PUCK_DATA: Partial<Data> = { content: [], root: {} };

// Custom Header Actions Component
function CustomHeaderActions({
  children,
  pageIsDraft = false,
  backHref = "/admin",
  isDraftMode = true,
  editToken,
  publishPath: publishPathProp,
  skipDraftDeleteOnLive = false,
}: {
  children: React.ReactNode;
  pageIsDraft?: boolean;
  backHref?: string;
  isDraftMode?: boolean;
  editToken?: string | null;
  publishPath?: string;
  /** First-time page creation — publish live without DELETE draft */
  skipDraftDeleteOnLive?: boolean;
}) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const hasDraft = true;
  // Get path from window location (since we can't pass props to this component)
  const getCurrentPath = () => {
    if (typeof window === 'undefined') return '/';
    const pathname = window.location.pathname;
    
    // Handle different editor routes
    // First, strip /edit suffix if present (handles all /{slug}/edit patterns)
    if (pathname.endsWith('/edit')) {
      const pathWithoutEdit = pathname.replace(/\/edit$/, '');
      // If it was just /edit, return homepage
      return pathWithoutEdit === '' ? '/' : pathWithoutEdit;
    }
    
    // Handle /puck routes (internal rewrites)
    if (pathname.includes('/puck/about-us')) return '/about-us';
    if (pathname.includes('/pages/puck/')) {
      // Extract the actual path from /pages/puck/{path}
      const actualPath = pathname.replace('/pages/puck', '');
      return actualPath === '' ? '/' : actualPath;
    }
    if (pathname.includes('/puck')) return '/';
    
    return pathname;
  };

  const getDraftPreviewPath = () => {
    const currentPath = getCurrentPath();
    if (currentPath === '/') return '/draft';
    if (currentPath === '/about-us') return '/about-us/draft';
    return `${currentPath}/draft`;
  };

  const publishPath = publishPathProp ?? getCurrentPath();
  const draftPreviewPath = appendAuthTokenToHref(
    getDraftPreviewPath(),
    getClientAuthToken(editToken),
  );

  // No automatic draft checking - only update when user saves a draft

  // Change Puck button text to "Publish Draft" when draft UI is active
  useEffect(() => {
    if (!pageIsDraft) return; // prop is already showDraftUI from parent

    const changePuckButtonText = () => {
      const puckButtons = document.querySelectorAll('button');
      puckButtons.forEach(button => {
        if (button.textContent?.trim() === 'Publish' && !button.dataset.textChanged) {
          button.textContent = 'Publish Draft';
          button.style.backgroundColor = 'var(--button-primary-background)';
          button.style.color = 'var(--button-primary-text)';
          button.dataset.textChanged = 'true';
        }
      });
    };

    const timeout = setTimeout(changePuckButtonText, 1000);
    return () => clearTimeout(timeout);
  }, [pageIsDraft]);

  const handlePublishLive = async () => {
    if (!hasDraft) {
      return;
    }

    setIsPublishing(true);
    
    const latestData = sharedLatestDataRef?.current;

    console.log('[Publish Live] latestData from ref:', {
      hasData: !!latestData,
      hasContent: !!(latestData as Data)?.content,
      contentLength: (latestData as Data)?.content?.length,
      contentTypes: (latestData as Data)?.content?.map((item) => item.type),
      dataKeys: latestData ? Object.keys(latestData) : [],
    });

    const showToast = (message: string, type: "success" | "error") => {
      const notification = document.createElement("div");
      notification.innerHTML = message;
      notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === "success" ? "#10b981" : "#ef4444"};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        width: fit-content;
        text-align: center;
        font-size: 14px;
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 5000);
    };

    try {
      if (!latestData) {
        showToast("❌ No page content to publish.", "error");
        return;
      }

      const token = getClientAuthToken(editToken);

      // Draft session: publish live, remove draft copy (unless brand-new page), reload as published
      if (isDraftMode) {
        const result = await publishDraftToLive(
          latestData as Data,
          publishPath,
          token,
          { skipDraftDelete: skipDraftDeleteOnLive },
        );

        if (!result.success) {
          showToast("❌ Failed to publish draft. Please try again.", "error");
          return;
        }

        if (result.draftRemoved === false && !skipDraftDeleteOnLive) {
          showToast(
            "⚠️ Published live, but the draft copy could not be removed.",
            "error",
          );
        }

        router.replace(
          buildEditorUrl(publishPath, { authToken: token, isDraft: false }),
        );
        return;
      }

      // Published session: update live content in place
      const publishResult = await publishPageDraft(
        latestData as Data,
        publishPath,
        false,
        token,
      );

      if (!publishResult.success) {
        showToast("❌ Failed to publish page. Please try again.", "error");
        return;
      }

      const apiResult = await getPageDraftClient(publishPath, false, token);

      if (apiResult.success && apiResult.data) {
        const viewLabel =
          publishPath === "/"
            ? "Published Homepage"
            : publishPath === "/about-us"
              ? "Published AboutUs Page"
              : publishPath.replace("/", "");
        showToast(
          `✅ Page published successfully! <a href="${publishPath}" target="_blank" rel="noopener noreferrer" style="color: white; text-decoration: underline; margin-left: 8px;">View ${viewLabel}</a>`,
          "success",
        );
      } else {
        showToast(
          "❌ Failed to fetch published data from API. Please try again.",
          "error",
        );
      }
    } catch {

      // Show error notification
      const notification = document.createElement('div');
      notification.innerHTML = '❌ Failed to publish page. Please try again.';
      notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ef4444;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        width: fit-content;
        text-align: center;
        font-size: 14px;
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 5000);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="relative">

    <div className="draft-publish-buttons">
      <div className="header-left-group">
        <Link href={backHref} className="btn-back" title="Back to admin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <span className="path-indicator">
          Editing: <code>{publishPath === '/' ? 'HomePage' : publishPath === '/about-us' ? 'AboutUs' : publishPath}</code>
        </span>
      </div>

      <div className="button-group">
        {!pageIsDraft && (
          <a
            href={publishPath}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-view-live"
            title="View the live version of this page"
          >
            👁️ View Published Page
          </a>
        )}

        {/* Puck publish button — draft saves only */}
        {pageIsDraft && children}

        {pageIsDraft && (
          <a
            href={draftPreviewPath}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-view-draft"
            title="Preview the current draft"
          >
            📝 View Draft
          </a>
        )}

        <button
          onClick={handlePublishLive}
          disabled={isPublishing || !hasDraft}
          className="btn-publish-live"
          title={!hasDraft ? "Save as draft first" : "Publish the latest draft live"}
        >
          {isPublishing ? "🚀 Publishing..." : "🚀 Publish Live"}
        </button>
      </div>
    </div>
    </div>
  );
}

export function Client({
  path,
  isDraft = true,
  editToken,
}: {
  path: string;
  isDraft?: boolean;
  editToken?: string | null;
}) {
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [pageData, setPageData] = useState<Partial<Data>>(EMPTY_PUCK_DATA);
  const [pageIsDraft, setPageIsDraft] = useState(isDraft);
  const [isNewPage, setIsNewPage] = useState(false);
  const [hasPersistedDraft, setHasPersistedDraft] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  // Use ref to store latest data from onPublish without causing re-renders
  const latestDataRef = useRef<Partial<Data>>(EMPTY_PUCK_DATA);
  sharedLatestDataRef = latestDataRef;

  // Fetch page content from external API on every editor load/reload
  useEffect(() => {
    let cancelled = false;

    const loadPageFromApi = async () => {
      setIsLoadingPage(true);
      try {
        const result = await getPageDraftClient(path, isDraft, editToken);
        if (cancelled) return;

        if (result.success && result.data) {
          setPageData(result.data);
          latestDataRef.current = result.data;
          setPageIsDraft(result.isDraft === true);
          setIsNewPage(false);
          setHasPersistedDraft(true);
        } else if (result.isNewPage && isDraft) {
          // 204 — first-time page creation; treat as draft editor session
          setPageData(EMPTY_PUCK_DATA);
          latestDataRef.current = EMPTY_PUCK_DATA;
          setPageIsDraft(true);
          setIsNewPage(true);
          setHasPersistedDraft(false);
        } else {
          setPageData(EMPTY_PUCK_DATA);
          latestDataRef.current = EMPTY_PUCK_DATA;
          setPageIsDraft(false);
          setIsNewPage(false);
          setHasPersistedDraft(false);
        }
      } catch {
        if (!cancelled) {
          setPageData(EMPTY_PUCK_DATA);
          latestDataRef.current = EMPTY_PUCK_DATA;
          setPageIsDraft(isDraft);
          setIsNewPage(false);
          setHasPersistedDraft(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPage(false);
        }
      }
    };

    void loadPageFromApi();

    return () => {
      cancelled = true;
    };
  }, [path, isDraft, editToken]);

  // Update ref when page data changes
  useEffect(() => {
    latestDataRef.current = pageData;
  }, [path, pageData]);

  // Note: Token validation is handled on the server side before this component is rendered
  // No need for client-side validation to avoid hooks inconsistency

  // Determine if this is an About Us route
  const isAboutUsRoute = path?.includes('about-us') || (typeof window !== 'undefined' && window.location.href.includes('about-us'));
  
  // Get the appropriate config based on the route
  const config = getConfig(path);
  
  // Determine the publish path based on what we're editing
  const getPublishPath = () => {
    // Handle different editor routes
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      
      // Strip /edit suffix if present (handles all /{slug}/edit patterns)
      if (pathname.endsWith('/edit')) {
        const pathWithoutEdit = pathname.replace(/\/edit$/, '');
        return pathWithoutEdit === '' ? '/' : pathWithoutEdit;
      }
    }
    
    // If we're editing the homepage (path is '/' or empty), publish to '/'
    if (path === "/" || path === "") {
      return "/";
    }
    
    // For About Us routes, publish to '/about-us'
    if (path.includes('about-us')) {
      return "/about-us";
    }
    
    // For store landing pages and other dynamic pages, use the path directly
    // The path comes from server-side which is already correct (e.g., /paris-panini-church-street)
    return path;
  };
  
  const publishPath = getPublishPath();

  const backHref = useMemo(
    () => appendAuthTokenToHref("/admin", editToken),
    [editToken],
  );

  const handleDataChange = useCallback((puckData: Data) => {
    latestDataRef.current = puckData;
  }, []);

  const handlePublishDraft = useCallback(async (puckData: Data) => {
    // Store the latest data in ref when user publishes draft
    latestDataRef.current = puckData;
    
    console.log('[Puck Draft] onPublish called with data:', {
      hasContent: !!puckData.content,
      contentLength: puckData.content?.length,
      contentTypes: puckData.content?.map((item) => item.type),
      hasZones: !!puckData.zones,
      zoneKeys: puckData.zones ? Object.keys(puckData.zones) : [],
      fullDataKeys: Object.keys(puckData),
    });

    setIsDraftSaving(true);
    setPublishStatus(null);
    
    try {
      const token = getClientAuthToken(editToken);
      const result = await publishPageDraft(puckData, publishPath, true, token);

      if (result.success) {
        setPageIsDraft(true);
        setHasPersistedDraft(true);
        setPublishStatus("draft-success");
        setTimeout(() => setPublishStatus(null), 5000);
      } else {
        setPublishStatus("draft-error");
        setTimeout(() => setPublishStatus(null), 5000);
      }
    } catch {
      setPublishStatus("draft-error");
      setTimeout(() => setPublishStatus(null), 5000);
    } finally {
      setIsDraftSaving(false);
    }
  }, [publishPath, editToken]);

  const showDraftUI = pageIsDraft || (isNewPage && isDraft);

  const skipDraftDeleteOnLive = isNewPage && !hasPersistedDraft;

  // Memoize overrides to prevent re-creating on every render
  const overrides = useMemo(() => ({
    headerActions: ({ children }: { children: React.ReactNode }) => (
      <CustomHeaderActions
        pageIsDraft={showDraftUI}
        backHref={backHref}
        isDraftMode={isDraft}
        editToken={editToken}
        publishPath={publishPath}
        skipDraftDeleteOnLive={skipDraftDeleteOnLive}
      >
        {children}
      </CustomHeaderActions>
    ),
  }), [showDraftUI, backHref, isDraft, editToken, publishPath, skipDraftDeleteOnLive]);

  // Memoize renderHeader to prevent re-creating on every render
  const renderHeader = useCallback(({ children }: { children: React.ReactNode }) => (
    <div className="relative">
      {children}
      {isDraftSaving && (
        <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm">
          💾 Saving Draft...
        </div>
      )}
    </div>
  ), [isDraftSaving]);

  if (isLoadingPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--primary-background)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[var(--rating-border-primary)] border-t-[var(--primary-color)]" />
          <p className="text-[var(--primary-text)] opacity-70">Loading page content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Success/Error Banner */}
      {publishStatus && (
        <div
          className={`fixed top-0 left-0 right-0 z-50 p-4 text-center font-medium ${
            publishStatus === "success"
              ? "bg-green-500 text-white"
              : publishStatus === "draft-success"
              ? "bg-blue-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {publishStatus === "success" ? (
            <div className="flex items-center justify-center space-x-4">
              <span>✅ Page published live successfully!</span>
              <a
                href={publishPath}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-green-600 px-3 py-1 rounded text-sm hover:bg-gray-100 transition-colors"
              >
                View Published Page
              </a>
            </div>
          ) : publishStatus === "draft-success" ? (
            <span>💾 Draft saved successfully!</span>
          ) : publishStatus === "no-draft-error" ? (
            <span>❌ No draft available. Please save as draft first.</span>
          ) : publishStatus === "draft-error" ? (
            <span>❌ Failed to save draft. Please try again.</span>
          ) : (
            <span>❌ Failed to publish page. Please try again.</span>
          )}
        </div>
      )}

      {/* Puck Editor */}
      <Puck
        key={`${path}-${isDraft ? "draft" : "published"}-${pageData.content?.length ?? 0}`}
        config={config}
        data={pageData}
        onChange={handleDataChange}
        onPublish={handlePublishDraft}
        overrides={overrides}
        renderHeader={renderHeader}
      />
    </div>
  );
}
