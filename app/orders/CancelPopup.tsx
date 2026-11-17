"use client";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import RadioGroup from "./RadioGroup";
import { ReasonData } from "@components/type/order.type";
import { cancelOrder, getOrderCancelReasons } from "@services/orderPage";
import { useRouter } from "next/navigation";
import { useAppSearchParams } from "@context/SearchParamsContext";
import { useToast } from "@components/toast/Toast";
import CustomButton from "@components/buttons/Button";
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";
import { setShowOrderDetails } from "@redux/slices/ordersSlice";
import { useDispatch } from "react-redux";
import { useOrders } from "@hooks/useGetAllOrder";
import { DEFAULT_TENANT_ID } from "@services/typesense";
import Loader from "@components/loader/Loader";
import { CROSS_ICON } from "@config/Header/image.config";
import Icon from "@components/image/Icons";

type CancelPopupProps = {
  onClose: () => void;
  orderId?: string;
  storeId?: string;
};

const CancelPopup: FC<CancelPopupProps> = ({ onClose, orderId, storeId }) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const searchParams = useAppSearchParams();
  const router = useRouter();
  const toast = useToast();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { refetch } = useOrders({ tenantId: DEFAULT_TENANT_ID || "" });

  const [cancelReasonData, setCancelReasonData] = useState<ReasonData[]>([]);
  const [isReasonRequired, setIsReasonRequired] = useState(false);
  const [isLoadingReasons, setIsLoadingReasons] = useState(true);
  const [reasonsError, setReasonsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCancelOptions = async () => {
      try {
        setIsLoadingReasons(true);
        setReasonsError(null);
        const response = await getOrderCancelReasons();
        setCancelReasonData(response.reasons || []);
        setIsReasonRequired(response.isReasonRequired === true);
      } catch (error) {
        console.error("Error fetching cancel reasons:", error);
        setReasonsError("Failed to load cancellation reasons");
        setCancelReasonData([]);
        setIsReasonRequired(false);
      } finally {
        setIsLoadingReasons(false);
      }
    };
    fetchCancelOptions();
  }, []);

  const cancelOptions = useMemo(() => {
    if (!cancelReasonData || cancelReasonData.length === 0) {
      return [];
    }
    return cancelReasonData.map((option) => ({
      label: option.reasons?.en || "Unknown reason",
      value: option.id || "",
    }));
  }, [cancelReasonData]);

  const [cancelReason, setCancelReason] = useState("");

  const handleClose = useCallback(() => {
    setCancelReason("");
    onClose();
  }, [onClose]);

  const canConfirm =
    (isReasonRequired ? Boolean(cancelReason) : true) &&
    !isLoadingReasons &&
    !reasonsError &&
    // When required, need at least one reason option; when optional, empty list is OK.
    (isReasonRequired ? cancelOptions.length > 0 : true) &&
    !isLoading;

  const onCancelConfirm = async () => {
    if (!canConfirm || !orderId || !storeId) return;
    if (isReasonRequired && !cancelReason) return;

    setIsLoading(true);
    try {
      const response = await cancelOrder(orderId, cancelReason, storeId);
      toast("success", response.data.message);
      const params = searchParams.toString();
      const targetUrl = `/orders${params ? `?${params}` : ""}`;
      dispatch(setShowOrderDetails(true));
      router.push(targetUrl);
      handleClose();
      await refetch(true);
      window.location.reload();
    } catch (error) {
      const errorResponse = error as {
        response: { data: { message: string } };
      };
      toast("error", errorResponse?.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col relative h-full md:max-w-[475px] bg-[var(--cards-containers)]">
      <div className="flex flex-col flex-1 h-full overflow-y-auto hide-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-2 font-700 text-[var(--primary-text)]">
            Cancel Order
          </h2>
          <Icon
            icon={`${CROSS_ICON}#cross`}
            width={18}
            height={18}
            color={"var(--primary-text)"}
            viewBox="0 0 16 16"
            onClick={handleClose}
            className="cursor-pointer"
          />
        </div>
        {isLoadingReasons ? (
          <div className="flex flex-col justify-center items-center py-8">
            <Loader size={24} type="spinner" />
          </div>
        ) : reasonsError ? (
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-[var(--error)] mb-4">{reasonsError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[var(--button-primary-background)] text-[var(--button-primary-text)] rounded-md"
            >
              Retry
            </button>
          </div>
        ) : cancelOptions.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-[var(--secondary-text)]">
              {isReasonRequired
                ? "No cancellation reasons available"
                : "Reason is optional for this action."}
            </p>
          </div>
        ) : (
          <>
            <RadioGroup
              label={
                isReasonRequired
                  ? "Select reason *"
                  : "Select reason (optional)"
              }
              options={cancelOptions}
              optionContainerClassName="gap-3"
              value={cancelReason}
              onChange={(option) => setCancelReason(option.value)}
              name="cancelReason"
              containerClassName="mb-2"
              labelClassName="text-base"
              optionClassName=""
              radioClassName="cancel-radio"
            />
            {!isReasonRequired ? (
              <p className="text-sm text-[var(--secondary-text)] mb-4">
                Reason is optional for this action.
              </p>
            ) : null}
          </>
        )}
      </div>
      <CustomButton
        disabled={!canConfirm}
        onClick={onCancelConfirm}
        className="w-full mt-4"
      >
        {isLoading ? <Loader color="var(--button-primary-text)" size={24} /> : lang.confirm}
      </CustomButton>
    </div>
  );
};

export default CancelPopup;
