"use client";
import React, { useCallback, useEffect, useState } from "react";
import { DialogClose, DialogOpen } from "../lib/rxSubject";
import Dialog from "../components/dialogDrawer/dialog";
import { SxProps, Theme } from '@mui/material/styles';

interface DialogData {
  open: boolean;
  type: string;
  dialogData: any;
  propsData: any;
  anchor: "top" | "left" | "bottom" | "right";
  className?: string;
  onlyDialog?: boolean;
  forceDrawer?: boolean;
  drawerBorderRadius?: string;
  /** Dialog position when shown as Dialog (desktop): center | top | bottom | left | right */
  dialogPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  sxStyle?: SxProps<Theme>;
  handleClose?: () => void;
}

const DialogHoc: React.FC = () => {
  const [dialog, setDialog] = useState<Record<string, DialogData>>({});

  const open_dialog = useCallback((dialog: any) => {
    const dialogType = dialog.dialogData?.dialogId
      ? dialog.type + "??" + dialog.dialogData.dialogId
      : dialog.type;
    if (
      typeof dialog.dialogData !== "undefined" &&
      dialog.dialogData.closeAll === true
    ) {
      setTimeout(() => {
        setDialog((prev) => ({
          ...prev,
          [dialogType]: {
            ...dialog,
            open: true,
            type: dialog.type,
            dialogData: dialog.dialogData || {},
            propsData: dialog.propsData || {},
            anchor: dialog?.anchor,
            className: dialog?.className,
            onlyDialog: dialog?.onlyDialog,
            forceDrawer: dialog?.forceDrawer,
            drawerBorderRadius: dialog?.drawerBorderRadius,
            dialogPosition: dialog?.dialogPosition,
            sxStyle: dialog?.sxStyle,
          },
        }));
      }, 20);
      return;
    }
    setDialog((prev) => ({
      ...prev,
      [dialogType]: {
        ...dialog,
        open: true,
        type: dialog.type,
        dialogData: dialog.dialogData || {},
        propsData: dialog.propsData || {},
        anchor: dialog?.anchor,
        className: dialog?.className,
        onlyDialog: dialog?.onlyDialog,
        forceDrawer: dialog?.forceDrawer,
        drawerBorderRadius: dialog?.drawerBorderRadius,
        dialogPosition: dialog?.dialogPosition,
        sxStyle: dialog?.sxStyle,
      },
    }));
  }, []);

  const close_dialog = useCallback((params: any) => {
    const type = params?.[0];
    const dialogId = params?.[1];
    const dialogType = dialogId?.length > 0 ? type + "??" + dialogId : type;
    setDialog((prev) => {
      const updatedDialog = { ...prev };
      if (updatedDialog[dialogType]) {
        updatedDialog[dialogType]["open"] = false;
      }
      return updatedDialog;
    });
  }, []);

  useEffect(() => {
    const openSubscription = DialogOpen.subscribe(open_dialog);
    const closeSubscription = DialogClose.subscribe(close_dialog);
    return () => {
      openSubscription.unsubscribe();
      closeSubscription.unsubscribe();
    };
  }, []);

  const dialogContent = Object.values(dialog);
  
  return (
    <div>
      {dialogContent.map((dialog) => {
        return (
          <Dialog
            open={dialog.open}
            type={dialog.type}
            handleClose={() => {
              if (dialog?.dialogData?.handleClose) {
                dialog?.dialogData?.handleClose?.(null);
              } else {
                dialog?.handleClose?.();
              }
              close_dialog([dialog.type, dialog.dialogData?.dialogId]);
            }}
            handlerDialog={() => open_dialog(dialog)}
            propsData={dialog.propsData}
            key={dialog.type + `${dialog.dialogData?.dialogId || ""}`}
            anchor={dialog?.anchor || "bottom"}
            className={dialog?.className}
            onlyDialog={dialog?.onlyDialog || false}
            forceDrawer={dialog?.forceDrawer}
            drawerBorderRadius={dialog?.drawerBorderRadius}
            dialogPosition={dialog?.dialogPosition}
            sxStyle={dialog?.sxStyle}
          />
        );
      })}
    </div>
  );
};

export default DialogHoc;
