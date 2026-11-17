import useLang from '@hooks/useLang';
import { useQuantityControls } from '@hooks/useQuantityControls';
import { close_dialog, open_dialog } from '@lib/modalHandler';
import React from 'react';
import { LanguageCode, TranslationKeys } from 'types';
import { CartData } from './order.type';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@redux/store';
import {
    setDineInSessionData,
    selectTicketId,
    selectTicketOrderInstruction,
    selectIsQrFlowActive,
    selectSessionId,
    selectSessionTableId,
    selectQrResolveData,
} from '@redux/slices/qrFlowSlice';
import { getSession } from '@services/sessionService';
import { updateOrderInstruction } from '@services/ticketService';
import { useToast } from '@components/toast/Toast';
import useAnalytics from '@hooks/useAnalytics';
import { getTenantConfig } from '@config/tenant.config';

const CookingInstructionsBox = ({ cartId, cartData }: { cartId: string, cartData: CartData }) => {
    const { handleQuantity } = useQuantityControls(cartId as string);
    const isQrFlowActive = useSelector(selectIsQrFlowActive);
    const ticketOrderInstruction = useSelector(selectTicketOrderInstruction);
    /** Single source of truth: QR flow from Redux (session/ticket), normal flow from cart. No local state. */
    const instructions = isQrFlowActive
        ? (ticketOrderInstruction ?? '')
        : (cartData?.data?.orderInstruction ?? '');

    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const { cookingInstructions: cookingInstructionsFromEnv } = getTenantConfig();
    const cookingInstructionsLabel =
        cookingInstructionsFromEnv || lang.cookingInstructions;
    const dispatch = useDispatch();
    const toast = useToast();
    const sessionId = useSelector(selectSessionId);
    const tableId = useSelector(selectSessionTableId);
    const ticketId = useSelector(selectTicketId);
    const qrResolveData = useSelector(selectQrResolveData);
    const storefrontId = qrResolveData?.storefrontId ?? null;
    const storeIdFromStore = useSelector((state: RootState) => state.store?.currentStore?.id);
    const storeId = storeIdFromStore ?? storefrontId ?? undefined;
    const { trackDineInOrderInstructionUpdated } = useAnalytics();

    const trackInstructionUpdate = (orderInstruction: string) => {
        void trackDineInOrderInstructionUpdated({
            session_id: String(sessionId || ''),
            ticket_id: String(ticketId || ''),
            has_instructions: Boolean(orderInstruction.trim()),
            instruction_length: orderInstruction.trim().length,
        });
    };

    const handleInstructionSubmit = async (orderInstruction: string) => {
        if (isQrFlowActive && sessionId && ticketId && storeId) {
            try {
                await updateOrderInstruction(storeId, {
                    sessionId,
                    ticketId,
                    customType: 'UPDATE_ORDER_INSTRUCTION',
                    orderInstruction,
                });
                const sessionData = await getSession(storeId, { tableId: tableId ?? undefined, sessionId });
                dispatch(setDineInSessionData(sessionData));
                trackInstructionUpdate(orderInstruction);
                close_dialog(["instructions"]);
            } catch (err: unknown) {
                const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Something went wrong';
                toast('error', message);
            }
        } else if (!isQrFlowActive) {
            handleQuantity("UPDATE_ORDER_INSTRUCTION", "", undefined, orderInstruction);
            close_dialog(["instructions"]);
        }
    }

    const handleRemoveInstructions = async () => {
        if (isQrFlowActive && sessionId && ticketId && storeId) {
            try {
                await updateOrderInstruction(storeId, {
                    sessionId,
                    ticketId,
                    customType: 'UPDATE_ORDER_INSTRUCTION',
                    orderInstruction: '',
                });
                const sessionData = await getSession(storeId, { tableId: tableId ?? undefined, sessionId });
                dispatch(setDineInSessionData(sessionData));
                trackInstructionUpdate('');
            } catch (err: unknown) {
                const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Something went wrong';
                toast('error', message);
            }
        } else if (!isQrFlowActive) {
            handleQuantity("UPDATE_ORDER_INSTRUCTION", "", undefined, "");
        }
    }

    const handleInstructionModal = () => {
        open_dialog("instructions", {
            open: true,
            propsData: {
                handleInstructionSubmit: handleInstructionSubmit,
                item: instructions,
            },
            type: "instructions",
            handlerDialog: () => { },
            handleClose: () => {
                close_dialog(["instructions"]);
            },
            anchor: 'bottom',
            dialogPosition: 'bottom',
            onlyDialog: false,
            className: 'cooking-modal',
            sxStyle: {
                '& .MuiDialogContent-root': {
                    padding: '20px 16px',
                    backgroundColor: 'var(--tertiary-background)',
                },
                '& .MuiPaper-root': {
                    width: '100%',
                },
            },
        });
    }

    return (
        <div className="cooking-instructions-box">
            <div className="flex justify-between items-center">
                <label className="cooking-instructions-label">
                    {cookingInstructionsLabel}
                </label>
                {instructions && <div className="remove-instructions-btn" onClick={handleRemoveInstructions}>{lang.remove}</div>}
            </div>

            <input
                type="text"
                placeholder={lang.enterCookingInstructions}
                value={instructions}
                onClick={handleInstructionModal}
                className="cooking-instructions-input"
                maxLength={80}
                readOnly
            />
            <style>{`
        @media (max-width: 768px) {
        .cooking-modal {
          padding: 20px 16px;
          background-color: var(--tertiary-background)!important;
        }
        }
        .cooking-instructions-box {
          background-color: var(--cards-containers);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 18px;
          margin-top: 0px;
          border: 1px solid var(--borders-dividers);
        }
        .cooking-instructions-label {
          font-size: var(--heading-h4);
          font-weight: var(--font-bold);
          color: var(--primary-text);
        }
        .cooking-instructions-input {
          margin-top: 10px;
          width: 100%;
          padding: 10px;
          border: 1px solid var(--borders-dividers);
          border-radius: 8px;
          font-size: var(--description-font);
          font-weight: var(--font-regular);
          color: var(--primary-text);
          background-color: var(--tertiary-background);
        }
        .cooking-instructions-input:focus {
          outline: none;
        }
        .remove-instructions-btn {
            font-size: var(--heading-h5);
            font-weight: var(--font-regular);
            color: var(--accent-color);
            cursor: pointer;
        }
        @media (max-width: 768px) {
          .cooking-instructions-box {
            margin-bottom: 0px;
            margin-top: 0px;
            border-radius: 0px;
          }
          .remove-instructions-btn {
            font-size: var(--description-font);
          }
          .cooking-instructions-label {
            font-size: var(--heading-h5);
          }
        }
      `}</style>
        </div>
    );
};

export default CookingInstructionsBox;
