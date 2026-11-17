"use client";

import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import RadioGroup from "@app/orders/RadioGroup";
import { ReasonData } from "@components/type/order.type";
import {
  deleteCustomerAccount,
  getDeleteAccountReasons,
} from "@services/profileService";
import { logout } from "@services/authService";
import { useToast } from "@components/toast/Toast";
import CustomButton from "@components/buttons/Button";
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";
import Loader from "@components/loader/Loader";
import { CROSS_ICON } from "@config/Header/image.config";
import Icon from "@components/image/Icons";
import { useSession, signOut } from "next-auth/react";
import { ExtendedSession } from "@components/header/types";
import { removeCookie } from "@lib/cookie";
import useWallet from "@hooks/useWallet";

type DeleteAccountPopupProps = {
  onClose: () => void;
};

const DeleteAccountPopup: FC<DeleteAccountPopupProps> = ({ onClose }) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const toast = useToast();
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const { handleClearWallet } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const [reasonData, setReasonData] = useState<ReasonData[]>([]);
  const [isReasonRequired, setIsReasonRequired] = useState(false);
  const [isLoadingReasons, setIsLoadingReasons] = useState(true);
  const [reasonsError, setReasonsError] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState("");

  useEffect(() => {
    const fetchReasons = async () => {
      try {
        setIsLoadingReasons(true);
        setReasonsError(null);
        const response = await getDeleteAccountReasons();
        setReasonData(response.reasons || []);
        setIsReasonRequired(response.isReasonRequired === true);
      } catch (error) {
        console.error("Error fetching delete-account reasons:", error);
        setReasonsError(lang.failedToLoadDeleteReasons);
        setReasonData([]);
        setIsReasonRequired(false);
      } finally {
        setIsLoadingReasons(false);
      }
    };
    fetchReasons();
  }, [lang.failedToLoadDeleteReasons]);

  const reasonOptions = useMemo(() => {
    if (!reasonData.length) return [];
    return reasonData.map((option) => ({
      label: option.reasons?.en || "Unknown reason",
      value: option.id || "",
    }));
  }, [reasonData]);

  const handleClose = useCallback(() => {
    setSelectedReason("");
    onClose();
  }, [onClose]);

  const canConfirm =
    (isReasonRequired ? Boolean(selectedReason) : true) &&
    !isLoadingReasons &&
    !reasonsError &&
    (isReasonRequired ? reasonOptions.length > 0 : true) &&
    !isLoading;

  const clearSession = async () => {
    try {
      if (session?.user?.clientName) {
        await logout(
          String(session.user.clientName),
          String(session.user.userId),
          String(session.user?.refreshToken)
        );
      }
    } catch {
      // Account already deleted — still clear local session.
    }
    handleClearWallet();
    await signOut({ redirect: false });
    removeCookie("token");
    removeCookie("orderType");
  };

  const onConfirmDelete = async () => {
    if (!canConfirm) return;
    if (isReasonRequired && !selectedReason) return;

    setIsLoading(true);
    try {
      const response = await deleteCustomerAccount(selectedReason);
      toast(
        "success",
        response?.message || lang.accountDeletedSuccessfully
      );
      handleClose();
      await clearSession();
      window.location.href = "/";
    } catch (error) {
      const errorResponse = error as {
        response?: { data?: { message?: string } };
      };
      toast(
        "error",
        errorResponse?.response?.data?.message || lang.failedToDeleteAccount
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col relative h-full md:max-w-[475px] bg-[var(--cards-containers)]">
      <div className="flex flex-col flex-1 h-full overflow-y-auto hide-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-2 font-700 text-[var(--primary-text)]">
            {lang.deleteAccount}
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
        <p className="text-sm text-[var(--secondary-text)] mb-4">
          {lang.deleteAccountDescription}
        </p>
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
        ) : reasonOptions.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-[var(--secondary-text)]">
              {isReasonRequired
                ? lang.noDeleteReasonsAvailable
                : lang.reasonOptionalForDelete}
            </p>
          </div>
        ) : (
          <>
            <RadioGroup
              label={
                isReasonRequired
                  ? lang.selectDeleteReasonRequired
                  : lang.selectDeleteReasonOptional
              }
              options={reasonOptions}
              optionContainerClassName="gap-3"
              value={selectedReason}
              onChange={(option) => setSelectedReason(option.value)}
              name="deleteAccountReason"
              containerClassName="mb-2"
              labelClassName="text-base"
              optionClassName=""
              radioClassName="cancel-radio"
            />
            {!isReasonRequired ? (
              <p className="text-sm text-[var(--secondary-text)] mb-4">
                {lang.reasonOptionalForDelete}
              </p>
            ) : null}
          </>
        )}
      </div>
      <CustomButton
        disabled={!canConfirm}
        onClick={onConfirmDelete}
        className="w-full mt-4"
      >
        {isLoading ? (
          <Loader color="var(--button-primary-text)" size={24} />
        ) : (
          lang.deleteAccount
        )}
      </CustomButton>
    </div>
  );
};

export default DeleteAccountPopup;
