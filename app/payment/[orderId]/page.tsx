"use client";
import MyOrder from "@components/order/MyOrder";
import { open_dialog } from "@lib/modalHandler";
import { useParams } from "next/navigation";
import { useEffect } from "react";

// Helper function to validate order id pattern
function isValidOrderId(id: string): boolean {
    // Check if id is empty or undefined
    if (!id || typeof id !== 'string') {
        return false;
    }
    
    // Check if it contains dots (like com.chrome.devtools or file.json)
    if (id.includes('.')) {
        return false;
    }
    
    return true;
}

export default function PaymentPage() {
  const params = useParams<{ orderId: string}>()
  const orderId = params?.orderId || '';
  
  useEffect(() => {
    if (orderId && isValidOrderId(orderId)) {
      open_dialog("payment", {
        open: true,
        propsData: {
          orderId: orderId,
          fromPage: true,
        },
        type: "payment",
        handlerDialog: () => {},
        handleClose: () => {
          window.history.back()
        },
        anchor: "bottom",
        className: "payment-dialog",
        drawerBorderRadius: "0px",
        sxStyle: {
          '& .MuiDialogContent-root': {
            overflowX: "hidden",
          },
        },
      });
    }
  }, [orderId]);
  return <MyOrder />;;
}
