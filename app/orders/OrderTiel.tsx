import React, { FC } from 'react';
import { cn } from '@lib/utils';
import {
  getOrderDetailsStatusHeading,
  getOrderStatusColor,
  getOrderStatusIcon,
  getOrderStatusLabel,
  getOrderStatusOuterDotColor,
  getOrderTypeLabel,
  isOngoingOrderStatus,
} from '@lib/helper/orders';
import { ORDER_CANCEL_STATUS_ICON } from '@config/Header/image.config';
import { orderStatusConfig } from './orders.config';
import { Order } from '@components/type/order.type';
// import { getFormattedDateTime } from '@lib/helper/date';
import formatCurrency from '@lib/helper/price';
import { LanguageCode, TranslationKeys } from 'types';
import useLang from '@hooks/useLang';

interface OrderTileProps {
    isActive?: boolean;
  order: Order;
  containerClassName?: string;
  iconClassName?: string;
  orderIdClassName?: string;
  productCountClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  productNameClassName?: string;
  dateClassName?: string;
  orderAmountClassName?: string;
  onClick?: () => void;
}

const OrderTile: FC<OrderTileProps> = ({
  isActive,
  containerClassName,
  iconClassName,
  productCountClassName,
  contentClassName,
  // orderAmountClassName,
  headerClassName,
  // productNameClassName,
  dateClassName,
  onClick,
  order
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const OrderTypeIcon = getOrderStatusIcon(order.orderType);
  const isRejectedOrCancelledOrder =
    order.status === orderStatusConfig.rejected ||
    order.status === orderStatusConfig.cancelled;
  const orderStatusHeading =
    order.status === orderStatusConfig.delivered
      ? lang.order.completed
      : getOrderDetailsStatusHeading(order.status, lang, order.orderType) ||
        getOrderStatusLabel(order.status, lang);
  return (
    <>
      <div
        onClick={onClick}
        className={cn(
          `flex items-start gap-4 p-4 bg-[var(--cards-containers)] border-b border-[var(--borders-dividers)] rounded-2xl md:p-4 cursor-pointer mb-2.5  ${
            isActive
              ? "bg-[var(--secondary-active-background)] border border-[var(--button-secondary-border-color)]"
              : "border border-[var(--borders-dividers)]"
          }`,
          containerClassName
        )}
      >
        <div
          aria-label={getOrderTypeLabel(order.orderType, lang)}
          className={cn(
            "relative flex shrink-0 flex-col items-center justify-between gap-1 w-[74px] h-[74px] overflow-hidden rounded-lg px-1 py-2",
            isActive
              ? "bg-[var(--cards-containers)]"
              : "bg-[var(--primary-background)]",
            iconClassName
          )}
        >
          <OrderTypeIcon width={32} height={32} />
          <span className="extra-small-font md-heading-6 text-center leading-tight text-[var(--primary-color)]">
            {getOrderTypeLabel(order.orderType, lang)}
          </span>
        </div>

        <div className={cn(`flex flex-col flex-1 gap-y-1`, contentClassName)}>
          {/* <p className="text-sm text-[var(--secondary-text)] text-ellipsis max-w-full">{order.id}</p> */}
          <div
            className={cn("flex justify-between items-start", headerClassName)}
          >
            <p
              className={cn(
                "small-font md:description-font mt-1 font-500",
                productCountClassName
              )}
            >
              {order?.items?.length} Product
              {order?.items?.length > 1 ? "(s)" : ""}
            </p>
            {/* <span className={cn("hidden md:block", orderAmountClassName)}>
              ${order?.orderTotal?.finalAmount || ""}
            </span> */}
          </div>

          <span
            className={cn(
              "small-font  w-fit text-nowrap text-[var(--secondary-text)] ",
              dateClassName
            )}
          >
            {order?.storefrontName}
            {/* {getFormattedDateTime(order.createdAt)} */}
          </span>
          {/* <p
            className={cn(
              "small-font md:description-font font-500",
              productNameClassName
            )}
          >
            {order?.storefrontName}
          </p> */}
          <div className="flex justify-between items-center small-font md:description-font ">
            {/* <p className=" text-[var(--secondary-text)]">
              {" "}
              {getFormattedDateTime(order.createdAt)}
            </p> */}
            <p className="font-600">
              {formatCurrency({
                amount:
                  order?.orderTotal?.grandTotal ??
                  order?.orderTotal?.finalAmount,
              })}
            </p>
            <p
              className={cn(
                "flex items-center gap-1.5",
                order.status === orderStatusConfig.delivered
                  ? "text-[var(--success)]"
                  : order.status === orderStatusConfig.paymentFailed ||
                      isRejectedOrCancelledOrder
                    ? "text-[var(--error)]"
                    : "text-[var(--accent-color)]"
              )}
            >
              {isOngoingOrderStatus(order.status) && (
                <span
                  className="relative flex h-4 w-4 shrink-0 items-center justify-center"
                  aria-hidden
                >
                  <span
                    className="absolute h-4 w-4 rounded-full"
                    style={{ backgroundColor: getOrderStatusOuterDotColor() }}
                  />
                  <span
                    className="relative h-2 w-2 rounded-full"
                    style={{ backgroundColor: getOrderStatusColor(order.status) }}
                  />
                </span>
              )}
              {isRejectedOrCancelledOrder && (
                <img
                  src={ORDER_CANCEL_STATUS_ICON}
                  alt=""
                  className="h-4 w-4 shrink-0"
                  aria-hidden
                />
              )}
              {orderStatusHeading}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderTile;