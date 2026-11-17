'use client';
import { SHOPPING_CART_IMAGE } from '@config/Header/image.config';
import React from 'react';
import CustomButton from './Button';
import useLang from '@hooks/useLang';
import { LanguageCode, TranslationKeys } from 'types';
import { useStoreCart } from '@hooks/storepage/useStore';
import { useRouter } from 'next/navigation';
import formatCurrency from '@lib/helper/price';
import useProductUrl from '@hooks/useProductUrl';
import Icon from '@components/image/Icons';

const CartButton: React.FC<React.PropsWithChildren<unknown>> = () => {
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const { cartData, loading } = useStoreCart();
    const router = useRouter();
    const { getCartUrl } = useProductUrl();

    const itemCount =
        cartData?.data?.items?.reduce(
            (sum: number, item: { quantity?: number }) =>
                sum + (Number(item?.quantity) || 0),
            0,
        ) || 0;
    
    return (
        <CustomButton
            className="checkout-button ml-2 xl:ml-4 text-nowrap"
            onClick={() => {
                router.push(getCartUrl())
            }}
            styles={{
                borderRadius: '5px',
                padding: '5px 14px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                width: 'auto',
                maxWidth: '100%',
                minWidth: 'fit-content',
            }}
        >
            <div className="cart-content">
                <div className="cart-top-line">
                    <Icon icon={SHOPPING_CART_IMAGE} color="var(--primary-icon-color)" width={20} height={20} className="cart-icon" viewBox="0 0 20 20" aria-label="Cart Icon" />
                    <div className="price-container">
                        {loading ? (
                            <span className="price">{lang.loading}</span>
                        ) : (
                            <span className="price">
                                {formatCurrency({ amount: cartData?.data?.total?.itemSubTotal || 0 })} / {itemCount} {lang.items}
                            </span>
                        )}
                        <span className="tax-text">{lang.taxAtCheckout}</span>
                    </div>
                </div>
            </div>
            <style>{`
        .checkout-button {
            margin-left: 15px;
            border: none;
        }

        .cart-content {
            display: flex;
            flex-direction: row;
            align-items: center;
            width: 100%;
        }

        .cart-top-line {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 8px;
            width: 100%;
        }

        .cart-icon {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
            margin-top: 2px;
        }

        .price-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }

        .price {
            font-size: var(--description-font);
            font-weight: var(--font-bold);
            font-family: var(--font-family);
            line-height: 1.1;
            white-space: nowrap;
        }

        .tax-text {
            font-size: var(--extraSmall-font);
            font-weight: var(--font-regular);
            font-family: var(--font-family);
            line-height: 1.1;
            white-space: nowrap;
        }

        /* Tablet styles */
        @media (max-width: 1024px) and (min-width: 769px) {
            .checkout-button {
                padding: 10px;
            }

            .cart-icon {
                width: 18px;
                height: 18px;
            }

            .price {
                font-size: var(--small-font);
            }

            .tax-text {
                font-size: var(--extraSmall-font);
            }
        }

        /* Mobile styles */
        @media (max-width: 768px) {
            .checkout-button {
                width: 100%;
                padding: 10px 12px;
                margin-left: 0;
            }

            .cart-top-line {
                gap: 6px;
            }

            .cart-icon {
                width: 18px;
                height: 18px;
                margin-top: 0;
            }

            .price-container {
                gap: 1px;
            }

            .price {
                font-size: var(--small-font);
                font-weight: var(--font-bold);
            }

            .tax-text {
                font-size: var(--extraSmall-font);
            }
        }

        /* Small mobile styles */
        @media (max-width: 480px) {
            .checkout-button {
                padding: 8px 10px;
            }

            .cart-icon {
                width: 16px;
                height: 16px;
            }

            .price {
                font-size: var(--small-font);
            }

            .tax-text {
                font-size: var(--extraSmall-font);
            }

            .cart-top-line {
                gap: 5px;
            }
        }

        /* Extra small mobile styles */
        @media (max-width: 360px) {
            .checkout-button {
                padding: 8px;
            }

            .price {
                font-size: var(--extraSmall-font);
            }

            .tax-text {
                font-size: var(--extraSmall-font);
            }
        }
    `}</style>
        </CustomButton>

    );
};

export default CartButton;
