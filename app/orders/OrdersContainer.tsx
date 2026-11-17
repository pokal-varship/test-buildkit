"use client";
import React, { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import OrderTile from "./OrderTiel";
import { usePathname, useRouter } from "next/navigation";
import { useAppSearchParams } from "@context/SearchParamsContext";
import { TranslationKeys } from "types";
import useLang from "@hooks/useLang";
import { Order } from "@components/type/order.type";
import { setCurrentOrderDetails } from "@redux/slices/ordersSlice";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "@redux/store";
import OrderTileSkeleton from "./OrderTileSkeleton";
import SearchBox from "./SearchBox";
import { open_dialog } from "@lib/modalHandler";
import {
  selectIsQrFlowActive,
  selectDineInSessionData,
  selectDineInSessionProductCount,
} from "@redux/slices/qrFlowSlice";
import ActiveOrderTileQR from "./ActiveOrderTileQR";
import NoOrdersPlaceholder from "@components/order/NoOrdersPlaceholder";

const OrdersContainer = () => {
  const router = useRouter();
  const [lang]: [TranslationKeys, "en" | "ar"] = useLang();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const searchParams = useAppSearchParams();
  const { currentOrderDetails, orders, isLoading } = useSelector(
    (state: RootState) => state.orders,
  );
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const dineInSessionData = useSelector(selectDineInSessionData);
  const qrProductCount = useSelector(selectDineInSessionProductCount);
  const hasQrActiveTile =
    isQrFlowActive && dineInSessionData != null && qrProductCount >= 1;

  //filter drawer
  const [hasFilter, setHasFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setIsInitialLoad(false);
    }
  }, [isLoading]);

  const shouldShowSearchBox =
    isQrFlowActive || isInitialLoad || isLoading || (orders?.length ?? 0) > 0;
  const hasPastOrders = (orders?.length ?? 0) > 0;
  const hasNoOrders = !isInitialLoad && !isLoading && !hasPastOrders;
  // Hide the past-orders block only when QR has an active tile and we know there are no past orders.
  // Keep it visible while loading (skeletons) and whenever past orders exist.
  const shouldHideQrPastOrdersSection =
    isQrFlowActive &&
    hasQrActiveTile &&
    !hasPastOrders &&
    !isInitialLoad &&
    !isLoading;
  const shouldShowNoOrdersPlaceholder =
    hasNoOrders && (!isQrFlowActive || !hasQrActiveTile);
  const hideQrSearchActions = isQrFlowActive && hasNoOrders;

  // 245: QR + active card | 76: QR + search only | 55: empty | 133: non-QR with list
  const listScrollAreaTopMargin = hasQrActiveTile
    ? "mt-[245px]"
    : isQrFlowActive
      ? hasNoOrders
        ? "mt-[55px]"
        : "mt-[76px]"
      : hasNoOrders
        ? "mt-[55px]"
        : "mt-[133px]";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };
  const onFilterIconClick = () => {
    handleFilterIconClick();
  };
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      const currentParams = new URLSearchParams(searchParams.toString() || "");
      if (value) {
        currentParams.set("searchTerm", value);
      } else {
        currentParams.delete("searchTerm");
      }
      router.push(`${pathname}?${currentParams.toString()}`);
    }, 500),
    [searchParams.params], // empty deps array to preserve debounce
  );

  const onFilterClearIconClick = () => {
    const currentParams = new URLSearchParams(searchParams.toString() || "");
    currentParams.delete("orderType");
    currentParams.delete("timeFilter");
    router.push(
      `${pathname}${
        currentParams.toString() ? `?${currentParams.toString()}` : ""
      }`,
    );
    setHasFilter(false);
  };
  ///
  // const isMobile = useIsMobile();
  // const { orders, isLoading } = useOrders({
  //   tenantId: DEFAULT_TENANT_ID || "",
  // });

  useEffect(() => {
    if (searchParams.get("searchTerm")) {
      setSearchTerm(searchParams.get("searchTerm") || "");
    }
    if (searchParams.get("orderType") || searchParams.get("timeFilter")) {
      setHasFilter(true);
    } else {
      setHasFilter(false);
    }
  }, [searchParams.params]);
  // useEffect(() => {
  //   if(!isLoading && orders && orders?.length > 0) {
  //     if(!isMobile && !orderId) {
  //       const params = searchParams.toString();
  //       const targetUrl = `/orders/${orders[0].id}${params ? `?${params}` : ""}`;
  //       router.push(targetUrl);
  //       dispatch(setCurrentOrderDetails(orders[0]));
  //     }
  //   }else{
  //     dispatch(setCurrentOrderDetails(null));
  //   }
  // }, [ isLoading, orders, isMobile, orderId]);

  const handleOrderClick = (order: Order) => {
    const params = searchParams.toString();
    const targetUrl = `/orders/${order.id}${params ? `?${params}` : ""}`;
    router.push(targetUrl);
    dispatch(setCurrentOrderDetails(order));
  };

  const handleFilterIconClick = () => {
    open_dialog("orderFilters", {
      open: true,
      propsData: {},
      anchor: "bottom",
      type: "orderFilters",
      handlerDialog: () => {},
      handleClose: () => {},
      sxStyle: {
        "& .MuiPaper-root": {
          maxWidth: "500px",
          width: "100%",
          overflowY: "hidden",
          backgroundColor: "var(--tertiary-background) !important",
        },
      },
    });
  };
  return (
    <div className="orders-container md:max-w-[475px] w-full h-full flex-1 md:flex-none flex flex-col md:rounded-[10px] z-[1] border border-[var(--rating-border-primary)]">
      <div
        className={`px-4 md:px-0 fixed md:static left-0 right-0 z-10 bg-[var(--primary-background)] md:bg-transparent ${!isQrFlowActive ? "top-[65px]" : ""}`}
      >
        {!isQrFlowActive && (
          <h1 className="text-lg capitalize font-semibold py-4 md:hidden">
            {lang.order.myOrdersTitle}
          </h1>
        )}
        {/* <ul className="w-full flex gap-x-[10px] md:border-b border-[var(--borders-dividers)] pt-2 pb-4 md:py-5 md:px-3 ">
          {tabs.map((tab) => (
            <li
              key={tab.id}
              className={`flex-1 py-3 md:py-4 small-font md:description-font text-center rounded-[10px] cursor-pointer ${
                activeTab === tab.value
                  ? "bg-[var(--button-secondary-active-background)] font-semibold text-black"
                  : `bg-[var(--primary-tab-background)]  text-[var(--secondary-text)] border md:border-none  ${
                      theme === "light"
                        ? "border-[var(--borders-dividers)]"
                        : "border-none"
                    }`
              }`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </li>
          ))}
        </ul> */}
        {shouldShowSearchBox && (
          <SearchBox
            onFilterClearIconClick={onFilterClearIconClick}
            onFilterIconClick={onFilterIconClick}
            value={searchTerm}
            isFilterActive={hasFilter}
            onChange={handleSearchChange}
            onClearSearch={() => {
              setSearchTerm("");
              debouncedSearch("");
            }}
            isQrFlowMode={isQrFlowActive}
            title={lang.order.myOrdersTitle}
            hideQrCollapsedActions={hideQrSearchActions}
          />
        )}
        {isQrFlowActive && dineInSessionData != null && <ActiveOrderTileQR />}
      </div>
      {!shouldHideQrPastOrdersSection && (
        <div
          className={`md:mt-5 h-full flex-1 flex flex-col overflow-y-auto hide-scrollbar md:pt-0 md:bg-[var(--quaternary-background)] px-4 ${listScrollAreaTopMargin}`}
        >
          {isQrFlowActive &&
            dineInSessionData != null &&
            hasQrActiveTile &&
            hasPastOrders && (
              <span className="heading-5 px-4 pt-4 font-600 text-[var(--primary-text)]">
                {lang.order.pastOrders}
              </span>
            )}
          {isInitialLoad ? (
            [...Array(5)].map((_, index) => <OrderTileSkeleton key={index} />)
          ) : isLoading ? (
            [...Array(5)].map((_, index) => <OrderTileSkeleton key={index} />)
          ) : hasPastOrders ? (
            orders.map((order) => (
              <OrderTile
                order={order}
                onClick={() => handleOrderClick(order)}
                key={order?.id}
                isActive={order?.id === currentOrderDetails?.id}
              />
            ))
          ) : shouldShowNoOrdersPlaceholder ? (
            <div className="flex w-full flex-1 px-4 items-center justify-center min-h-[calc(100dvh-145px)] md:min-h-0">
              <NoOrdersPlaceholder />
            </div>
          ) : null}
        </div>
      )}
      <style>
        {" "}
        {`
      .orders-container {
        background-color: var(--quaternary-background);
      }
       @media (max-width: 768px) {
        .orders-container {
          background-color: var(--primary-tab-background);
        }
       }
  `}
      </style>
    </div>
  );
};

export default OrdersContainer;
