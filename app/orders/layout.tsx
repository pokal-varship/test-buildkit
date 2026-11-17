"use client";
import useLang from "@hooks/useLang";
import OrdersContainer from "./OrdersContainer";
import { LanguageCode, TranslationKeys } from "types";
import "./orders.css";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppSearchParams } from "@context/SearchParamsContext";
import { useOrders } from "@hooks/useGetAllOrder";
import { DEFAULT_TENANT_ID } from "@services/typesense";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import useIsMobile from "@hooks/useIsMobile";
import {
  setCurrentOrderDetails,
  setShowOrderDetails,
} from "@redux/slices/ordersSlice";
import { RootState } from "@redux/store";
import { useOrderMqtt } from "@hooks/useOrderMqtt";

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const searchParams = useAppSearchParams();
  const { showOrderDetails } = useSelector((state: RootState) => state.orders);
  const orderId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  useOrderMqtt();
  const { orders, isLoading } = useOrders({
    tenantId: DEFAULT_TENANT_ID || "",
  });
  useEffect(() => {
    if (!isLoading && orders && orders?.length > 0) {
      if (!isMobile && showOrderDetails) {
        const params = searchParams.toString();
        const targetUrl = `/orders/${orders[0].id}${
          params ? `?${params}` : ""
        }`;
        dispatch(setCurrentOrderDetails(orders[0]));
        dispatch(setShowOrderDetails(false));
        router.push(targetUrl);
      }
    } else {
      dispatch(setCurrentOrderDetails(null));
    }
  }, [isLoading, orders, isMobile, orderId]);
  return (
    <div className="w-full flex flex-col h-full min-h-[calc(100vh-260px)] md:h-[calc(100vh-82px-53px)] md:p-5 bg-[var(--primary-tab-background)] text-[var(--primary-text)]">
      <h1 className="heading-2 font-700 pb-2 md:block hidden ">
        {lang.order.myOrdersTitle}
      </h1>
      <div className="flex-1 h-full overflow-hidden flex-col md:flex-row gap-x-8 hidden md:flex">
        <OrdersContainer />
        {children}
      </div>
      <div className="md:hidden flex-1 flex flex-col">{children}</div>
    </div>
  );
}
