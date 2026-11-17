import React, { FC, ReactNode } from "react";
import {
  CustomerDetails,
  DeliveryInfo,
  Address,
} from "@components/type/order.type";
import LocationIcon from "@components/icons/LocationIcon";
import {
  MENU_STORE_ICON,
  EVENT_PHONE_ICON,
} from "@config/Header/image.config";
import {
  formatCustomerContactLine,
  getCustomerFirstName,
  getDeliveryAddressTitle,
  getFullAddress,
} from "@lib/helper/orders";
import { orderStatusConfig, orderTypeConfig } from "./orders.config";
import { TranslationKeys } from "types";

interface AddressDetailRowProps {
  iconSrc?: string;
  icon?: ReactNode;
  title: string;
  subtitle: string;
  showDivider?: boolean;
  padding?: boolean;
}

const AddressDetailRow: FC<AddressDetailRowProps> = ({
  iconSrc,
  icon,
  title,
  subtitle,
  showDivider = false,
  padding = false,
}) => (
  <div
    className={`flex gap-3 ${padding ? "py-4 md:py-5" : ""} ${
      showDivider ? "border-b border-[var(--borders-dividers)]" : ""
    }`}
  >
    <span className="flex shrink-0 items-center justify-center rounded-full border border-[var(--rating-border-primary)] w-9 h-9">
      {icon ?? (
        <img
          src={iconSrc}
          alt=""
          className="w-4 h-4 object-contain"
          aria-hidden
        />
      )}
    </span>
    <div className="flex flex-col gap-0.5 min-w-0">
      <p className="font-700 small-font md-heading-4 text-[var(--primary-text)]">
        {title}
      </p>
      {subtitle ? (
        <p className="extra-small-font md-heading-6 text-[var(--secondary-text)] break-words">
          {subtitle}
        </p>
      ) : null}
    </div>
  </div>
);

interface OrderAddressDetailsSectionProps {
  storefrontName?: string;
  storeAddress?: Address;
  orderType?: string;
  orderStatus?: string;
  deliveryInfo?: DeliveryInfo | null;
  customerDetails?: CustomerDetails | null;
  lang: TranslationKeys;
}

const OrderAddressDetailsSection: FC<OrderAddressDetailsSectionProps> = ({
  storefrontName,
  storeAddress,
  orderType,
  orderStatus,
  deliveryInfo,
  customerDetails,
  lang,
}) => {
  const isDelivery = orderType === orderTypeConfig.delivery;
  const isPickup = orderType === orderTypeConfig.pickup;
  const isDelivered = orderStatus === orderStatusConfig.delivered;

  if (isPickup) {
    return null;
  }
  const storeAddressText = getFullAddress(storeAddress);
  const deliveryAddressText = getFullAddress(deliveryInfo);
  const deliveryTitle = getDeliveryAddressTitle(deliveryInfo?.type, lang);

  const customerFirstName = getCustomerFirstName(customerDetails);
  const contactSubtitle = customerFirstName
    ? lang.order.deliveryPartnerWillContact.replace(
        "{{name}}",
        customerFirstName,
      )
    : lang.order.deliveryPartnerWillContactYou;

  const contactTitle = formatCustomerContactLine(customerDetails);

  const hasStoreRow = Boolean(storefrontName?.trim() || storeAddressText);
  const hasDeliveryRow =
    isDelivery && Boolean(deliveryTitle || deliveryAddressText);
  const hasContactRow =
    isDelivery &&
    !isDelivered &&
    Boolean(contactTitle || contactSubtitle);

  if (!hasStoreRow && !hasDeliveryRow && !hasContactRow) {
    return null;
  }

  return (
    <div className="order-details-container w-full border border-[var(--rating-border-primary)] md:px-6 px-4 hidden md:block">
      {hasStoreRow && (
          <AddressDetailRow
            iconSrc={MENU_STORE_ICON}
            title={storefrontName?.trim() || storeAddressText}
            subtitle={
              storefrontName?.trim() ? storeAddressText : ""
            }
            showDivider={hasDeliveryRow || hasContactRow}
            padding
          />
        )}
        {(hasDeliveryRow || hasContactRow) && (
          <div className="flex flex-col gap-y-5 py-4 md:py-5">
            {hasDeliveryRow && (
              <AddressDetailRow
                icon={
                  <LocationIcon
                    variant="default"
                    width={16}
                    height={16}
                    fill="var(--primary-text)"
                  />
                }
                title={deliveryTitle}
                subtitle={deliveryAddressText}
              />
            )}
            {hasContactRow && (
              <AddressDetailRow
                iconSrc={EVENT_PHONE_ICON}
                title={contactTitle}
                subtitle={contactSubtitle}
              />
            )}
          </div>
        )}
    </div>
  );
};

export default OrderAddressDetailsSection;
