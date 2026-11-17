import { useState, useEffect, useCallback } from "react";
import { getAllOrders } from "@services/orderPage";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@redux/store";
import {
  setOrders,
  setIsLoading,
  setError,
  setShowOrderDetails,
} from "@redux/slices/ordersSlice";
import { getPayloadStatus } from "@lib/helper/orders";
import { useAppSearchParams } from "@context/SearchParamsContext";

type UseOrdersParams = {
  tenantId: string;
};

export const useOrders = ({ tenantId }: UseOrdersParams) => {
  const dispatch = useDispatch();
  const searchParams = useAppSearchParams();
  const [filters, setFilters] = useState({
    orderType: searchParams.get("orderType") || "",
    timeFilter: searchParams.get("timeFilter") || "",
    searchTerm: searchParams.get("searchTerm") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
  });
  useEffect(() => {
    setFilters({
      orderType: searchParams.get("orderType") || "",
      timeFilter: searchParams.get("timeFilter") || "",
      searchTerm: searchParams.get("searchTerm") || "",
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
    });
  }, [searchParams.params]);

  const { orders, isLoading, error } = useSelector(
    (state: RootState) => state.orders,
  );
  const [page, setPage] = useState<number>(1);
  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  const fetchOrders = useCallback(
    async (reset = false) => {
      dispatch(setIsLoading(true));
      dispatch(setError(null));
      const payloadOrderType =
        filters.orderType === "ALL" ? "" : getPayloadStatus(filters.orderType);

      try {
        const response = await getAllOrders(
          tenantId,
          payloadOrderType,
          filters.searchTerm,
          filters.timeFilter,
          filters.startDate,
          filters.endDate,
          // page,
          // limit
        );
        if (reset) {
          dispatch(setOrders(response.data));
          dispatch(setShowOrderDetails(true));
        } else {
          dispatch(setOrders([...orders, ...response.data]));
        }
      } catch (err) {
        dispatch(setError(err instanceof Error ? err : new Error(String(err))));
      } finally {
        dispatch(setIsLoading(false));
      }
    },
    [
      tenantId,
      filters.orderType,
      filters.searchTerm,
      filters.timeFilter,
      filters.startDate,
      filters.endDate,
      orders,
    ],
  );

  useEffect(() => {
    if (page > 1) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    setPage(1);
    fetchOrders(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.orderType,
    filters.searchTerm,
    filters.timeFilter,
    filters.startDate,
    filters.endDate,
  ]);

  // useEffect(() => {
  //   console.log(tenantId, filters.orderType, "tenantIdstatus");
  //   setPage(1);
  // }, [ tenantId, filters.orderType]);

  return { orders, isLoading, error, refetch: fetchOrders, loadMore };
};

// export const useGetOrderById = (orderId: string) => {
//   const dispatch = useDispatch();
//   const { currentOrderDetails, isOrderDetailsLoading, orderDetailsError } = useSelector((state: RootState) => state.orders);
// console.log(orderId, 'orderIdin useGetOrderById');
//   const fetchOrderById = useCallback(async () => {
//     dispatch(setIsOrderDetailsLoading(true));
//     dispatch(setOrderDetailsError(null));
//     try {
//         try {
//         const response = await getOrderById(orderId);
//         console.log(response, 'response');
//         if(response?.data && response?.data?.length > 0) {
//           dispatch(setCurrentOrderDetails(response.data[0]));
//         }
//       } catch (err) {
//         dispatch(setOrderDetailsError(err instanceof Error ? err : new Error(String(err))));
//       }
//     } catch (err) {
//       dispatch(setOrderDetailsError(err instanceof Error ? err : new Error(String(err))));
//     } finally {
//       dispatch(setIsOrderDetailsLoading(false));
//     }
//   }, [orderId]);

//   useEffect(() => {
//     if(orderId) {
//       fetchOrderById();
//     }
//   }, [orderId]);

//   return { currentOrderDetails, isOrderDetailsLoading, orderDetailsError, refetch: fetchOrderById };
// };
