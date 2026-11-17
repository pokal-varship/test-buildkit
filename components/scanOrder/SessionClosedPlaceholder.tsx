'use client';

import React from 'react';
import CustomButton from '@components/buttons/Button';
import { TICK_CIRCLE_ICON } from '@config/Header/image.config';
import { close_dialog, open_dialog } from '@lib/modalHandler';

export type SessionClosedPlaceholderProps = {
  open: boolean;
  onClose: () => void;
  onStartNewSession: () => void;
  tableNo?: string | number | null;
  totalPaid?: string | number | null;
  time?: string | null;
};

export default function SessionClosedPlaceholder({
  open,
  // onClose,
  // onStartNewSession,
  tableNo,
  totalPaid,
  time,
}: SessionClosedPlaceholderProps) {
  if (!open) return null;

  const hasDetails =
    [tableNo, totalPaid, time].some((v) => {
      if (v == null) return false;
      if (typeof v === 'string') return v.trim().length > 0;
      return true; // numbers/other truthy values
    });

  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: 'Table no:', value: tableNo ?? '—' },
    { label: 'Total Paid:', value: totalPaid ?? '—' },
    { label: 'Time:', value: time ?? '—' },
  ];

  const handleOpenScanQrModal = () => {
    open_dialog('scanQrCode', {
      open: true,
      propsData: {},
      anchor: 'bottom',
      type: 'scanQrCode',
      handlerDialog: () => {},
      handleClose: () => {
        close_dialog(['scanQrCode']);
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-[1100] bg-[var(--primary-background)] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Session closed"
    >
      <div className="h-full w-full flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          <div className="w-full max-w-[420px] flex flex-col items-center text-center">
            <div className="flex items-center justify-center mb-5">
              <img
                src={TICK_CIRCLE_ICON}
                alt=""
                className="w-[100px] h-[100px]"
              />
            </div>

            <h2 className="heading-2 font-500 text-[var(--primary-text)]">Order Complete!</h2>
            <p className="heading-5 text-[var(--primary-text)] mt-2">
              Your order has been completed and paid.
              <br />
              Thank you for dining with us!
            </p>

            {hasDetails && (
              <div className="w-full mt-6 rounded-xl bg-[var(--cards-containers)] shadow-sm px-4 py-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-left">
                  {rows.map((r) => (
                    <React.Fragment key={r.label}>
                      <span className="heading-6 text-[var(--secondary-text)]">{r.label}</span>
                      <span className="heading-6 font-700 text-[var(--primary-text)] text-right">
                        {r.value}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

          
          </div>
        </div>

        <p className="heading-6 text-[var(--primary-text)] font-600 mt-6 text-center mb-4">Want to order more?</p>
        <div className="px-4 pb-5 pt-4 border-t border-[var(--borders-dividers)] bg-[var(--primary-background)]">
          <CustomButton
            className="font-700 !py-3.5 mt-0 !w-full heading-4 bg-[var(--primary-color)]"
            onClick={handleOpenScanQrModal}
          >
            Scan QR Code
          </CustomButton>
          {/* <button
            type="button"
            onClick={onClose}
            className="w-full mt-3 heading-6 font-600 text-[var(--secondary-text)]"
          >
            Close
          </button> */}
        </div>
      </div>
    </div>
  );
}

