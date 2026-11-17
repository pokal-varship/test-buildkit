import CustomButton from '@components/buttons/Button';
import SecondaryButton from '@components/buttons/secondaryButton';
import CloseCircleIcon from '@components/icons/CloseCircleIcon';
import ProductQuantitySelector from '@components/order/ProductQuantitySelector';
import { CartItem } from '@services/storePage';
import formatCurrency from '@lib/helper/price';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getTenantConfig } from '@config/tenant.config';
import { useStoreCart } from '@hooks/storepage/useStore';
import Loader from '@components/loader/Loader';
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";

export interface MultipleCustomizationsStagedState {
    items: CartItem[];
    removedItems: CartItem[];
    initialItems: CartItem[];
}

interface MultipleCustomizationsProps {
    onClose?: () => void; // Handler for "I'll choose" button
    onConfirm?: (stagedState: MultipleCustomizationsStagedState) => void | Promise<void>; // Called when user clicks Confirm; modal shows loader until resolved
    handleClose?: () => void; // Handler for close icon (X) - just closes dialog
    onAddItem?: (item: CartItem) => void; // Handler for "Add" button to restore removed items
    title?: string;
    items: CartItem[];
    onQuantityChange?: (itemId: string, customType: string) => void; // Not called on +/- ; only used if we need to apply changes externally. Staged changes apply on Confirm.
    getModifierDescription: (item: CartItem) => string;
    productId?: string; // Product ID to filter items
    showChooseButton?: boolean; // Whether to show "I'll choose" button
    isRemoveDialog?: boolean; // Whether this is a remove dialog (true) or repeat dialog (false)
    /** When true, allow removing the last remaining customization in a remove dialog (PLP). PDP keeps this false. */
    allowRemoveLastItem?: boolean;
    /** When false, do not sync items from cartData (e.g. QR flow uses session data from parent) */
    syncFromCart?: boolean;
}

// Helper function to calculate item price
const calculateItemPrice = (item: CartItem, quantity?: number): number => {
    if (item.subTotalBeforeDiscountAndTaxes) {
        return item.subTotalBeforeDiscountAndTaxes;
    }
    const qty = quantity ?? item.quantity ?? 1;
    return (item.unitBasePrice + (item.finalModifiersPrice || 0)) * qty;
};

// Helper function to get item description
const getItemDescription = (item: CartItem, getModifierDescription?: (item: CartItem) => string): string => {
    return getModifierDescription ? getModifierDescription(item) : "Standard";
};

