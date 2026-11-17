"use client";

import { ORDER_SENT_ICON } from "@config/Header/image.config";
import BaseSuccessModal from "./BaseSuccessModal";
import useLang from "@hooks/useLang";
import { useQrFullMenuNavigation } from "@hooks/useQrFullMenuNavigation";
import React, { useEffect, useRef } from "react";
import { LanguageCode, TranslationKeys } from "types";
import { useSelector } from "react-redux";
import { selectSessionId, selectTicketId } from "@redux/slices/qrFlowSlice";
import useAnalytics from "@hooks/useAnalytics";

interface OrderSentModalProps {
  onClose?: () => void;
  tableNumber: string | null;
  onGoToActiveOrder: () => void;
  onAddMoreItems: () => void;
}

const OrderSentModal: React.FC<OrderSentModalProps> = ({
  // onClose,
  tableNumber,
  onGoToActiveOrder,
  onAddMoreItems,
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const { navigateToQrFullMenu } = useQrFullMenuNavigation();
  const sessionId = useSelector(selectSessionId);
  const ticketId = useSelector(selectTicketId);
  const hasTrackedView = useRef(false);
  const {
    trackDineInOrderSentViewed,
    trackDineInGoToActiveOrderClicked,
    trackDineInAddMoreItemsClicked,
  } = useAnalytics();

  useEffect(() => {
    if (hasTrackedView.current) return;
    hasTrackedView.current = true;
    void trackDineInOrderSentViewed({
      table_number: String(tableNumber || ""),
      session_id: String(sessionId || ""),
      ticket_id: String(ticketId || ""),
    });
  }, [
    tableNumber,
    sessionId,
    ticketId,
    trackDineInOrderSentViewed,
  ]);

  const handleGoToActiveOrder = () => {
    void trackDineInGoToActiveOrderClicked({
      table_number: String(tableNumber || ""),
      session_id: String(sessionId || ""),
    });
    onGoToActiveOrder();
  };

  const handleAddMoreItems = () => {
    void trackDineInAddMoreItemsClicked({
      source: "order_sent_modal",
      session_id: String(sessionId || ""),
    });
    onAddMoreItems();
    navigateToQrFullMenu();
  };

  const message = tableNumber 
    ? (
        <>
          {lang.orderSentDescription} <span style={{ color: 'var(--accent-color)' }}>{lang.table} {tableNumber}</span>
        </>
      )
    : lang.orderSentDescription;

  return (
    <BaseSuccessModal
      icon={{
        src: ORDER_SENT_ICON,
        alt: "Order sent",
        width: 120,
        height: 120,
      }}
      title={lang.orderSentTitle}
      message={message}
      primaryButton={{
        text: lang.goToActiveOrder,
        onClick: handleGoToActiveOrder,
        className: "font-700 !w-full heading-4",
      }}
      secondaryButton={{
        text: lang.addMoreItems,
        onClick: handleAddMoreItems,
        className: "font-700 !w-full heading-4 !bg-[var(--primary-background)]",
      }}
      containerClassName="order-sent-modal-container"
      contentClassName="order-sent-modal-content"
      titleClassName="order-sent-title"
      messageClassName="order-sent-description"
      buttonsClassName="order-sent-buttons"
      padding={{
        container: "30px 10px",
        content: "0px"
      }}
    />
  );
};

export default OrderSentModal;
