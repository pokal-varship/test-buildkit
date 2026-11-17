"use client";
import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import ModifierGroupList from "./ModifierGroupList";
import QuantityControls from "./QuantityControls";
import {
  OrderItemListProps,
  ComboGroup,
  CartItem,
  UpsellProduct,
} from "./order.type";
import { useQuantityControls } from "@hooks/useQuantityControls";
import { useTicketQuantityControls } from "@hooks/useTicketQuantityControls";
import SpecialInstructionsInput from "./SpecialInstructionsInput";
import formatCurrency from "@lib/helper/price";
import { getTenantConfig } from "@config/tenant.config";
import {
  EXTRA_OFF_ICON,
  FREEBIES_CELEBRATION_ICON,
  NON_VEG_ICON,
  OFFER_GIFT_BOX_ICON,
  UPSELL_PLUS_ICON,
  VEG_ICON,
  COIN_ICON,
} from "@config/Header/image.config";
import AddOnsList from "./AddOnList";
import FreebiesModal from "@components/dialogDrawer/modal/Order/FreebiesModal";
import useProductUrl from "@hooks/useProductUrl";
import Tooltip from "@components/ui/Tooltip";
import {
  selectDineInSessionData,
  selectDraftTicketAppliedOffers,
} from "@redux/slices/qrFlowSlice";
import type { SessionTicketItem } from "@services/sessionService";
import type { AppliedOffer as AppliedOfferType } from "./order.type";
import { useSessionTicketItems } from "@hooks/useQrSessionDerivedState";

type AppliedOffer = AppliedOfferType & {
  freeQuantity?: number;
  /** Offer context from API (e.g. IN_STORE / REMOTE) */
  orderContext?: string;
  /** Some APIs use offerContext instead of orderContext */
  offerContext?: string;
};

/** Cart uses cartItemId; ticket API uses ticketItemId — same line as display item.id */
const getOfferLineItemId = (offer: AppliedOffer): string =>
  offer.ticketItemId ?? offer.cartItemId ?? "";

const ComboGroupItem: React.FC<{
  group: ComboGroup;
  language: string;
  isQrFlow?: boolean;
}> = ({ group, language, isQrFlow }) => {
  // Get the first variant attribute value to display
  const variantValue = group?.variantAttributes
    ? Object.values(group.variantAttributes)[0]
    : null;

  return (
    <div className="mt-2 text-sm text-[var(--primary-text)]">
      <div className="flex items-center">
        <span className="heading-6 md-heading-5 text-[var(--primary-text)]">
          {group?.productName?.[language]}
          {variantValue ? ` (${variantValue})` : ""}
        </span>
      </div>
      {group?.modifierGroup && (
        <ModifierGroupList
          item={{
            modifierGroup: group.modifierGroup,
            id: group.id,
            quantity: group.quantity,
          }}
          language={language}
          isQrFlow={isQrFlow}
        />
      )}
    </div>
  );
};

