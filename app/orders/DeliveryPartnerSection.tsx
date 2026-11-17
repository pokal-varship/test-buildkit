import React, { FC, ReactNode } from "react";
import { Address, DriverInfo } from "@components/type/order.type";
import Icon from "@components/image/Icons";
import {
  DINNER_TABLE_ICON,
  DRIVER_IMG_ICON,
  GET_DIRECTIONS_ICON,
  PHONE_CALL_ICON,
} from "@config/Header/image.config";
import { getFullAddress, hasAssignedDriver } from "@lib/helper/orders";
import { orderStatusConfig, orderTypeConfig } from "./orders.config";
import { TranslationKeys } from "types";

interface DeliveryPartnerSectionProps {
  orderType?: string;
  orderStatus?: string;
  driverInfo?: DriverInfo | null;
  storefrontName?: string;
  storePhone?: string;
  storeAddress?: Address | null;
  lang: TranslationKeys;
}

const toTelHref = (phone: string) => `tel:${phone.replace(/\s+/g, "")}`;

const getDirectionsUrl = (address?: Address | null) => {
  const { latitude, longitude } = address ?? {};
  return latitude != null && longitude != null
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    : null;
};

const TITLE_CLASS =
  "font-700 small-font md:description-font text-[var(--primary-text)]";
const SUBTITLE_CLASS = "extra-small-font md-heading-6 text-[var(--secondary-text)] break-words";
const LINK_BASE =
  "flex items-center gap-1.5 shrink-0 px-2 py-2 md:py-3 rounded-full md:rounded-lg border font-600 md-heading-5 transition-opacity hover:opacity-80";
const CALL_LINK_CLASS =
  "border-[#007A2F] bg-[var(--success-opacity)] text-[#007A2F] w-auto md:w-[100px] justify-center";
const DIRECTIONS_LINK_CLASS =
  "border-[var(--accent-color)] bg-[var(--accent-color-opacity)] text-[var(--accent-color)]";

interface SectionCardProps {
  icon: string;
  title?: string | null;
  subtitle?: string;
  actions?: ReactNode;
}

const SectionCard: FC<SectionCardProps> = ({
  icon,
  title,
  subtitle,
  actions,
}) => (
  <div className="order-details-container w-full md:px-6 px-4 my-4">
    <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-[var(--primary-active-background)] border border-[var(--borders-dividers)]">
      <img
        src={icon}
        alt=""
        className="w-10 h-10 shrink-0 object-contain"
        aria-hidden
      />
      <div className="flex flex-1 min-w-0 gap-3 items-center justify-between">
        <div className="flex flex-col gap-0.5 min-w-0">
          {title && <p className={TITLE_CLASS}>{title}</p>}
          {subtitle && <p className={SUBTITLE_CLASS}>{subtitle}</p>}
        </div>
        {actions}
      </div>
    </div>
  </div>
);

interface ActionLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
  className: string;
  external?: boolean;
}

const ActionLink: FC<ActionLinkProps> = ({
  href,
  icon,
  label,
  className,
  external,
}) => (
  <a
    href={href}
    className={`${LINK_BASE} ${className}`}
    aria-label={label}
    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
  >
    {icon}
    <span className="hidden md:inline">{label}</span>
  </a>
);

const CallLink: FC<{ phone: string; label: string }> = ({ phone, label }) => (
  <ActionLink
    href={toTelHref(phone)}
    icon={
      <img
        src={PHONE_CALL_ICON}
        alt=""
        className="w-4 h-4 object-contain"
        aria-hidden
      />
    }
    label={label}
    className={CALL_LINK_CLASS}
  />
);

const DeliveryPartnerSection: FC<DeliveryPartnerSectionProps> = ({
  orderType,
  orderStatus,
  driverInfo,
  storefrontName,
  storePhone,
  storeAddress,
  lang,
}) => {
  if (orderType === orderTypeConfig.pickup) {
    const subtitle = getFullAddress(storeAddress);
    if (!storefrontName?.trim() && subtitle === "Unknown Address") return null;

    const phone = storePhone?.trim();
    const directionsUrl = getDirectionsUrl(storeAddress);

    return (
      <SectionCard
        icon={DINNER_TABLE_ICON}
        title={storefrontName?.trim()}
        subtitle={subtitle}
        actions={
          phone || directionsUrl ? (
            <div className="flex items-center gap-2 shrink-0">
              {phone && <CallLink phone={phone} label={lang.order.call} />}
              {directionsUrl && (
                <ActionLink
                  href={directionsUrl}
                  icon={
                    <Icon
                      icon={`${GET_DIRECTIONS_ICON}#direction`}
                      className="w-4 h-4 shrink-0"
                      width={16}
                      height={16}
                      color="var(--accent-color)"
                      viewBox="0 0 24 24"
                    />
                  }
                  label={lang.order.direction}
                  className={DIRECTIONS_LINK_CLASS}
                  external
                />
              )}
            </div>
          ) : undefined
        }
      />
    );
  }

  if (
    orderStatus === orderStatusConfig.cancelled ||
    orderStatus === orderStatusConfig.rejected ||
    orderStatus === orderStatusConfig.paymentFailed
  ) {
    return null;
  }

  const isAssigned = hasAssignedDriver(driverInfo);
  const phone = driverInfo?.contact_number?.trim();

  return (
    <SectionCard
      icon={DRIVER_IMG_ICON}
      title={
        isAssigned
          ? lang.order.deliveryPartnerGreeting.replace(
              "{{name}}",
              driverInfo?.name?.trim() || "",
            )
          : lang.order.deliveryPartnerAssignSoon
      }
      subtitle={
        isAssigned
          ? lang.order.deliveryPartnerGuarantee
          : lang.order.deliveryPartnerAssignDescription
      }
      actions={
        isAssigned && phone ? (
          <CallLink phone={phone} label={lang.order.call} />
        ) : undefined
      }
    />
  );
};

export default DeliveryPartnerSection;