const MultipleCustomizations: React.FC<MultipleCustomizationsProps> = ({ 
    onClose,
    onConfirm,
    handleClose,
    onAddItem,
    title, 
    items: initialItems,
    getModifierDescription,
    productId,
    showChooseButton = true, // Default to true for backward compatibility
    isRemoveDialog = false, // Default to false (repeat dialog)
    allowRemoveLastItem = false,
    syncFromCart = true, // When false (QR flow), items come from parent only
}) => {
    const { showStrikethroughPrice } = getTenantConfig();
    // Use state to store items so they can be updated
    const [items, setItems] = useState<CartItem[]>(initialItems || []);
    // Track removed items (items that were in cart but are now deleted)
    const [removedItems, setRemovedItems] = useState<CartItem[]>([]);
    // Track loading state for items being removed/added - using item signature instead of IDs
    const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
    const [isConfirming, setIsConfirming] = useState(false);
    // Use ref to track previous items for comparison
    const previousItemsRef = useRef<CartItem[]>(initialItems || []);
    const { cartData } = useStoreCart();
    // Track pending quantity changes per item to prevent flicker
    const pendingQuantityChangesRef = useRef<Map<string, number>>(new Map());
    // Track if there are pending changes to prevent overwriting with stale server data
    const hasPendingChangesRef = useRef<boolean>(false);
    // Snapshot of initial item quantities when modal opened - used to detect meaningful changes
    const initialItemQuantitiesRef = useRef<Map<string, number>>(new Map());
    const hasInitialSnapshotRef = useRef(false);
    // When true, +/- changes are local only; apply only on Confirm. Prevents overwriting from cartData.
    const hasUnconfirmedChangesRef = useRef(false);
    // Item IDs that were decreased to 0 locally (no API yet). Add button should restore to items, not call onAddItem.
    const locallyRemovedIdsRef = useRef<Set<string>>(new Set());
    const [lang]: [TranslationKeys, LanguageCode] = useLang();

    // Capture initial state once when modal opens (or when initialItems first available)
    useEffect(() => {
        if (initialItems?.length && !hasInitialSnapshotRef.current) {
            const map = new Map<string, number>();
            initialItems.forEach(item => {
                if (item.id) map.set(item.id, item.quantity ?? 1);
            });
            initialItemQuantitiesRef.current = map;
            hasInitialSnapshotRef.current = true;
            hasUnconfirmedChangesRef.current = false;
            locallyRemovedIdsRef.current = new Set();
        }
    }, [initialItems]);

    // Helper function to create unique signature for an item (variant + modifiers)
    const getItemSignature = useCallback((item: CartItem): string => {
        const variantId = item.variantId || 'no-variant';
        const modifierIds = item.modifierGroup
            ?.flatMap(group => group.modifiers.map(mod => mod.modifierId))
            .sort()
            .join(',') || 'no-modifiers';
        return `${item.productId}:${variantId}:${modifierIds}`;
    }, []);

    // Quantity change is local only until user clicks Confirm (no API call on +/-)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature matches ProductQuantitySelector (customType, itemId)
    const handleAddQuantity = useCallback((item: CartItem, _customType?: string) => {
        if (!item.id) return;
        
        const currentQuantity = item.quantity || 0;
        const newQuantity = currentQuantity + 1;
        
        pendingQuantityChangesRef.current.set(item.id, newQuantity);
        hasPendingChangesRef.current = true;
        hasUnconfirmedChangesRef.current = true;
        
        setItems(prevItems => 
            prevItems.map(prevItem => 
                prevItem.id === item.id 
                    ? { ...prevItem, quantity: newQuantity }
                    : prevItem
            )
        );
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature matches ProductQuantitySelector (customType, itemId)
    const handleDecreaseQuantity = useCallback((item: CartItem, _customType?: string) => {
        if (!item.id) return;
        
        const currentQuantity = item.quantity || 0;
        const newQuantity = Math.max(0, currentQuantity - 1);
        
        if (newQuantity > 0) {
            pendingQuantityChangesRef.current.set(item.id, newQuantity);
        } else {
            pendingQuantityChangesRef.current.delete(item.id);
            // Local removal only (no API): show in removed section with Add button, do NOT show loader
            locallyRemovedIdsRef.current.add(item.id);
            setRemovedItems(prev => (prev.some(r => r.id === item.id) ? prev : [...prev, { ...item, quantity: 1 }]));
        }
        hasPendingChangesRef.current = true;
        hasUnconfirmedChangesRef.current = true;
        
        if (newQuantity > 0) {
            setItems(prevItems => 
                prevItems.map(prevItem => 
                    prevItem.id === item.id 
                        ? { ...prevItem, quantity: newQuantity }
                        : prevItem
                )
            );
        } else {
            setItems(prevItems => prevItems.filter(prevItem => prevItem.id !== item.id));
        }
    }, []);

    // Handler for adding removed items back (restore locally removed, or call API for server-removed)
    const handleAddRemovedItem = useCallback((item: CartItem) => {
        if (!item?.id) return;
        if (locallyRemovedIdsRef.current.has(item.id)) {
            locallyRemovedIdsRef.current.delete(item.id);
            setRemovedItems(prev => prev.filter(removedItem => removedItem.id !== item.id));
            setItems(prev => [...prev, { ...item, quantity: 1 }]);
            return;
        }
        if (onAddItem) {
            const itemSignature = getItemSignature(item);
            setLoadingItems(prev => new Set(prev).add(itemSignature));
            setRemovedItems(prev => prev.filter(removedItem => removedItem.id !== item.id));
            onAddItem(item);
        }
    }, [onAddItem, getItemSignature]);

    // Optimized close handler
    const handleCloseClick = useCallback(() => {
        if (handleClose) {
            handleClose();
        } else if (onClose) {
            onClose();
        }
    }, [handleClose, onClose]);

    // Update items when cart data changes (e.g. after "Add" for removed item, or initial load)
    // When user has unconfirmed +/- changes, keep local staged state and only merge in new items (from Add button)
    // When syncFromCart is false (QR flow), do not overwrite items from cartData
    useEffect(() => {
        if (!syncFromCart) return;
        if (cartData?.data?.items && productId) {
            const freshItems = cartData.data.items.filter(item => item.productId === productId && (item.quantity || 0) > 0);
            const freshItemIds = freshItems.map(item => item.id).filter(Boolean);
            
            const previousItemIds = previousItemsRef.current.map(item => item.id).filter(Boolean);
            const removedItemIds = previousItemIds.filter(id => !freshItemIds.includes(id));
            
            if (removedItemIds.length > 0) {
                const newlyRemoved = previousItemsRef.current.filter(item => item.id && removedItemIds.includes(item.id));
                setRemovedItems(prev => {
                    const existingIds = prev.map(item => item.id).filter(Boolean);
                    const toAdd = newlyRemoved.filter(item => item.id && !existingIds.includes(item.id));
                    return [...prev, ...toAdd];
                });
                setLoadingItems(prev => {
                    const newSet = new Set(prev);
                    newlyRemoved.forEach(item => {
                        if (item.id) newSet.delete(item.id);
                    });
                    return newSet;
                });
            }
            
            setRemovedItems(prev => {
                if (prev.length === 0) return prev;
                return prev.filter(removedItem => {
                    if (!removedItem.id) return false;
                    if (locallyRemovedIdsRef.current.has(removedItem.id)) return true;
                    return !freshItemIds.includes(removedItem.id);
                });
            });
            
            if (hasUnconfirmedChangesRef.current) {
                // Keep staged quantities; only add new items from server (e.g. from "Add" button)
                setItems(prev => {
                    const byId = new Map(prev.map(i => [i.id, i]));
                    freshItems.forEach(f => {
                        if (f.id && !byId.has(f.id)) byId.set(f.id, f);
                    });
                    const merged = Array.from(byId.values());
                    previousItemsRef.current = merged;
                    return merged;
                });
            } else if (freshItems && freshItems.length > 0) {
                const itemsWithPendingChanges = freshItems.map(item => {
                    if (item.id && pendingQuantityChangesRef.current.has(item.id)) {
                        const pendingChange = pendingQuantityChangesRef.current.get(item.id);
                        if (pendingChange !== undefined) {
                            if (pendingChange === item.quantity) {
                                pendingQuantityChangesRef.current.delete(item.id);
                                if (pendingQuantityChangesRef.current.size === 0) {
                                    hasPendingChangesRef.current = false;
                                }
                            }
                            return { ...item, quantity: pendingChange };
                        }
                    }
                    return item;
                });
                setItems(itemsWithPendingChanges);
                previousItemsRef.current = itemsWithPendingChanges;
            } else {
                setItems([]);
                previousItemsRef.current = [];
                pendingQuantityChangesRef.current.clear();
                hasPendingChangesRef.current = false;
            }
            
            setLoadingItems(prev => {
                if (prev.size === 0) return prev;
                const newSet = new Set(prev);
                const freshSignatures = freshItems.map(item => getItemSignature(item));
                Array.from(newSet).forEach(loadingSignature => {
                    if (freshSignatures.includes(loadingSignature) || freshItemIds.includes(loadingSignature)) {
                        newSet.delete(loadingSignature);
                    }
                });
                return newSet;
            });
        } else if (initialItems && initialItems.length > 0) {
            const activeItems = initialItems.filter(item => (item.quantity || 0) > 0);
            setItems(activeItems);
            previousItemsRef.current = activeItems;
        }
    }, [syncFromCart, cartData?.data?.items, productId, initialItems, getItemSignature]);

    // Memoized dialog title
    const dialogTitle = useMemo(() => title || "Repeat previous customisation?", [title]);

    // Memoized check for empty state
    const isEmpty = useMemo(() => 
        (!items || items.length === 0) && (!removedItems || removedItems.length === 0),
        [items, removedItems]
    );

    // Show Confirm only when current state differs from initial (e.g. Oat Milk 1→2→1 = no change → hide)
    const hasMeaningfulChanges = useMemo(() => {
        const initial = initialItemQuantitiesRef.current;
        if (!initial || initial.size === 0) return false;
        const removedIds = new Set((removedItems || []).map(r => r.id).filter(Boolean));
        for (const [id, initialQty] of initial) {
            const inRemoved = removedIds.has(id);
            const currentQty = inRemoved ? 0 : (items?.find(i => i.id === id)?.quantity ?? 0);
            if (currentQty !== initialQty) return true;
        }
        return false;
    }, [items, removedItems]);

    return (
        <div className="w-full min-w-[300px] px-0 max-w-full bg-[var(--cards-containers)] md:w-[600px] md:px-[10px]">
            <div className="rounded-lg text-center md:p-0 p-0">
                <div className="flex justify-between gap-5 items-center mb-5 text-left border-b border-[var(--rating-border-primary)] pb-4 md:pb-0 md:border-none" >
                    <h2 
                        className="text-[var(--primary-text)] font-bold dialog-title-responsive md-heading-2 heading-3  md:w-auto"
                    >
                        {dialogTitle}
                    </h2>
                    <style>{`
                        @media (min-width: 768px) {
                            .dialog-title-responsive {
                                font-size: var(--heading-h2);
                            }
                        }
                    `}</style>
                    <CloseCircleIcon
                        width={30}
                        height={30}
                        className="cursor-pointer flex-shrink-0"
                        onClick={handleCloseClick}
                    />
                </div>
                <div className="flex flex-col mb-5 max-h-[300px] md:max-h-[400px] overflow-y-auto bg-[var(--primary-background)]  md:px-4 rounded-lg border border-[var(--borders-dividers)]">
                    {/* Active items (with quantity > 0) */}
                    {items && Array.isArray(items) && items.length > 0 ? (
                        items.map((item, index) => {
                            const description = getItemDescription(item, getModifierDescription);
                            const priceQty = (item.id ? initialItemQuantitiesRef.current.get(item.id) : undefined) ?? item.quantity ?? 1;
                            const unitOriginalPrice = item.totalBasePrice / priceQty;
                            const unitDiscountedPrice = (item.totalBasePriceAfterBaseDiscount ?? calculateItemPrice(item, 1)) / priceQty;
                            
                            // PDP: block removing the last remaining customization in remove dialog
                            const isLastItemInRemoveDialog =
                                isRemoveDialog &&
                                items.length === 1 &&
                                !allowRemoveLastItem;
                            
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const handleAdd = (customType: string, itemId?: string) => handleAddQuantity(item, customType);
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const handleDecrease = (customType: string, itemId?: string) => handleDecreaseQuantity(item, customType);
                            
                            return (
                                <div 
                                    key={item.id || `item-${index}`} 
                                    className="flex flex-col md:flex-row justify-between md:items-center items-start gap-3 p-3 border-b border-[var(--rating-border-primary)] last:border-b-0 bg-[var(--primary-background)]   mb-3 md:mb-0 md:rounded-none last:mb-0" 
                                >
                                    <div className="flex flex-col md:flex-col gap-1 flex-1 text-left w-full md:w-auto">
                                        <h4 
                                            className="text-[var(--primary-text)] font-[var(--font-regular)] m-0 md-heading-4 heading-5"
                                        >
                                            {description}
                                        </h4>
                                        <div className="flex items-center justify-between md:block w-full md:w-auto">
                                            <div className="flex items-center gap-2">
                                                {item.totalBaseDiscountAmount > 0 && showStrikethroughPrice && (
                                                    <span 
                                                        className="line-through text-[var(--secondary-text)] md-heading-5 heading-6"
                                                    >
                                                        {formatCurrency({ amount: unitOriginalPrice })}
                                                    </span>
                                                )}
                                                <span 
                                                    className="text-[var(--primary-text)] md-heading-5 heading-6"
                                                >
                                                    {formatCurrency({ amount: unitDiscountedPrice })}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-end md:hidden">
                                                <ProductQuantitySelector
                                                    quantity={item.quantity || 0}
                                                    handleAddQuantity={handleAdd}
                                                    handleDecreaseQuantity={handleDecrease}
                                                    itemId={item.id}
                                                    item={item}
                                                    isPDP={true}
                                                    buttonSizeClassName="w-6 h-6 heading-5 "
                                                    increaseButtonClassName="bg-[var(--button-primary-background)]"
                                                    textSizeClassName="heading-6 font-bold"
                                                    mainContainerClassName="justify-between w-full"
                                                    allowRemoveWhenOne={isRemoveDialog && !isLastItemInRemoveDialog}
                                                    min={isLastItemInRemoveDialog ? 1 : (isRemoveDialog ? 0 : 1)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex items-center justify-center w-28">
                                        <ProductQuantitySelector
                                            quantity={item.quantity || 0}
                                            handleAddQuantity={handleAdd}
                                            handleDecreaseQuantity={handleDecrease}
                                            itemId={item.id}
                                            item={item}
                                            isPDP={true}
                                            buttonSizeClassName="w-8 h-8"
                                            increaseButtonClassName="bg-[var(--button-primary-background)] text-[var(--button-primary-text)]"
                                            textSizeClassName="heading-4 font-bold"
                                            mainContainerClassName="justify-between w-full"
                                            allowRemoveWhenOne={isRemoveDialog && !isLastItemInRemoveDialog}
                                            min={isLastItemInRemoveDialog ? 1 : (isRemoveDialog ? 0 : 1)}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    ) : null}
                    
                    {/* Loading items (show loader while item is being removed/added) */}
                    {loadingItems && loadingItems.size > 0 && Array.from(loadingItems).filter(signature => {
                        // Only show loader if item is NOT in active items and NOT in removed items
                        const isInActiveItems = items.some(item => item.id === signature || getItemSignature(item) === signature);
                        const isInRemovedItems = removedItems.some(item => item.id === signature || getItemSignature(item) === signature);
                        return !isInActiveItems && !isInRemovedItems;
                    }).map((signature) => (
                        <div 
                            key={`loading-${signature}`}
                            className="flex flex-col md:flex-row justify-between md:items-center items-start gap-3 p-3 md:border-b md:border-[var(--rating-border-primary)] bg-[var(--primary-background)] md:last:border-b-0 rounded-lg mb-3 md:mb-0 md:rounded-none last:mb-0"
                        >
                            <div className="flex flex-1 items-center justify-center w-full py-2">
                                <Loader size={30} type="spinner" />
                            </div>
                        </div>
                    ))}
                    
                    {/* Removed items (with Add button) */}
                    {removedItems && Array.isArray(removedItems) && removedItems.length > 0 && (
                        removedItems.map((item, index) => {
                            const description = getItemDescription(item, getModifierDescription);
                            const priceQty = (item.id ? initialItemQuantitiesRef.current.get(item.id) : undefined) ?? item.quantity ?? 1;
                            const unitOriginalPrice = item.totalBasePrice / priceQty;
                            const unitDiscountedPrice = (item.totalBasePriceAfterBaseDiscount ?? calculateItemPrice(item, 1)) / priceQty;
                            
                            return (
                                <div 
                                    key={`removed-${item.id || index}`} 
                                    className="flex flex-col md:flex-row justify-between md:items-center items-start gap-3 p-3 md:border-b md:border-[var(--rating-border-primary))] bg-[var(--primary-background)] md:last:border-b-0 rounded-lg mb-3 md:mb-0 md:rounded-none last:mb-0"
                                >
                                    <div className="flex flex-col gap-1 flex-1 text-left w-full md:w-auto">
                                        <h4 
                                            className="text-[var(--primary-text)] font-[var(--font-regular)] m-0 md-heading-4 heading-5"
                                        >
                                            {description}
                                        </h4>
                                        <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-2 md:gap-1 w-full md:w-auto">
                                            <div className="flex items-center gap-2">
                                                {item.totalBaseDiscountAmount > 0 && showStrikethroughPrice && (
                                                    <span 
                                                        className="line-through text-[var(--secondary-text)] md-heading-5 heading-6"
                                                    >
                                                        {formatCurrency({ amount: unitOriginalPrice })}
                                                    </span>
                                                )}
                                                <span 
                                                    className="text-[var(--primary-text)] md-heading-5 heading-6"
                                                >
                                                    {formatCurrency({ amount: unitDiscountedPrice })}
                                                </span>
                                            </div>
                                            <div className="flex items-center md:hidden">
                                                <CustomButton 
                                                    className="!py-0 font-[var(--font-bold)] text-[var(--black)] !bg-[var(--tertiary-background)] rounded-lg !border !border-[var(--button-secondary-border-color)] cursor-pointer h-7 !w-16"
                                                    onClick={() => handleAddRemovedItem(item)}
                                                >
                                                    <span className='var(--description-font)'>{lang.add}</span>
                                                </CustomButton>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex items-center justify-start">
                                        <CustomButton 
                                            className="px-4 py-2 font-[var(--font-bold)] !text-[var(--primary-text)] !bg-[var(--tertiary-background)] rounded-lg !border !border-[var(--button-secondary-border-color)] cursor-pointer !h-[51px] !w-28"
                                            onClick={() => handleAddRemovedItem(item)}
                                        >
                                            <span className='var(--description-font)'>{lang.add}</span>
                                        </CustomButton>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    
                    {/* Show empty message only if no active items and no removed items */}
                    {isEmpty && (
                        <div className="p-5 text-center text-[var(--secondary-text)]">
                            No customizations found
                        </div>
                    )}
                </div>
                <div className="flex w-full justify-center mt-5 gap-3 flex-row-reverse md:flex-col">
                    {onConfirm && hasMeaningfulChanges && (
                        <CustomButton 
                            className="!w-full h-14 font-[var(--font-bold)] text-[var(--black)] hover:text-[var(--black)] hover:bg-[var(--button-primary-background)]"
                            disabled={isConfirming}
                            onClick={async () => {
                                setIsConfirming(true);
                                try {
                                    await onConfirm({ items, removedItems, initialItems: initialItems || [] });
                                } finally {
                                    setIsConfirming(false);
                                }
                            }}
                        >
                            {isConfirming ? (
                                <Loader color="black" size={24} />
                            ) : (
                                <span className="md-heading-4 heading-5 font-bold">{lang.confirm}</span>
                            )}
                        </CustomButton>
                    )}
                    {showChooseButton && (
                        <SecondaryButton
                            className="!w-full h-14 !bg-[var(--primary-active-background)] !text-[var(--primary-color)]"
                            onClick={onClose}
                        >
                            <span className="md-heading-4 heading-5 font-bold">{lang.repeatNo}</span>
                        </SecondaryButton>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MultipleCustomizations;

