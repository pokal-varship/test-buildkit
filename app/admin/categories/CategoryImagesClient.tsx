"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import UppyMediaUpload from "@components/uppy/UppyMediaUpload";
import Modal from "@components/dialogDrawer/modal/Modal";
import { getTenantConfig } from "@config/tenant.config";
import { useTheme } from "context/ThemeProvider";
import { RootState } from "@redux/store";
import { getTenantStore } from "@services/homePage";
import { getStorePageData } from "@services/storePage";
import {
  CATEGORY_IMAGE_SOURCE,
  getCategoryImagePathFromUpload,
  updateStorePageImages,
  type PageConfigImage,
} from "../../../services/pageConfigService";
import { isTimeZone } from "@lib/helper";
import { appendAuthTokenToHref } from "@lib/tokenValidation";
import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";

interface StoreItem {
  id: string;
  name: string;
  slug: string;
}

interface StorePreview {
  store: StoreItem;
  images: PageConfigImage[];
}

interface CategoryImagesClientProps {
  token: string;
}

function resolveDisplayUrl(imagePath: string): string {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return (
    generateImageBase64FromUrl({
      url: imagePath,
      height: 400,
      width: null,
    })?.fullEncodedUrl || ""
  );
}

function resolveDownloadUrl(imagePath: string): string {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "";
  return `${base.replace(/\/$/, "")}/${imagePath.replace(/^\//, "")}`;
}

