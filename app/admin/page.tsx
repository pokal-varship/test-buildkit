"use client";

import { useState, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthToken } from "@context/SearchParamsContext";
import { getTenantConfig } from "@config/tenant.config";
import { useTheme } from "context/ThemeProvider";
import UnauthorizedAccess from "@components/UnauthorizedAccess";
import { getTenantStore } from "@services/homePage";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { isTimeZone } from "@lib/helper";
import { appendAuthTokenToHref, validateToken } from "@lib/tokenValidation";
import CustomDialog from "@components/dialogDrawer/dialog";
import {
  deletePage,
  fetchAdminPageLists,
  invalidateAdminPageListsCache,
  type PageSlugItem,
} from "@services/pageManagement";

interface PageData {
  id: string;
  path: string;
  title: string;
  slug: string;
  lastModified: string;
  editPath: string;
  viewPath: string;
  status: "published" | "draft";
}

interface StoreItem {
  id: string;
  name: string;
  slug: string;
}

const apiSlugToPath = (pageSlug: string): string =>
  pageSlug === "home" ? "/" : `/${pageSlug}`;

const formatApiDate = (updatedAt?: number, createdAt?: number): string => {
  const timestamp = updatedAt ?? createdAt;
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatPathToTitle = (path: string): string => {
  if (path === "/") return "Homepage";
  if (path === "/about-us") return "About Us";
  return path
    .replace(/^\//, "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const mapSlugItemToPage = (
  item: PageSlugItem,
  status: "published" | "draft",
): PageData => {
  const path = apiSlugToPath(item.pageSlug);
  return {
    id: item.id,
    path,
    title: item.title || formatPathToTitle(path),
    slug: item.pageSlug,
    lastModified: formatApiDate(item.updatedAt, item.createdAt),
    editPath: path === "/" ? "/edit" : `${path}/edit`,
    viewPath: path,
    status,
  };
};

function AdminPageContent({ token }: { token: string }) {
  const [pages, setPages] = useState<PageData[]>([]);
  const [draftPages, setDraftPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftLoading, setDraftLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"published" | "draft">("published");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [storeList, setStoreList] = useState<StoreItem[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  // const [customSlug, setCustomSlug] = useState("");
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [pageToDelete, setPageToDelete] = useState<PageData | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const config = getTenantConfig();
  const { theme } = useTheme();
  const router = useRouter();
  const location = useSelector((state: RootState) => state.location) as { latitude: number; longitude: number } | null;
  const withToken = useCallback(
    (href: string) => appendAuthTokenToHref(href, token),
    [token],
  );

  const fetchStoreList = useCallback(async () => {
    setStoresLoading(true);
    try {
      const lat = location?.latitude || 21.1959;
      const lng = location?.longitude || 72.8302;
      const tz = isTimeZone();
      const response = await getTenantStore(lat, lng, tz) as { data?: Array<{ id: string; name: string; slug: string }> };
      if (response?.data) {
        setStoreList(
          response.data
            .filter((store) => store.slug)
            .map((store) => ({
              id: store.id,
              name: store.name,
              slug: store.slug,
            }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch store list:", error);
      setStoreList([]);
    } finally {
      setStoresLoading(false);
    }
  }, [location?.latitude, location?.longitude]);

  const handleOpenCreateDialog = useCallback(() => {
    setShowCreateDialog(true);
    fetchStoreList();
  }, [fetchStoreList]);

  const handleCreatePage = useCallback((slug: string) => {
    const editUrl = withToken(`/${slug}/edit`);
    router.push(editUrl);
  }, [withToken, router]);

  // const handleCreateCustomPage = useCallback(() => {
  //   if (!customSlug.trim()) return;
  //   const slug = customSlug
  //     .trim()
  //     .toLowerCase()
  //     .replace(/[^a-z0-9-]/g, "-")
  //     .replace(/-+/g, "-")
  //     .replace(/^-|-$/g, "");
  //   if (slug) {
  //     handleCreatePage(slug);
  //   }
  // }, [customSlug, handleCreatePage]);

  const applyPageListResults = (
    published: Awaited<ReturnType<typeof fetchAdminPageLists>>["published"],
    draft: Awaited<ReturnType<typeof fetchAdminPageLists>>["draft"],
  ) => {
    if (published.success) {
      setPages(
        published.items.map((item) => mapSlugItemToPage(item, "published")),
      );
    } else {
      setPages([]);
      if (published.error) {
        console.error("Failed to fetch published pages:", published.error);
      }
    }

    if (draft.success) {
      setDraftPages(
        draft.items.map((item) => mapSlugItemToPage(item, "draft")),
      );
    } else {
      setDraftPages([]);
      if (draft.error) {
        console.error("Failed to fetch draft pages:", draft.error);
      }
    }
  };

  const loadPageLists = useCallback(
    async (options?: { force?: boolean }) => {
      setLoading(true);
      setDraftLoading(true);
      try {
        const { published, draft } = await fetchAdminPageLists(token, options);
        applyPageListResults(published, draft);
      } catch (error) {
        console.error("Failed to fetch pages:", error);
        setPages([]);
        setDraftPages([]);
      } finally {
        setLoading(false);
        setDraftLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setDraftLoading(true);
      try {
        const { published, draft } = await fetchAdminPageLists(token);
        if (!active) return;
        applyPageListResults(published, draft);
      } catch (error) {
        if (!active) return;
        console.error("Failed to fetch pages:", error);
        setPages([]);
        setDraftPages([]);
      } finally {
        if (active) {
          setLoading(false);
          setDraftLoading(false);
          setRefreshing(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    invalidateAdminPageListsCache(token);
    void loadPageLists({ force: true });
  };

  const openDeleteDialog = useCallback((page: PageData) => {
    setDeleteError(null);
    setPageToDelete(page);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (deletingSlug) return;
    setPageToDelete(null);
    setDeleteError(null);
  }, [deletingSlug]);

  const handleDeletePage = useCallback(async () => {
    if (!pageToDelete || deletingSlug) return;

    const isDraft = activeTab === "draft";
    const page = pageToDelete;
    setDeletingSlug(page.slug);
    setDeleteError(null);
    try {
      const result = await deletePage(page.slug, isDraft, token);
      if (result.success) {
        invalidateAdminPageListsCache(token);
        if (isDraft) {
          setDraftPages((prev) => prev.filter((p) => p.slug !== page.slug));
        } else {
          setPages((prev) => prev.filter((p) => p.slug !== page.slug));
        }
        setPageToDelete(null);
      } else {
        setDeleteError(result.error || "Failed to delete page.");
      }
    } catch {
      setDeleteError("Failed to delete page.");
    } finally {
      setDeletingSlug(null);
    }
  }, [activeTab, deletingSlug, pageToDelete, token]);

  const filteredPages = useMemo(() => {
    const source = activeTab === "published" ? pages : draftPages;
    if (!searchQuery.trim()) return source;
    const query = searchQuery.toLowerCase();
    return source.filter(
      (page) =>
        page.title.toLowerCase().includes(query) ||
        page.slug.toLowerCase().includes(query) ||
        page.path.toLowerCase().includes(query),
    );
  }, [pages, draftPages, activeTab, searchQuery]);

  return (
      <div className="admin-container">
        {/* Header */}
        <header className="admin-header-wrapper">
          <div className="admin-header">
            <div className="header-left">
              {config?.lightLogoUrl && theme === "light" ? (
                <Image
                  src={config.lightLogoUrl}
                  alt={config?.appName || "Logo"}
                  width={140}
                  height={40}
                  className="header-logo"
                />
              ) : config?.darkLogoUrl && theme === "dark" ? (
                <Image
                  src={config.darkLogoUrl}
                  alt={config?.appName || "Logo"}
                  width={140}
                  height={40}
                  className="header-logo"
                />
              ) : (
                <h1 className="header-title">
                  {config?.appName || "Page Builder"}
                </h1>
              )}
            </div>
            <div className="header-right">
              <button
                onClick={handleRefresh}
                className="btn-icon"
                disabled={refreshing}
                title="Refresh"
              >
                <svg
                  className={`icon ${refreshing ? "spinning" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <Link
                href={withToken("/theme-config")}
                className="btn-secondary btn-theme-link"
              >
                <Image
                  src="/images/icon/theme-edit.svg"
                  alt="Manage theme"
                  width={18}
                  height={18}
                  className="icon"
                />
                <span>Manage Theme</span>
              </Link>
              <button onClick={handleOpenCreateDialog} className="btn-primary">
                <svg
                  className="icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Page</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tabs + Search Section */}
        <div className="search-section">
          <div className="tabs-row">
            <div className="tabs">
              <button
                className={`tab ${activeTab === "published" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("published")}
              >
                Published
                <span className="tab-count">{pages.length}</span>
              </button>
              <button
                className={`tab ${activeTab === "draft" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("draft")}
              >
                Drafts
                <span className="tab-count">{draftPages.length}</span>
              </button>
            </div>
            <div className="search-box">
              <svg
                className="search-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search pages by title or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="search-clear"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="admin-main">
          {(activeTab === "published" ? loading : draftLoading) ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>
                {activeTab === "draft"
                  ? "Loading draft pages..."
                  : "Loading your pages..."}
              </p>
            </div>
          ) : filteredPages.length === 0 &&
            !(activeTab === "published" && !searchQuery.trim()) ? (
            <div className="empty-state">
              {searchQuery ? (
                <>
                  <div className="empty-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  </div>
                  <h3>No results found</h3>
                  <p>
                    {activeTab === "draft"
                      ? `No draft pages match "${searchQuery}"`
                      : `No pages match "${searchQuery}"`}
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="btn-secondary"
                  >
                    Clear Search
                  </button>
                </>
              ) : activeTab === "draft" ? (
                <>
                  <div className="empty-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3>No draft pages</h3>
                  <p>
                    Create a new page and save it as a draft to see it here
                  </p>
                  <button
                    onClick={handleOpenCreateDialog}
                    className="btn-primary"
                  >
                    <svg
                      className="icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Page</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="empty-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3>No pages yet</h3>
                  <p>Create your first page to get started</p>
                  <button
                    onClick={handleOpenCreateDialog}
                    className="btn-primary"
                  >
                    <svg
                      className="icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Page</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="pages-header">
                <span className="pages-count">
                  {filteredPages.length +
                    (activeTab === "published" && !searchQuery.trim() ? 1 : 0)}{" "}
                  {filteredPages.length +
                    (activeTab === "published" && !searchQuery.trim() ? 1 : 0) ===
                  1
                    ? "Page"
                    : "Pages"}
                </span>
              </div>
              <div className="pages-grid">
                {activeTab === "published" && !searchQuery.trim() ? (
                  <article className="page-card">
                    <div className="card-header">
                      <h3 className="card-title">Category</h3>
                      <span className="status-badge published">Published</span>
                    </div>
                    <p className="card-slug">/categories</p>
                    <div className="card-meta">
                      <span className="meta-type">Category Image</span>
                    </div>
                    <div className="card-actions">
                      <Link
                        href={withToken("/admin/categories")}
                        className="action-btn action-edit"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>
                    </div>
                  </article>
                ) : null}
                {filteredPages.map((page) => (
                  <article key={page.id} className="page-card">
                    <div className="card-header">
                      <h3 className="card-title">{page.title}</h3>
                      <span className={`status-badge ${activeTab}`}>
                        {activeTab === "published" ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="card-slug">/{page.slug}</p>
                    <div className="card-meta">
                      <span className="meta-type">Landing Page</span>
                      {page.lastModified ? (
                        <span className="meta-date">{page.lastModified}</span>
                      ) : null}
                    </div>
                    <div className="card-actions">
                      <Link
                        href={withToken(`${page.editPath}${page.editPath.includes("?") ? "&" : "?"}isDraft=${activeTab === "draft"}`)}
                        className="action-btn action-edit"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>
                      <Link
                        href={page.viewPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn action-view"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </Link>
                      <button
                        type="button"
                        className="action-btn action-delete"
                        title={`Delete ${activeTab === "draft" ? "draft" : "published"} page`}
                        disabled={deletingSlug === page.slug}
                        onClick={() => openDeleteDialog(page)}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
                        </svg>
                        {deletingSlug === page.slug ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </main>

        <CustomDialog
          open={Boolean(pageToDelete)}
          anchor="bottom"
          type="deleteModal"
          onlyDialog
          propsData={{
            title: pageToDelete ? `Delete "${pageToDelete.title}"?` : "Delete page",
            description: pageToDelete
              ? `This ${activeTab === "draft" ? "draft" : "published"} page will be permanently deleted. This cannot be undone.`
              : "",
            error: deleteError || "",
            yesButtonText: deletingSlug ? "Deleting..." : "Delete",
            noButtonText: "Cancel",
            yesDisabled: Boolean(deletingSlug),
            onYes: () => void handleDeletePage(),
            onNo: closeDeleteDialog,
          }}
          handlerDialog={() => {}}
          handleClose={closeDeleteDialog}
          sxStyle={{
            "& .MuiPaper-root": {
              width: "420px",
              maxWidth: "calc(100% - 32px)",
            },
            "& .MuiDialogContent-root": {
              padding: "24px",
            },
          }}
        />

        {/* Create Page Dialog */}
        {showCreateDialog && (
          <div className="dialog-overlay" onClick={() => setShowCreateDialog(false)}>
            <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
              <div className="dialog-header">
                <h2 className="dialog-title">Create New Page</h2>
                <button
                  className="dialog-close"
                  onClick={() => setShowCreateDialog(false)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="dialog-body">
                {/* Store Pages Section */}
                <div className="dialog-section">
                  <h3 className="dialog-section-title">Store Pages</h3>
                  <p className="dialog-section-desc">Create a landing page for a store</p>
                  {storesLoading ? (
                    <div className="dialog-loading">
                      <div className="loading-spinner small"></div>
                      <span>Loading stores...</span>
                    </div>
                  ) : storeList.length === 0 ? (
                    <p className="dialog-empty">No stores found</p>
                  ) : (
                    <div className="dialog-list">
                      {storeList.map((store) => (
                        <div key={store.id} className="dialog-list-item">
                          <div className="dialog-item-info">
                            <span className="dialog-item-name">{store.name}</span>
                            <span className="dialog-item-slug">/{store.slug}</span>
                          </div>
                          <button
                            className="dialog-item-btn"
                            onClick={() => handleCreatePage(store.slug)}
                          >
                            Create
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Other Pages Section */}
                <div className="dialog-section">
                  <h3 className="dialog-section-title">Other Pages</h3>
                  <div className="dialog-list">
                    <div className="dialog-list-item">
                      <div className="dialog-item-info">
                        <span className="dialog-item-name">Home Page</span>
                        <span className="dialog-item-slug">/</span>
                      </div>
                      <button
                        className="dialog-item-btn"
                        onClick={() => router.push(withToken("/edit"))}
                      >
                        Create
                      </button>
                    </div>
                    <div className="dialog-list-item">
                      <div className="dialog-item-info">
                        <span className="dialog-item-name">About Us</span>
                        <span className="dialog-item-slug">/about-us</span>
                      </div>
                      <button
                        className="dialog-item-btn"
                        onClick={() => handleCreatePage("about-us")}
                      >
                        Create
                      </button>
                    </div>
                    <div className="dialog-list-item">
                      <div className="dialog-item-info">
                        <span className="dialog-item-name">Category</span>
                        <span className="dialog-item-slug">/admin/categories</span>
                      </div>
                      <button
                        className="dialog-item-btn"
                        onClick={() => router.push(withToken("/admin/categories"))}
                      >
                        Open
                      </button>
                    </div>
                    {/* Custom page creation — hidden for now
                    <div className="dialog-list-item custom-page-item">
                      <div className="dialog-item-info">
                        <span className="dialog-item-name">Custom Page</span>
                        <div className="custom-slug-input-wrapper">
                          <span className="custom-slug-prefix">/</span>
                          <input
                            type="text"
                            placeholder="enter-page-slug"
                            value={customSlug}
                            onChange={(e) => setCustomSlug(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleCreateCustomPage();
                            }}
                            className="custom-slug-input"
                          />
                        </div>
                      </div>
                      <button
                        className="dialog-item-btn"
                        onClick={handleCreateCustomPage}
                        disabled={!customSlug.trim()}
                      >
                        Create
                      </button>
                    </div>
                    */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <style>{`
        .admin-container {
          min-height: 100vh;
          background: var(--primary-background);
          font-family: var(--font-family);
        }

        /* Header */
        .admin-header-wrapper {
          background: var(--primary-background);
          border-bottom: 1px solid var(--rating-border-primary);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .admin-header {
          max-width: 80rem; /* 7xl */
          margin: 0 auto;
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
        }

        .header-logo {
          height: 36px;
          width: auto;
          object-fit: contain;
        }

        .header-title {
          font-size: var(--heading-h3);
          font-weight: var(--font-bold);
          color: var(--primary-color);
          margin: 0;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Buttons */
        .btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 10px;
          border: 1px solid var(--rating-border-primary);
          background: var(--primary-background);
          color: var(--primary-text);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .btn-icon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: var(--font-semi-bold);
          cursor: pointer;
          text-decoration: none;
          background: var(--button-primary-background);
          color: var(--button-primary-text);
          font-size: var(--button-primary-font-size);
          border: var(--button-primary-border-width) solid var(--button-primary-border-color);
          transition:
            background 0.2s ease,
            color 0.2s ease,
            opacity 0.2s ease;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--button-primary-hover-background);
          color: var(--button-primary-hover-text);
        }

        .btn-primary:active:not(:disabled) {
          background: var(--button-primary-active-background);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: var(--description-font);
          font-weight: var(--font-semi-bold);
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          background: var(--primary-background);
          border: 1px solid var(--rating-border-primary);
          color: var(--primary-text);
        }

        .btn-theme-link {
          border-color: var(--primary-color);
        }

        .btn-secondary:hover {
          border-color: var(--primary-color);
        }

        .icon {
          width: 18px;
          height: 18px;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Search Section */
        .search-section {
          max-width: 80rem; /* 7xl */
          margin: 0 auto;
          padding: 24px 32px;
        }

        .tabs-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .tabs {
          display: flex;
          align-items: center;
          gap: 4px;
          background: var(--tertiary-background);
          border-radius: 10px;
          padding: 4px;
        }

        .tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: var(--description-font);
          font-weight: var(--font-medium);
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: transparent;
          color: var(--primary-text);
          opacity: 0.7;
        }

        .tab:hover {
          opacity: 1;
        }

        .tab-active {
          background: var(--primary-background);
          color: var(--primary-text);
          opacity: 1;
          font-weight: var(--font-semi-bold);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .tab-count {
          background: var(--rating-border-primary);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: var(--extraSmall-font);
          font-weight: var(--font-semi-bold);
        }

        .tab-active .tab-count {
          background: var(--button-primary-background);
          color: var(--button-primary-text);
        }

        .search-box {
          display: flex;
          align-items: center;
          background: var(--primary-background);
          border: 1px solid var(--rating-border-primary);
          border-radius: 12px;
          padding: 0 16px;
          transition: all 0.2s;
          max-width: 500px;
        }

        .search-box:focus-within {
          border-color: var(--primary-color);
        }

        .search-icon {
          width: 20px;
          height: 20px;
          color: var(--primary-text);
          opacity: 0.5;
          flex-shrink: 0;
        }

        .search-input {
          flex: 1;
          padding: 14px 12px;
          border: none;
          outline: none;
          font-size: var(--description-font);
          font-family: var(--font-family);
          background: transparent;
          color: var(--primary-text);
        }

        .search-input::placeholder {
          color: var(--primary-text);
          opacity: 0.5;
        }

        .search-clear {
          padding: 6px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--primary-text);
          opacity: 0.5;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .search-clear:hover {
          opacity: 1;
        }

        .search-clear svg {
          width: 16px;
          height: 16px;
        }

        /* Main Content */
        .admin-main {
          max-width: 80rem; /* 7xl */
          margin: 0 auto;
          padding: 0 32px 32px;
        }

        /* Pages Header */
        .pages-header {
          margin-bottom: 20px;
        }

        .pages-count {
          font-size: var(--description-font);
          font-weight: var(--font-semi-bold);
          color: var(--primary-text);
          opacity: 0.7;
        }

        /* Pages Grid */
        .pages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        /* Page Card */
        .page-card {
          background: var(--cards-containers);
          border: 1px solid var(--rating-border-primary);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.2s;
        }

        .page-card:hover {
          border-color: var(--primary-color);
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }

        .card-title {
          font-size: var(--heading-h5);
          font-weight: var(--font-bold);
          color: var(--primary-text);
          margin: 0;
          line-height: 1.4;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: var(--extraSmall-font);
          font-weight: var(--font-semi-bold);
          flex-shrink: 0;
        }

        .status-badge.published {
          background: var(--tertiary-background);
          color: var(--primary-color);
        }

        .status-badge.draft {
          background: var(--tertiary-background);
          color: var(--primary-text);
          opacity: 0.7;
        }

        .card-slug {
          font-size: var(--small-font);
          color: var(--primary-text);
          opacity: 0.6;
          margin: 0 0 16px;
          font-family: ui-monospace, SFMono-Regular, monospace;
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          font-size: var(--extraSmall-font);
          color: var(--primary-text);
          opacity: 0.6;
        }

        .meta-type {
          background: var(--primary-background);
          border: 1px solid var(--borders-dividers);
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: var(--font-medium);
        }

        .card-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: var(--small-font);
          font-weight: var(--font-medium);
          text-decoration: none;
          transition: all 0.15s;
          border: 1px solid var(--rating-border-primary);
          background: var(--primary-background);
          color: var(--primary-text);
        }

        .action-btn svg {
          width: 16px;
          height: 16px;
        }

        .action-btn:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .action-edit {
          background: var(--button-primary-background);
          color: var(--button-primary-text);
          font-size: var(--button-primary-font-size);
          border: var(--button-primary-border-width) solid var(--button-primary-border-color);
        }

        .action-edit:hover {
          background: var(--button-primary-hover-background);
          color: var(--button-primary-hover-text);
          border-color: var(--button-primary-border-color);
        }

        .action-edit:active {
          background: var(--button-primary-active-background);
        }

        .action-delete {
          margin-left: auto;
          color: #dc2626;
          border-color: rgba(220, 38, 38, 0.35);
        }

        .action-delete:hover:not(:disabled) {
          background: rgba(220, 38, 38, 0.08);
          border-color: #dc2626;
          color: #dc2626;
        }

        .action-delete:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 20px;
          color: var(--primary-text);
          opacity: 0.7;
        }

        .loading-spinner {
          width: 44px;
          height: 44px;
          border: 3px solid var(--rating-border-primary);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }

        .loading-state p {
          font-size: var(--description-font);
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 20px;
          text-align: center;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          background: var(--tertiary-background);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .empty-icon svg {
          width: 40px;
          height: 40px;
          color: var(--primary-text);
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: var(--heading-h4);
          font-weight: var(--font-bold);
          color: var(--primary-text);
          margin: 0 0 8px;
        }

        .empty-state p {
          font-size: var(--description-font);
          color: var(--primary-text);
          opacity: 0.7;
          margin: 0 0 24px;
        }

        /* Dialog Overlay */
        .dialog-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .dialog-content {
          background: var(--primary-background);
          border-radius: 20px;
          width: 100%;
          max-width: 600px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid var(--rating-border-primary);
        }

        .dialog-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px 16px;
          border-bottom: 1px solid var(--rating-border-primary);
        }

        .dialog-title {
          font-size: var(--heading-h4);
          font-weight: var(--font-bold);
          color: var(--primary-text);
          margin: 0;
        }

        .dialog-close {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid var(--rating-border-primary);
          background: var(--primary-background);
          color: var(--primary-text);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .dialog-close:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .dialog-close svg {
          width: 18px;
          height: 18px;
        }

        .dialog-body {
          overflow-y: auto;
          padding: 24px 28px;
        }

        .dialog-section {
          margin-bottom: 28px;
        }

        .dialog-section:last-child {
          margin-bottom: 0;
        }

        .dialog-section-title {
          font-size: var(--heading-h5);
          font-weight: var(--font-semi-bold);
          color: var(--primary-text);
          margin: 0 0 4px;
        }

        .dialog-section-desc {
          font-size: var(--small-font);
          color: var(--primary-text);
          opacity: 0.6;
          margin: 0 0 16px;
        }

        .dialog-loading {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 0;
          color: var(--primary-text);
          opacity: 0.7;
          font-size: var(--small-font);
        }

        .loading-spinner.small {
          width: 24px;
          height: 24px;
          border-width: 2px;
        }

        .dialog-empty {
          font-size: var(--small-font);
          color: var(--primary-text);
          opacity: 0.5;
          margin: 0;
          padding: 12px 0;
        }

        .dialog-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dialog-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid var(--rating-border-primary);
          background: var(--cards-containers);
          transition: all 0.15s;
        }

        .dialog-list-item:hover {
          border-color: var(--primary-color);
        }

        .dialog-item-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          flex: 1;
        }

        .dialog-item-name {
          font-size: var(--description-font);
          font-weight: var(--font-medium);
          color: var(--primary-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dialog-item-slug {
          font-size: var(--extraSmall-font);
          color: var(--primary-text);
          opacity: 0.5;
          font-family: ui-monospace, SFMono-Regular, monospace;
        }

        .dialog-item-btn {
          padding: 8px 18px;
          border-radius: 8px;
          font-weight: var(--font-semi-bold);
          cursor: pointer;
          flex-shrink: 0;
          margin-left: 12px;
          background: var(--button-primary-background);
          color: var(--button-primary-text);
          font-size: var(--button-primary-font-size);
          border: var(--button-primary-border-width) solid var(--button-primary-border-color);
          transition:
            background 0.15s ease,
            color 0.15s ease;
        }

        .dialog-item-btn:hover:not(:disabled) {
          background: var(--button-primary-hover-background);
          color: var(--button-primary-hover-text);
        }

        .dialog-item-btn:active:not(:disabled) {
          background: var(--button-primary-active-background);
        }

        .dialog-item-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .custom-page-item {
          flex-wrap: wrap;
        }

        .custom-slug-input-wrapper {
          display: flex;
          align-items: center;
          margin-top: 6px;
        }

        .custom-slug-prefix {
          font-size: var(--small-font);
          color: var(--primary-text);
          opacity: 0.5;
          font-family: ui-monospace, SFMono-Regular, monospace;
        }

        .custom-slug-input {
          border: none;
          border-bottom: 1px solid var(--rating-border-primary);
          outline: none;
          font-size: var(--small-font);
          font-family: ui-monospace, SFMono-Regular, monospace;
          color: var(--primary-text);
          background: transparent;
          padding: 4px 6px;
          width: 180px;
          transition: border-color 0.2s;
        }

        .custom-slug-input:focus {
          border-color: var(--primary-color);
        }

        .custom-slug-input::placeholder {
          color: var(--primary-text);
          opacity: 0.4;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .admin-header {
            padding: 12px 16px;
          }

          .search-section {
            padding: 16px;
            max-width: none;
          }

          .tabs-row {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            max-width: none;
          }

          .admin-main {
            padding: 0 16px 24px;
          }

          .pages-grid {
            grid-template-columns: 1fr;
          }

          .btn-primary span {
            display: none;
          }

          .page-card {
            padding: 20px;
          }

          .dialog-content {
            max-height: 90vh;
            border-radius: 16px;
          }

          .dialog-header {
            padding: 20px 20px 14px;
          }

          .dialog-body {
            padding: 20px;
          }
        }
      `}</style>
      </div>
  );
}

export default function AdminPage() {
  const token = useAuthToken() ?? null;
  const [authReady, setAuthReady] = useState(false);

  // Defer token gate until after URL → store sync (same layout-effect phase)
  useLayoutEffect(() => {
    setAuthReady(true);
  }, []);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--primary-background)]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--rating-border-primary)] border-t-[var(--primary-color)]" />
      </div>
    );
  }

  if (!token || !validateToken(token)) {
    return (
      <UnauthorizedAccess
        message="You are not allowed to view this page. A valid authentication token is required."
        showReturnHome={true}
      />
    );
  }

  return <AdminPageContent token={token} />;
}