const OrderItemList: React.FC<OrderItemListProps> = ({
  cartItems,
  language,
  lang,
  cartId,
  upsellProducts,
  cartData,
  handleOpenFreebiesModal,
  store,
  showFreebiesModal,
  storeId,
  offerId,
  cartItemsId,
  UpdateSelectedFreebie,
  handleCloseFreebiesModal,
  key,
  isQrFlow = false,
}) => {
  const { showStrikethroughPrice } = getTenantConfig();
  const { handleQuantity } = useQuantityControls(cartId as string);
  const { handleTicketQuantity } = useTicketQuantityControls();
  const { getCartItemProductUrl } = useProductUrl();
  const storeSlug = store?.currentStore?.slug;
  const sessionTicketItems = useSessionTicketItems();
  const dineInSessionData = useSelector(selectDineInSessionData);
  const ticketAppliedOffers = useSelector(selectDraftTicketAppliedOffers);

  const appliedOffers = React.useMemo((): AppliedOffer[] => {
    if (isQrFlow) return ticketAppliedOffers ?? [];
    return (cartData?.data?.appliedOffers as AppliedOffer[] | undefined) ?? [];
  }, [isQrFlow, ticketAppliedOffers, cartData?.data?.appliedOffers]);

  /** Map session ticket item to cart-like shape for display (same keys as normal cart items; data source differs) */
  const ticketItemToDisplayItem = (item: SessionTicketItem): CartItem =>
    ({
      id: item.id,
      productId: item.itemId,
      productName: item.productName ?? { en: item.itemName },
      productSlug: item.productSlug ?? "",
      productCategorySlug: item.productCategorySlug ?? "",
      productCategory: item.productCategory ?? { en: "" },
      productCategoryId: item.itemCategoryId ?? "",
      quantity: item.quantity,
      unitBasePrice: item.unitBasePrice ?? item.unitPrice,
      totalBasePrice: item.totalBasePrice ?? item.quantity * item.unitPrice,
      totalBasePriceAfterBaseDiscount:
        item.totalBasePriceAfterBaseDiscount ?? item.totalPrice,
      totalBaseDiscountAmount: item.totalBaseDiscountAmount ?? 0,
      totalOfferDiscountAmount: 0,
      subTotalAfterDiscount:
        item.totalBasePriceAfterBaseDiscount ?? item.totalPrice,
      subTotalBeforeDiscountAndTaxes:
        item.totalBasePrice ?? item.quantity * item.unitPrice,
      modifierGroup: (item.modifierGroup as CartItem["modifierGroup"]) ?? null,
      specialInstructions: item.specialInstructions ?? "",
      productType:
        (typeof (item as { productType?: string }).productType === "string"
          ? (item as { productType?: string }).productType
          : undefined) ?? "REGULAR",
      comboGroups: (item as { comboGroups?: CartItem["comboGroups"] })
        .comboGroups,
      cartId: "",
      storefrontId: "",
      menuSlug: "",
      variantAttributes:
        (item as unknown as { variantAttributes?: Record<string, string> })
          .variantAttributes ?? {},
      variantId: item.variantId ?? "",
      metaData: item.metaData as Record<string, unknown> | undefined,
      productSku: item.productSku ?? "",
      estimatedLoyaltyPoints: item.estimatedLoyaltyPoints,
    }) as CartItem;

  const displayItems = React.useMemo(() => {
    if (isQrFlow) {
      return sessionTicketItems
        .filter((ticketItem) => {
          const offer = appliedOffers.find(
            (o) =>
              getOfferLineItemId(o) === ticketItem.id &&
              o.offerType === "FREEBIE",
          );
          return !offer;
        })
        .map(ticketItemToDisplayItem);
    }
    return (
      cartItems?.filter((item) => {
        const offer = appliedOffers.find(
          (o) => getOfferLineItemId(o) === item.id && o.offerType === "FREEBIE",
        );
        return !offer;
      }) ?? []
    );
  }, [isQrFlow, sessionTicketItems, cartItems, appliedOffers]);

  // Create a map of cartItemId/ticketItemId to upsell products for efficient lookup (same for normal and QR flow)
  const upsellMap = React.useMemo(() => {
    const map = new Map<string, UpsellProduct[]>();
    const list = upsellProducts as unknown as Array<{
      cartItemId?: string;
      ticketItemId?: string;
      upsellProducts?: UpsellProduct[];
    }>;
    list?.forEach((item) => {
      const key = item.ticketItemId ?? item.cartItemId;
      if (key && item.upsellProducts) map.set(key, item.upsellProducts);
    });
    return map;
  }, [upsellProducts]);

  const handleFreebiesModal = (offerId: string) => {
    handleOpenFreebiesModal(offerId);
  };

  const getOfferType = (itemId: string) => {
    if (!appliedOffers.length) return undefined;
    const offer = appliedOffers.find((o) => getOfferLineItemId(o) === itemId);
    return offer?.offerType;
  };

  // Get freebie items and their offers (only in normal flow)
  const getFreebieItems = () => {
    if (isQrFlow || !appliedOffers.length) return [];
    const freebieOffers =
      appliedOffers.filter((offer) => offer.offerType === "FREEBIE") || [];

    return freebieOffers
      .map((offer: AppliedOffer) => {
        const lineItemId = getOfferLineItemId(offer);
        const freebieItem = cartItems?.find((item) => item.id === lineItemId);
        return {
          offer,
          item: freebieItem,
        };
      })
      .filter((freebie) => freebie.item);
  };

  const freebieItems = getFreebieItems();

  return (
    <div
      className={`p-4 rounded-md ${isQrFlow ? "qr-flow-order-item-wrapper" : "order-item-wrapper"}`}
    >
      {/* Regular Cart Items / QR Flow Ticket Items */}
      {displayItems?.map((item, index) => {
        // Get upsell products for this specific cart item (only in non-QR flow)
        const itemUpsellProducts = (upsellMap.get(item.id) ||
          []) as UpsellProduct[];
        const variantLabel =
          (item?.variantAttributes as Record<string, string> | undefined)
            ?.size ||
          (item?.variantAttributes as Record<string, string> | undefined)?.[
            "Size Options"
          ] ||
          (item?.variantAttributes
            ? Object.values(item.variantAttributes as Record<string, string>)[0]
            : "");
        const estimatedLoyaltyPts = Number(item.estimatedLoyaltyPoints);
        const showEstimatedLoyalty =
          Number.isFinite(estimatedLoyaltyPts) && estimatedLoyaltyPts > 0;
        return (
          <div
            key={item.id}
            className={`my-0 ${isQrFlow ? "qr-flow-item-detail" : ""}`}
          >
            {/* Product Name and Price */}
            <div className="order-item-name-price">
              <div className="product-name-container">
                <div className="flex items-center gap-2">
                  <img
                    src={
                      item?.metaData?.["productAttributes.containsMeat"]
                        ? NON_VEG_ICON
                        : VEG_ICON
                    }
                    alt="dietary-indicator"
                    className="w-4 h-4"
                  />
                  <Link
                    href={getCartItemProductUrl(
                      item?.productSlug,
                      item?.productCategorySlug,
                      item?.menuSlug || "all-day",
                      storeSlug,
                    )}
                    className="product-name font-semibold text-lg modifier-item cursor-pointer"
                    prefetch={true}
                  >
                    {item?.productName?.[language]}
                    {variantLabel ? `, ${variantLabel}` : ""}
                  </Link>
                </div>
              </div>
              <h4 className="product-price flex items-center">
                {item.totalBaseDiscountAmount > 0 && showStrikethroughPrice && (
                  <span className="line-through">
                    {formatCurrency({ amount: item.totalBasePrice })}
                  </span>
                )}
                <span className="product-price-after-discount">
                  {formatCurrency({
                    amount:
                      item.totalBasePriceAfterBaseDiscount ??
                      item.totalBasePrice ??
                      0,
                  })}
                </span>
              </h4>
            </div>

            {/* Applied Offers — cart: data.appliedOffers; QR: draft ticket data.appliedOffers */}
            {appliedOffers
              .filter((offer: AppliedOffer) => {
                if (getOfferLineItemId(offer) !== item.id) return false;
                if (!isQrFlow) return true;
                const ctx = (
                  offer.orderContext ??
                  offer.offerContext ??
                  ""
                ).toUpperCase();
                if (!ctx) return true;
                return ctx === "IN_STORE" || ctx === "INSTORE";
              })
              .map((offer: AppliedOffer) => (
                <div key={offer.id} className="mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="badge">
                        <img
                          src={EXTRA_OFF_ICON}
                          alt="offer"
                          className="w-4 h-4 extra-off-icon"
                        />
                        <Tooltip text={offer.offerName[language]}>
                          <span className="extra-off-text">
                            {offer.offerName[language]}
                          </span>
                        </Tooltip>
                      </div>
                    </div>
                    <h4 className="product-price flex items-center">
                      <span className="discount-amount">
                        - {formatCurrency({ amount: offer.discountAmount })}
                      </span>
                    </h4>
                  </div>
                </div>
              ))}

            {/* Combo Group */}
            {item.productType === "COMBO" && item.comboGroups && (
              <div className="mt-0">
                {item.comboGroups.map((group) => (
                  <ComboGroupItem
                    key={group.id}
                    group={group}
                    language={language}
                    isQrFlow={isQrFlow}
                  />
                ))}
              </div>
            )}

            {/* Modifier Group */}
            {item.modifierGroup && (
              <ModifierGroupList
                item={item}
                language={language}
                isQrFlow={isQrFlow}
              />
            )}

            {showEstimatedLoyalty && (
              <div
                className="mt-2 inline-flex max-w-full items-center gap-1 rounded-[10px] px-3 py-1 extra-small-font font-semibold uppercase tracking-tight text-[var(--loyalty-badge-bg)]"
                style={{
                  background:
                    "linear-gradient(90deg, #EBD5FF 0%, rgba(236, 215, 255, 0) 80.33%)",
                }}
                role="status"
                aria-label={`Earn ${estimatedLoyaltyPts} loyalty points`}
              >
                <span>Earn</span>
                <img
                  src={COIN_ICON}
                  alt=""
                  className="h-4 w-4 shrink-0"
                  aria-hidden
                />
                <span>{estimatedLoyaltyPts} PTS</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 mt-2">
              {/* Quantity Controls - same UI for both normal and QR flow */}
              {(cartId || isQrFlow) && (
                <QuantityControls
                  item={item}
                  cartId={
                    isQrFlow
                      ? (dineInSessionData?.sessionId ?? "")
                      : (cartId ?? "")
                  }
                  language={language}
                  handleOpenFreebiesModal={handleOpenFreebiesModal}
                  offerType={getOfferType(item.id)}
                  isQrFlow={isQrFlow}
                />
              )}

              {/* Special Instructions */}
              <SpecialInstructionsInput
                itemId={item.id}
                initialValue={item.specialInstructions}
                placeholder={lang.addSpecialInstructionsHere}
                onSubmit={(customType, itemId, value) => {
                  if (
                    isQrFlow &&
                    customType === "UPDATE_SPECIAL_INSTRUCTIONS"
                  ) {
                    handleTicketQuantity(
                      "UPDATE_SPECIAL_INSTRUCTIONS",
                      itemId,
                      { instructions: value },
                    );
                  } else {
                    handleQuantity(customType, itemId, value);
                  }
                }}
                item={item}
              />
            </div>
            {item?.specialInstructions &&
              item?.specialInstructions?.trim?.() !== "" && (
                <div className="flex items-start gap-2 mt-2">
                  <p className="special-instructions-text">
                    &quot;{item?.specialInstructions}&quot;
                  </p>
                </div>
              )}

            {/* Add Ons - Only show if there are upsell products for this item */}
            {itemUpsellProducts.length > 0 && (
              <AddOnsList
                lang={lang}
                currency="$"
                PLUS_ICON={UPSELL_PLUS_ICON}
                productType={item?.productType}
                productId={item.id}
                cartItemId={item.id}
                upsellProducts={itemUpsellProducts}
              />
            )}

            {/* Divider */}
            {index !== displayItems.length - 1 && !isQrFlow && (
              <div className="divider border-t my-4" />
            )}
          </div>
        );
      })}

      {/* Divider between regular items and freebie */}
      {!isQrFlow && freebieItems.length > 0 && displayItems.length > 0 && (
        <div className="divider border-t my-4" />
      )}

      {/* Freebie Section - only in normal flow */}
      {!isQrFlow && freebieItems.length > 0 && !showFreebiesModal && (
        <div className="freebie-section">
          {freebieItems.map(({ offer, item }) => {
            if (!item) return null;
            const offerName =
              offer.offerName[language] || offer.offerName.en || "Freebie";
            const selectedCount = offer.freeQuantity || 1;

            return (
              <div key={offer.id} className="freebie-container">
                <div className="freebie-header">
                  <div className="freebie-header-content">
                    <div
                      className="freebie-header-top"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <img
                        src={FREEBIES_CELEBRATION_ICON}
                        alt="freebies-celebration"
                        width={22}
                        height={22}
                      />
                      <div className="freebie-unlocked-title">
                        {lang.youUnlocked} {offerName}!
                      </div>
                    </div>

                    <div
                      className="freebie-choose-text"
                      style={{ marginTop: "2px" }}
                    >
                      {lang.chooseYour} {offerName} {lang.item} ({selectedCount}
                      /{selectedCount})
                    </div>
                  </div>
                </div>

                <div className="freebie-item-card">
                  <div className="freebie-item-main">
                    <div className="freebie-item-content">
                      <div className="freebie-item-info">
                        <div className="freebie-item-name">
                          {item?.productName?.[language]}
                          {item?.variantAttributes?.size
                            ? `, ${item?.variantAttributes?.size}`
                            : ""}
                        </div>
                        <div className="freebie-item-details">
                          {item?.variantAttributes &&
                            Object.entries(item.variantAttributes)
                              .filter(([key]) => key.toLowerCase() !== "size")
                              .map(([value]) => value)
                              .join(" • ")}
                          {!item?.variantAttributes &&
                            item?.variantAttributes?.size && (
                              <span>{item.variantAttributes.size}</span>
                            )}
                        </div>
                      </div>
                      <div className="freebie-item-actions">
                        <div className="freebie-badge">
                          <img
                            src={OFFER_GIFT_BOX_ICON}
                            alt="freebie"
                            className="freebie-badge-icon"
                          />
                          <span className="freebie-badge-text">
                            <Tooltip text={offerName.toUpperCase()}>
                              <span className="extra-off-text">
                                {offerName.toUpperCase()}
                              </span>
                            </Tooltip>
                          </span>
                        </div>
                        <div
                          className="freebie-change-text"
                          onClick={() => handleFreebiesModal(item.productId)}
                        >
                          {lang.change}
                        </div>
                      </div>
                    </div>
                    <div className="freebie-price-section">
                      {item.totalBasePrice &&
                        item.totalBasePriceAfterBaseDiscount &&
                        item.totalBasePrice >
                          item.totalBasePriceAfterBaseDiscount && (
                          <div className="freebie-price-line">
                            <span className="freebie-price-original">
                              {formatCurrency({ amount: item.totalBasePrice })}
                            </span>
                          </div>
                        )}
                      <div className="freebie-price-line">
                        <span className="freebie-price-current">
                          {formatCurrency({
                            amount:
                              item.finalPrice ||
                              item.subTotalAfterBaseAndOfferDiscount ||
                              0,
                          })}
                        </span>
                      </div>
                      <div className="freebie-price-line">
                        <span className="freebie-discount-amount">
                          -{formatCurrency({ amount: offer.discountAmount })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showFreebiesModal && (
        <FreebiesModal
          key={key}
          storeId={storeId as string}
          cartId={cartId as string}
          offerId={offerId as string}
          cartItemsId={cartItemsId as string}
          UpdateSelectedFreebie={UpdateSelectedFreebie as string}
          handleCloseFreebiesModal={handleCloseFreebiesModal}
        />
      )}
      <style>{`
                .special-instructions {
                    font-size: var(--description-font);
                    color: var(--primary-text);
                    font-style: italic;
                }
                .special-instructions-text {
                    font-size: var(--description-font);
                    color: var(--secondary-text);
                    font-style: italic;
                    font-weight: var(--font-regular);
                    word-break: break-word;
                    overflow-wrap: break-word;
                    line-height: 1.4;
                    margin: 0;
                }
                .line-through {
                    text-decoration: line-through;
                    opacity: 0.5;
                    margin-right: 8px;
                    font-size: var(--heading-h4);
                }
                .product-price-before-discount {
                    font-size: var(--heading-h4);
                }

                .order-item-name-price {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .badge {
                    display: inline-flex;
                    align-items: center;
                    background-color: var(--success);
                    color:var(--white);
                    padding: 4px 8px;
                    border-radius: 20px;
                    font-weight: var(--font-bold);
                    font-size: var(--small-font);
                    max-width: 100%;
                    min-width: 0;
                }
                .extra-off-icon {
                    margin-right: 2px;
                    margin-bottom: 2px;
                }
                .extra-off-text {
                    font-weight: var(--font-semi-bold);
                    font-size: var(--small-font);
                    margin-bottom: 1px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    max-width: 100px;
                    display: inline-block;
                    min-width: 0;
                    flex-shrink: 1;
                    cursor: pointer;
                }
                .discount-amount {
                    font-size: var(--description-font);
                    font-weight: var(--font-regular);
                    color: var(--success);
                }
                .product-name-container {
                    width: 100%;
                }
                .change-offer-text {
                    font-size: var(--small-font);
                    font-weight: var(--font-regular);
                    color: var(--accent-color);
                    cursor: pointer;
                }
                .freebie-section {
                    margin-bottom: 20px;
                }
                .freebie-container {
                    background: linear-gradient(90deg, var(--product-offer-bg-start) 0%, var(--product-offer-bg-end) 100%);
                    border-radius: 5px;
                    padding: 12px;
                }
                .freebie-header {
                    margin-bottom: 16px;
                }
                .freebie-header-content {
                    width: 100%;
                }
                .freebie-celebration-section {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                }
                .freebie-celebration-icon {
                    flex-shrink: 0;
                }
                .freebie-header-text {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .freebie-unlocked-title {
                    font-weight: var(--font-bold);
                    font-size: var(--heading-h6);
                    color: var(--success);
                }
                .freebie-choose-text {
                    font-weight: var(--font-regular);
                    font-size: var(--extraSmall-font);
                    color: var(--secondary-text);
                }
                .freebie-item-card {
                    background: var(--cards-containers);
                    border-radius: 5px;
                    padding: 12px;
                }
                .freebie-item-main {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                .freebie-item-image-container {
                    flex-shrink: 0;
                    width: 80px;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .freebie-item-image {
                    width: 80px;
                    height: 80px;
                    object-fit: contain;
                    border-radius: 8px;
                }
                .freebie-item-content {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .freebie-item-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .freebie-item-name {
                    font-weight: var(--font-bold);
                    font-size: var(--heading-h5);
                    color: var(--primary-text);
                    line-height: 1.4;
                }
                .freebie-item-details {
                    font-size: var(--small-font);
                    color: var(--secondary-text);
                    line-height: 1.3;
                }
                .freebie-item-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                .freebie-badge {
                    display: inline-flex;
                    align-items: center;
                    background-color: var(--freebie-tag-color);
                    color: var(--black);
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-weight: bold;
                    font-size: var(--small-font);
                    gap: 4px;
                }
                .freebie-badge-icon {
                    width: 16px;
                    height: 16px;
                }
                .freebie-badge-text {
                    font-weight: var(--font-semi-bold);
                    font-size: var(--small-font);
                    white-space: nowrap;
                    display: flex;
                }
                .freebie-change-text {
                    font-size: var(--small-font);
                    font-weight: var(--font-regular);
                    color: var(--accent-color);
                    cursor: pointer;
                    white-space: nowrap;
                }
                .freebie-change-text:hover {
                    text-decoration: underline;
                }
                .freebie-price-section {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 4px;
                    flex-shrink: 0;
                    min-width: 80px;
                }
                .freebie-price-line {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                }
                .freebie-price-original {
                    font-size: var(--description-font);
                    color: var(--secondary-text);
                    text-decoration: line-through;
                    opacity: 0.7;
                }
                .freebie-price-current {
                    font-size: var(--heading-h5);
                    font-weight: var(--font-bold);
                    color: var(--primary-text);
                }
                .freebie-discount-amount {
                    font-size: var(--description-font);
                    font-weight: var(--font-regular);
                    color: var(--success);
                }
                @media (max-width: 768px) {
                    .line-through {
                        text-decoration: line-through;
                        opacity: 0.5;
                        font-size: var(--small-font);
                    }
                    .product-price-after-discount {
                        font-size: var(--small-font);
                    }
                    .order-item-name-price {
                        display: flex;
                        align-items: start;
                        justify-content: space-between;
                        gap: 8px;
                    }
                    .product-price {
                        margin-top: 3px;
                        flex-shrink: 0;
                    }
                    .product-name-container {
                        width: 70%;
                        flex: 1;
                    }
                    .extra-off-text {
                        max-width: 120px;
                    }
                    .freebie-container {
                        padding: 10px;
                    }
                    .freebie-header {
                        margin-bottom: 12px;
                    }
                    .freebie-header-top {
                        margin-bottom: 4px;
                    }
                    .freebie-celebration-icon {
                        width: 20px;
                        height: 20px;
                    }
                    .freebie-unlocked-title {
                        font-size: var(--description-font);
                        line-height: 1.3;
                    }
                    .freebie-choose-text {
                        font-size: var(--extraSmall-font);
                        line-height: 1.4;
                        margin-top: 4px;
                    }
                    .freebie-item-card {
                        padding: 10px;
                    }
                    .freebie-item-main {
                        flex-direction: row;
                        gap: 8px;
                        align-items: flex-start;
                    }
                    .freebie-item-image-container {
                        display: none;
                    }
                    .freebie-item-image {
                        display: none;
                    }
                    .freebie-item-content {
                        width: 100%;
                        gap: 6px;
                    }
                    .freebie-item-info {
                        gap: 3px;
                        margin-bottom: 6px;
                    }
                    .freebie-item-name {
                        font-size: var(--description-font);
                        line-height: 1.4;
                        word-break: break-word;
                    }
                    .freebie-item-details {
                        font-size: var(--extraSmall-font);
                        line-height: 1.3;
                    }
                    .freebie-item-actions {
                        width: 100%;
                        justify-content: flex-start;
                        gap: 8px;
                    }
                    .freebie-badge {
                        padding: 4px 8px;
                        font-size: var(--extraSmall-font);
                        gap: 3px;
                    }
                    .freebie-badge-icon-text {
                        font-size: 12px;
                    }
                    .freebie-badge-text {
                        font-size: var(--extraSmall-font);
                    }
                    .freebie-badge-icon {
                        width: 12px;
                        height: 12px;
                    }
                    .freebie-change-text {
                        font-size: var(--extraSmall-font);
                    }
                    .freebie-price-section {
                        align-items: flex-end;
                        width: auto;
                        margin-top: 0;
                        min-width: 70px;
                        flex-shrink: 0;
                    }
                    .freebie-price-original {
                        font-size: var(--extraSmall-font);
                    }
                    .freebie-price-current {
                        font-size: var(--description-font);
                        font-weight: var(--font-semi-bold);
                    }
                    .freebie-discount-amount {
                        font-size: var(--small-font);
                        font-weight: var(--font-semi-bold);
                    }
                }
            `}</style>
    </div>
  );
};

export default OrderItemList;