export default function CategoryImagesClient({
  token,
}: CategoryImagesClientProps) {
  const config = getTenantConfig();
  const { theme } = useTheme();
  const location = useSelector(
    (state: RootState) => state.location,
  ) as { latitude: number; longitude: number } | null;

  const [stores, setStores] = useState<StoreItem[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  const [previews, setPreviews] = useState<StorePreview[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeUppyDialog, setActiveUppyDialog] = useState(false);

  const withToken = useCallback(
    (href: string) => appendAuthTokenToHref(href, token),
    [token],
  );

  const selectedStores = stores.filter((store) =>
    selectedStoreIds.includes(store.id),
  );
  const allowMultiSelect = stores.length > 1;
  const allStoresSelected =
    stores.length > 0 && selectedStoreIds.length === stores.length;
  const activePreview = previews[carouselIndex] ?? null;
  const activeImage = activePreview?.images?.[0] ?? null;
  const hasAnyImage = previews.some((preview) => preview.images.length > 0);

  const fetchStores = useCallback(async () => {
    setStoresLoading(true);
    try {
      const lat = location?.latitude || 21.1959;
      const lng = location?.longitude || 72.8302;
      const tz = isTimeZone();
      const response = (await getTenantStore(lat, lng, tz)) as {
        data?: Array<{ id: string; name: string; slug: string }>;
      };
      const list =
        response?.data
          ?.filter((store) => store.slug)
          .map((store) => ({
            id: store.id,
            name: store.name,
            slug: store.slug,
          })) || [];
      setStores(list);
      setSelectedStoreIds((prev) => {
        if (prev.length > 0) {
          const valid = prev.filter((id) => list.some((store) => store.id === id));
          if (valid.length > 0) return valid;
        }
        return list[0] ? [list[0].id] : [];
      });
    } catch (error) {
      console.error("Failed to fetch stores:", error);
      setStores([]);
      setSelectedStoreIds([]);
      toast.error("Failed to load stores");
    } finally {
      setStoresLoading(false);
    }
  }, [location?.latitude, location?.longitude]);

  const loadSelectedStoreImages = useCallback(
    async (storesToLoad: StoreItem[]) => {
      if (storesToLoad.length === 0) {
        setPreviews([]);
        setCarouselIndex(0);
        return;
      }

      setImageLoading(true);
      try {
        const results = await Promise.all(
          storesToLoad.map(async (store) => {
            try {
              const data = await getStorePageData(
                "STORE",
                store.slug,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                token || undefined,
              );
              const pageConfig = (
                data as {
                  data?: { pageConfig?: { images?: PageConfigImage[] } };
                }
              )?.data?.pageConfig;
              const imagesList = pageConfig?.images;
              return {
                store,
                images: Array.isArray(imagesList) ? imagesList : [],
              } satisfies StorePreview;
            } catch (error) {
              console.error(
                `Failed to load category image for ${store.slug}:`,
                error,
              );
              return { store, images: [] } satisfies StorePreview;
            }
          }),
        );
        setPreviews(results);
        setCarouselIndex((prev) =>
          prev >= results.length ? Math.max(results.length - 1, 0) : prev,
        );
      } finally {
        setImageLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    void loadSelectedStoreImages(selectedStores);
    setCarouselIndex(0);
    // Only reload when selected store ids change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoreIds.join(","), stores, loadSelectedStoreImages]);

  const toggleStore = (storeId: string) => {
    setSelectedStoreIds((prev) => {
      if (!allowMultiSelect) return [storeId];
      if (prev.includes(storeId)) {
        // Keep at least one selected when possible
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== storeId);
      }
      return [...prev, storeId];
    });
  };

  const toggleSelectAll = () => {
    if (allStoresSelected) {
      setSelectedStoreIds(stores[0] ? [stores[0].id] : []);
      return;
    }
    setSelectedStoreIds(stores.map((store) => store.id));
  };

  const persistImages = async (
    nextImages: PageConfigImage[],
    successMessage: string,
  ) => {
    if (selectedStores.length === 0) {
      toast.error("Please select at least one store");
      return false;
    }

    setSaving(true);
    try {
      const results = await Promise.all(
        selectedStores.map((store) =>
          updateStorePageImages(
            {
              pageType: "STORE",
              storeId: store.id,
              images: nextImages,
            },
            token,
          ),
        ),
      );

      const failed = results.filter((result) => !result.success);
      if (failed.length > 0) {
        toast.error(
          failed[0]?.error ||
            `Failed to save for ${failed.length} store${failed.length > 1 ? "s" : ""}`,
        );
        return false;
      }

      setPreviews((prev) =>
        prev.map((preview) =>
          selectedStoreIds.includes(preview.store.id)
            ? { ...preview, images: nextImages }
            : preview,
        ),
      );
      toast.success(successMessage);
      return true;
    } catch {
      toast.error("Failed to save category image");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleOpenUppyDialog = () => {
    setActiveUppyDialog(true);
  };

  const handleCloseUppyDialog = () => {
    setActiveUppyDialog(false);
  };

  const handleUploadComplete = async (files: unknown[]) => {
    setActiveUppyDialog(false);

    if (!files?.length) {
      toast.error("No files were uploaded");
      return;
    }

    const imagePath = getCategoryImagePathFromUpload(
      files[0],
      CATEGORY_IMAGE_SOURCE,
    );

    if (!imagePath) {
      toast.error("Failed to get uploaded image path");
      return;
    }

    const nextImages: PageConfigImage[] = [
      {
        id: activeImage?.id || 1,
        url: imagePath,
      },
    ];

    const storeCount = selectedStores.length;
    await persistImages(
      nextImages,
      storeCount > 1
        ? `Category image applied to ${storeCount} stores`
        : "Category image uploaded successfully",
    );
  };

  const handleRemoveImage = async () => {
    if (!hasAnyImage) return;
    const storeCount = selectedStores.length;
    const confirmed = window.confirm(
      storeCount > 1
        ? `Remove this category image from ${storeCount} selected stores?`
        : "Remove this category image? The store page will no longer show a banner until you upload a new one.",
    );
    if (!confirmed) return;
    await persistImages(
      [],
      storeCount > 1
        ? `Category image removed from ${storeCount} stores`
        : "Category image removed",
    );
  };

  const handleDownloadImage = () => {
    const current = activeImage?.url;
    if (!current) return;

    const downloadUrl = resolveDownloadUrl(current);
    const fileName =
      current.split("/").pop() ||
      `category-image-${activePreview?.store.slug || "store"}.png`;

    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = fileName;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const goToPrev = () => {
    setCarouselIndex((prev) =>
      previews.length <= 1
        ? 0
        : (prev - 1 + previews.length) % previews.length,
    );
  };

  const goToNext = () => {
    setCarouselIndex((prev) =>
      previews.length <= 1 ? 0 : (prev + 1) % previews.length,
    );
  };

  const selectedStoreLabel =
    selectedStores.length === 0
      ? ""
      : selectedStores.length === 1
        ? selectedStores[0].name
        : `${selectedStores.length} selected stores`;
  const showCarousel = previews.length > 1;

  return (
    <div className="category-admin">
      <header className="category-header-wrapper">
        <div className="category-header">
          <div className="header-left">
            <Link href={withToken("/admin")} className="back-link" title="Back to admin">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
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
              <h1 className="header-title">{config?.appName || "Page Builder"}</h1>
            )}
          </div>
          <div className="header-right">
            <button
              type="button"
              className="btn-icon"
              onClick={() => {
                void fetchStores();
                void loadSelectedStoreImages(selectedStores);
              }}
              title="Refresh"
              disabled={storesLoading || imageLoading || saving}
            >
              <svg
                className={`icon ${storesLoading || imageLoading ? "spinning" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="category-main">
        <div className="page-intro">
          <h2 className="page-title">Category</h2>
          <p className="page-desc">
            Manage the category banner image shown on each store page.
            {allowMultiSelect
              ? " Select one or more stores to apply the same image."
              : ""}
          </p>
        </div>

        <section className="store-section">
          <div className="section-label-row">
            <h3 className="section-label">
              {allowMultiSelect ? "Select Stores" : "Select Store"}
            </h3>
            {allowMultiSelect && stores.length > 0 ? (
              <button
                type="button"
                className="select-all-btn"
                onClick={toggleSelectAll}
              >
                {allStoresSelected ? "Clear all" : "Select all"}
              </button>
            ) : null}
          </div>
          {storesLoading ? (
            <div className="loading-state compact">
              <div className="loading-spinner" />
              <p>Loading stores...</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="empty-inline">No stores found</div>
          ) : (
            <div className="stores-grid">
              {stores.map((store) => {
                const isSelected = selectedStoreIds.includes(store.id);
                return (
                  <label
                    key={store.id}
                    className={`store-card ${isSelected ? "store-card-active" : ""}`}
                  >
                    {allowMultiSelect ? (
                      <input
                        type="checkbox"
                        className="store-checkbox"
                        checked={isSelected}
                        onChange={() => toggleStore(store.id)}
                      />
                    ) : (
                      <input
                        type="radio"
                        className="store-checkbox"
                        name="category-store"
                        checked={isSelected}
                        onChange={() => toggleStore(store.id)}
                      />
                    )}
                    <span className="store-text">
                      <span className="store-name">{store.name}</span>
                      <span className="store-slug">/{store.slug}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </section>

        {selectedStores.length > 0 && (
          <section className="image-section">
            <div className="section-header">
              <div>
                <h3 className="section-title">Add Category Image</h3>
                <p className="section-desc">
                  Upload a banner for <strong>{selectedStoreLabel}</strong>.
                  Recommended size: 1280 × 380 px.
                </p>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={handleOpenUppyDialog}
                disabled={saving || imageLoading || selectedStores.length === 0}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{hasAnyImage ? "Replace Image" : "Upload Image"}</span>
              </button>
            </div>

            {imageLoading ? (
              <div className="loading-state compact">
                <div className="loading-spinner" />
                <p>Loading image...</p>
              </div>
            ) : !hasAnyImage && previews.length <= 1 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3>No category image yet</h3>
                <p>
                  {selectedStores.length > 1
                    ? "Upload an image to use as the banner on the selected stores' category pages."
                    : "Upload an image to show as the banner on this store's category page."}
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleOpenUppyDialog}
                  disabled={saving}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Upload Image</span>
                </button>
              </div>
            ) : (
              <article className="image-card">
                <div className="preview-carousel">
                  <div className="image-preview">
                    {activeImage ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolveDisplayUrl(activeImage.url)}
                          alt={`Category banner for ${activePreview?.store.name || "store"}`}
                          className="preview-img"
                        />
                        <div className="store-name-overlay">
                          {activePreview?.store.name}
                        </div>
                      </>
                    ) : (
                      <div className="preview-empty">
                        <div className="store-name-overlay">
                          {activePreview?.store.name}
                        </div>
                        <p>No image for this store</p>
                      </div>
                    )}

                    {showCarousel ? (
                      <>
                        <button
                          type="button"
                          className="carousel-nav carousel-prev"
                          onClick={goToPrev}
                          aria-label="Previous store preview"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="carousel-nav carousel-next"
                          onClick={goToNext}
                          aria-label="Next store preview"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                {showCarousel ? (
                  <div className="carousel-dots">
                    {previews.map((preview, index) => (
                      <button
                        key={preview.store.id}
                        type="button"
                        className={`carousel-dot ${index === carouselIndex ? "active" : ""}`}
                        onClick={() => setCarouselIndex(index)}
                        aria-label={`Show ${preview.store.name}`}
                      />
                    ))}
                  </div>
                ) : null}

                <div className="image-meta">
                  <p className="image-path">
                    {activeImage
                      ? activeImage.url
                      : activePreview
                        ? `No image for ${activePreview.store.name}`
                        : "No image"}
                    {showCarousel
                      ? ` · ${carouselIndex + 1}/${previews.length}`
                      : ""}
                  </p>
                  <div className="card-actions">
                    <button
                      type="button"
                      className="action-btn action-edit"
                      onClick={handleDownloadImage}
                      disabled={saving || !activeImage}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                    <button
                      type="button"
                      className="action-btn action-delete"
                      onClick={() => void handleRemoveImage()}
                      disabled={saving || !hasAnyImage}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
                      </svg>
                      {saving ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              </article>
            )}
          </section>
        )}
      </main>

      {activeUppyDialog && (
        <Modal
          isOpen={!!activeUppyDialog}
          onClose={handleCloseUppyDialog}
          title=""
          className="md:max-w-[800px] md:w-[90%] bg-[var(--quaternary-background)] media-upload-modal"
          containerClassName="!z-[200]"
        >
          <div className="w-full">
            <UppyMediaUpload
              onUploadComplete={(files) => void handleUploadComplete(files)}
              className="mb-4"
              limit={1}
              fileTypes={["image/*"]}
              maxSize={50 * 1024 * 1024}
              sourceDirectory={CATEGORY_IMAGE_SOURCE}
              autoOpenFileEditor={true}
            />
          </div>
        </Modal>
      )}

      <style>{`
        .category-admin {
          min-height: 100vh;
          background: var(--primary-background);
          font-family: var(--font-family);
        }

        .category-header-wrapper {
          background: var(--primary-background);
          border-bottom: 1px solid var(--rating-border-primary);
          position: sticky;
          top: 0;
          z-index: ${activeUppyDialog ? 1 : 40};
        }

        .category-header {
          max-width: 80rem;
          margin: 0 auto;
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .back-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid var(--rating-border-primary);
          color: var(--primary-text);
          text-decoration: none;
          transition: all 0.2s;
        }

        .back-link:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .back-link svg {
          width: 18px;
          height: 18px;
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

        .btn-icon:hover:not(:disabled) {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .btn-icon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

        .category-main {
          max-width: 80rem;
          margin: 0 auto;
          padding: 32px;
        }

        .page-intro {
          margin-bottom: 28px;
        }

        .page-title {
          margin: 0 0 8px;
          font-size: var(--heading-h3);
          font-weight: var(--font-bold);
          color: var(--primary-text);
        }

        .page-desc {
          margin: 0;
          color: var(--primary-text);
          opacity: 0.7;
          font-size: var(--description-font);
        }

        .section-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .section-label {
          margin: 0;
          font-size: var(--small-font);
          font-weight: var(--font-semi-bold);
          color: var(--primary-text);
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .select-all-btn {
          border: none;
          background: none;
          padding: 0;
          cursor: pointer;
          font-size: var(--small-font);
          font-weight: var(--font-semi-bold);
          color: var(--primary-color);
        }

        .select-all-btn:hover {
          text-decoration: underline;
        }

        .stores-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 8px;
          margin-bottom: 28px;
        }

        .store-card {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          text-align: left;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid var(--rating-border-primary);
          background: var(--cards-containers, var(--primary-background));
          cursor: pointer;
          transition: all 0.2s;
        }

        .store-card:hover {
          border-color: var(--primary-color);
        }

        .store-card-active {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 1px var(--primary-color);
        }

        .store-checkbox {
          margin-top: 2px;
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          accent-color: var(--button-primary-background);
          cursor: pointer;
        }

        .store-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .store-name {
          display: block;
          font-size: var(--small-font);
          font-weight: var(--font-semi-bold);
          color: var(--primary-text);
          line-height: 1.3;
        }

        .store-slug {
          display: block;
          font-size: var(--extraSmall-font);
          color: var(--primary-text);
          opacity: 0.55;
          font-family: ui-monospace, SFMono-Regular, monospace;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .image-section {
          background: var(--cards-containers, var(--primary-background));
          border: 1px solid var(--rating-border-primary);
          border-radius: 16px;
          padding: 24px;
        }

        .section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .section-title {
          margin: 0 0 6px;
          font-size: var(--heading-h5);
          font-weight: var(--font-bold);
          color: var(--primary-text);
        }

        .section-desc {
          margin: 0;
          font-size: var(--small-font);
          color: var(--primary-text);
          opacity: 0.7;
          max-width: 40rem;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: var(--font-semi-bold);
          cursor: pointer;
          background: var(--button-primary-background);
          color: var(--button-primary-text);
          font-size: var(--button-primary-font-size);
          border: var(--button-primary-border-width) solid var(--button-primary-border-color);
          transition: background 0.2s ease, color 0.2s ease;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--button-primary-hover-background);
          color: var(--button-primary-hover-text);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .image-card {
          border: 1px solid var(--rating-border-primary);
          border-radius: 12px;
          overflow: hidden;
          background: var(--primary-background);
        }

        .preview-carousel {
          position: relative;
        }

        .image-preview {
          background: var(--tertiary-background);
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .preview-img {
          width: 100%;
          max-height: 360px;
          object-fit: cover;
          display: block;
        }

        .preview-empty {
          width: 100%;
          min-height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-text);
          opacity: 0.7;
          font-size: var(--small-font);
          position: relative;
        }

        .store-name-overlay {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
          max-width: calc(100% - 32px);
          padding: 8px 14px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.55);
          color: #fff;
          font-size: var(--description-font);
          font-weight: var(--font-semi-bold);
          text-align: center;
          line-height: 1.3;
          pointer-events: none;
        }

        .carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 3;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          background: rgba(0, 0, 0, 0.45);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .carousel-nav:hover {
          background: rgba(0, 0, 0, 0.65);
          border-color: rgba(255, 255, 255, 0.55);
          color: #fff;
        }

        .carousel-nav svg {
          width: 18px;
          height: 18px;
        }

        .carousel-prev {
          left: 12px;
        }

        .carousel-next {
          right: 12px;
        }

        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          padding: 12px 0 4px;
        }

        .carousel-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          border: none;
          padding: 0;
          background: var(--rating-border-primary);
          cursor: pointer;
        }

        .carousel-dot.active {
          background: var(--button-primary-background);
          width: 18px;
        }

        .image-meta {
          padding: 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .image-path {
          margin: 0;
          font-size: var(--small-font);
          color: var(--primary-text);
          opacity: 0.65;
          font-family: ui-monospace, SFMono-Regular, monospace;
          word-break: break-all;
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
          transition: all 0.15s;
          border: 1px solid var(--rating-border-primary);
          background: var(--primary-background);
          color: var(--primary-text);
          cursor: pointer;
        }

        .action-btn svg {
          width: 16px;
          height: 16px;
        }

        .action-edit {
          background: var(--button-primary-background);
          color: var(--button-primary-text);
          border: var(--button-primary-border-width) solid var(--button-primary-border-color);
        }

        .action-edit:hover:not(:disabled) {
          background: var(--button-primary-hover-background);
          color: var(--button-primary-hover-text);
        }

        .action-delete {
          color: #dc2626;
          border-color: rgba(220, 38, 38, 0.35);
        }

        .action-delete:hover:not(:disabled) {
          background: rgba(220, 38, 38, 0.08);
          border-color: #dc2626;
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .empty-state,
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 20px;
          text-align: center;
          color: var(--primary-text);
        }

        .loading-state.compact {
          padding: 32px 16px;
          opacity: 0.75;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--rating-border-primary);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 12px;
        }

        .empty-icon {
          width: 56px;
          height: 56px;
          margin-bottom: 12px;
          color: var(--primary-text);
          opacity: 0.45;
        }

        .empty-icon svg {
          width: 100%;
          height: 100%;
        }

        .empty-state h3 {
          margin: 0 0 8px;
          font-size: var(--heading-h5);
        }

        .empty-state p {
          margin: 0 0 20px;
          opacity: 0.7;
          max-width: 28rem;
        }

        .empty-inline {
          padding: 20px;
          border-radius: 12px;
          border: 1px dashed var(--rating-border-primary);
          color: var(--primary-text);
          opacity: 0.7;
          margin-bottom: 24px;
        }

        .media-upload-modal {
          max-height: 90vh !important;
          height: 100vh !important;
        }

        @media (max-width: 640px) {
          .category-header,
          .category-main {
            padding-left: 16px;
            padding-right: 16px;
          }

          .section-header {
            flex-direction: column;
          }

          .btn-primary {
            width: 100%;
            justify-content: center;
          }

          .media-upload-modal {
            max-height: 100vh !important;
            height: 100vh !important;
          }
        }
      `}</style>
    </div>
  );
}
