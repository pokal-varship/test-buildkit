import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@redux/store";
import { selectQrFlow, selectSessionId, selectSessionTableId, selectTicketId, setDineInSessionData } from "@redux/slices/qrFlowSlice";
import { AddOnsListSelectorProps, UpsellProduct } from "./order.type";
import { addToCart } from "@services/pdp";
import { addItemsToTicket, AddItemsToTicketPayload } from "@services/ticketService";
import { getSession } from "@services/sessionService";
import { useStoreCart } from "@hooks/storepage/useStore";
import formatCurrency from "@lib/helper/price";
import { getTenantConfig } from "@config/tenant.config";
import { useToast } from "@components/toast/Toast";

const AddOnsList: React.FC<AddOnsListSelectorProps> = ({
    lang,
    PLUS_ICON,
    productType,
    upsellProducts
}) => {
    const dispatch = useDispatch();
    const store = useSelector((state: RootState) => state.store);
    const isQrFlow = useSelector(selectQrFlow);
    const sessionId = useSelector(selectSessionId);
    const ticketId = useSelector(selectTicketId);
    const tableId = useSelector(selectSessionTableId);
    const { handleGetCart } = useStoreCart();
    const toast = useToast();
    const { showStrikethroughPrice } = getTenantConfig();

    const handleUpsellProduct = async (product: UpsellProduct) => {
        const storeId = store?.currentStore?.id || "";

        if (isQrFlow) {
            if (!sessionId || !storeId) return;
            try {
                const payload: AddItemsToTicketPayload = {
                    sessionId,
                    ticketId: ticketId ?? undefined,
                    items: [
                        {
                            itemId: product.productId,
                            itemSku: (product as UpsellProduct & { sku?: string }).sku ?? product.productId,
                            quantity: 1,
                            sequenceNumber: 1,
                            customType: "ADD_QUANTITY" as const,
                        },
                    ],
                };
                await addItemsToTicket(storeId, payload);
                const sessionData = await getSession(storeId, { tableId: tableId ?? undefined, sessionId });
                dispatch(setDineInSessionData(sessionData));
            } catch (err: unknown) {
                const message =
                    (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                    ?? lang.failedToAddItem;
                toast("error", message);
            }
            return;
        }

        try {
            const payload = {
                productId: product.productId,
                quantity: 1,
            }
            const res = await addToCart(store?.currentStore?.id || "", payload);
            if (res.message === 'Success') {
                handleGetCart(store?.currentStore?.id || "");
            }
            return res;
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? lang.failedToAddItem;
            toast("error", message);
        }
    }

    if (!upsellProducts || upsellProducts.length === 0) {
        return null;
    }

    return (
        <div>
            <div className="divider-add-on border-t my-4" />
            {productType === "REGULAR" && <div className="complete-your-meal-text my-2">
                {lang.peopleAlsoAdded}
            </div>}
            <div className="flex overflow-x-auto space-x-3 text-sm pb-2 hide-scrollbar">
                {upsellProducts.map((product) => (
                    <div
                        key={product.id}
                        className="min-w-[200px] bg-[var(--tertiary-background)] border border-[var(--borders-dividers)] rounded-lg md:rounded-xl p-3 flex flex-col justify-between text-left"
                    >
                        <p className="add-on-name">{product.name.en}</p>
                        <div className="flex items-center justify-between mt-0">
                            <h4 className="product-price flex items-center">
                               {(product?.discountedPrice ?? 0) > 0 && <span className="add-on-price">
                                    {formatCurrency({ amount: product?.discountedPrice ?? 0 })}
                                </span>}
                                {product.basePrice > 0 && (
                                    <span className={`${(product?.discountedPrice ?? 0) > 0 && showStrikethroughPrice ? "add-line-through" : "add-on-price"}`}>
                                        {formatCurrency({ amount: product.basePrice })}
                                    </span>
                                )}
                            </h4>
                            <img
                                src={`${PLUS_ICON}`}
                                width={24}
                                height={24}
                                className="cursor-pointer"
                                onClick={() => handleUpsellProduct(product)}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
                .complete-your-meal-text {
                    color: var(--primary-text);
                    font-size: var(--small-font);
                    font-weight: var(--font-semi-bold);
                }
                .add-on-name {
                    color: var(--primary-text);
                    font-size: var(--small-font);
                    font-weight: var(--font-medium);
                }
                .add-on-price {
                    color: var(--primary-text);
                    font-size: var(--heading-h6);
                    font-weight: var(--font-regular);
                    padding-right: 5px;
                    font-weight: var(--font-regular);
                }
                .add-line-through {
                    text-decoration: line-through;
                    opacity: 0.5;
                    margin-right: 8px;
                    font-size: var(--heading-h6);
                }
                .divider-add-on {
                    width: 100%;
                    height: 1px;
                    background-color: var(--borders-dividers);
                }
            `}</style>
        </div>
    );
};

export default AddOnsList;
