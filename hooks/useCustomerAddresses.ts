"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ExtendedSession } from "@components/header/types";
import { AddressEditData } from "@components/checkOut/checkout.type";
import useAnalytics from "@hooks/useAnalytics";
import { open_dialog } from "@lib/modalHandler";
import { loginSuccessSubject } from "@lib/rxSubject";
import {
  setAddresses,
  setSelectedAddress,
  setLoading,
  setError,
  setCoordinates,
} from "@redux/slices/userAddressSlice";
import { store, RootState } from "@redux/store";
import { getCustomerAddress } from "@services/checkOutService";
import { useSession } from "next-auth/react";

const ADD_ADDRESS_DIALOG_SX = {
  "& .MuiDialogContent-root": {
    padding: 0,
    overflowX: "hidden",
    overflowY: "hidden",
  },
};

interface UseCustomerAddressesOptions {
  storeId?: string;
  handleDeliveryAddressId: (id: string | null) => void;
  fetchOnMount?: boolean;
  loginTrackContext?: string;
  drawerBorderRadius?: string;
}

export function useCustomerAddresses({
  storeId,
  handleDeliveryAddressId,
  fetchOnMount = false,
  loginTrackContext = "cart_checkout",
  drawerBorderRadius,
}: UseCustomerAddressesOptions) {
  const dispatch = useDispatch();
  const { addresses, selectedAddressId, loading } = useSelector(
    (state: RootState) => state.userAddress,
  );
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null;
    status: "loading" | "authenticated" | "unauthenticated";
  };
  const { trackSignIn } = useAnalytics();
  const handleDeliveryAddressIdRef = useRef(handleDeliveryAddressId);
  handleDeliveryAddressIdRef.current = handleDeliveryAddressId;
  const isFetchingRef = useRef(false);

  const fetchAddresses = useCallback(async () => {
    if (
      !storeId ||
      status !== "authenticated" ||
      !session?.user?.email ||
      !session?.user?.isAuthenticated ||
      isFetchingRef.current
    ) {
      return;
    }

    const currentSelectedId = store.getState().userAddress.selectedAddressId;

    try {
      isFetchingRef.current = true;
      dispatch(setLoading(true));
      const res = await getCustomerAddress(storeId);
      const addressList = Array.isArray(res.data) ? res.data : [];
      dispatch(setAddresses(addressList));

      if (!addressList?.length) {
        handleDeliveryAddressIdRef.current(null);
        return;
      }

      if (addressList.length > 0 && !currentSelectedId) {
        const defaultId = addressList[0].id!;
        dispatch(setSelectedAddress(defaultId));
        handleDeliveryAddressIdRef.current(defaultId);
        dispatch(
          setCoordinates({
            latitude: addressList[0].coordinates?.latitude || 0,
            longitude: addressList[0].coordinates?.longitude || 0,
          }),
        );
      } else if (currentSelectedId) {
        const addressExists = addressList.some(
          (addr) => addr.id === currentSelectedId,
        );
        if (!addressExists) {
          const defaultId = addressList[0].id!;
          dispatch(setSelectedAddress(defaultId));
          handleDeliveryAddressIdRef.current(defaultId);
          dispatch(
            setCoordinates({
              latitude: addressList[0].coordinates?.latitude || 0,
              longitude: addressList[0].coordinates?.longitude || 0,
            }),
          );
        } else {
          handleDeliveryAddressIdRef.current(currentSelectedId);
          dispatch(setSelectedAddress(currentSelectedId));
          dispatch(
            setCoordinates({
              latitude:
                addressList.find((addr) => addr.id === currentSelectedId)
                  ?.coordinates?.latitude || 0,
              longitude:
                addressList.find((addr) => addr.id === currentSelectedId)
                  ?.coordinates?.longitude || 0,
            }),
          );
        }
      }
    } catch (error) {
      handleDeliveryAddressIdRef.current(null);
      const errorResponse = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (errorResponse?.response?.status === 403) {
        dispatch(setError(null));
        return;
      }
      dispatch(
        setError(
          error instanceof Error ? error.message : "Failed to fetch addresses",
        ),
      );
    } finally {
      isFetchingRef.current = false;
      dispatch(setLoading(false));
    }
  }, [
    storeId,
    status,
    session?.user?.email,
    session?.user?.isAuthenticated,
    dispatch,
  ]);

  const openAddAddressDialog = useCallback(
    (editData?: AddressEditData) => {
      open_dialog("addAddress", {
        open: true,
        propsData: {
          editData,
          fetchAddresses,
        },
        type: "addAddress",
        handlerDialog: fetchAddresses,
        handleClose: () => {},
        anchor: "bottom",
        ...(drawerBorderRadius ? { drawerBorderRadius } : {}),
        sxStyle: ADD_ADDRESS_DIALOG_SX,
      });
    },
    [fetchAddresses, drawerBorderRadius],
  );

  const handleAddAddress = useCallback(() => {
    if (!session?.user?.email) {
      const currentUrl = window.location.pathname + window.location.search;
      const source =
        window.location.pathname === "/"
          ? "homepage"
          : window.location.pathname || "homepage";
      trackSignIn(source, loginTrackContext);
      open_dialog("login", {
        open: true,
        propsData: {
          redirectUrl: currentUrl,
          storeId,
          onSuccess: () => {
            loginSuccessSubject.next("cart_login");
          },
        },
        type: "login",
        handlerDialog: () => {},
        handleClose: () => {},
        anchor: "bottom",
        onlyDialog: false,
        sxStyle: {
          "& .MuiDialogContent-root": {
            padding: "20px 16px",
            backgroundColor: "var(--tertiary-background)",
          },
        },
      });
      return;
    }

    openAddAddressDialog();
  }, [session?.user?.email, storeId, trackSignIn, loginTrackContext, openAddAddressDialog]);

  useEffect(() => {
    if (
      !fetchOnMount ||
      !storeId ||
      status !== "authenticated" ||
      !session?.user?.email ||
      !session?.user?.isAuthenticated
    ) {
      return;
    }

    void fetchAddresses();
  }, [
    fetchOnMount,
    storeId,
    status,
    session?.user?.email,
    session?.user?.isAuthenticated,
    fetchAddresses,
  ]);

  return {
    addresses,
    selectedAddressId,
    loading,
    fetchAddresses,
    handleAddAddress,
    openAddAddressDialog,
  };
}
