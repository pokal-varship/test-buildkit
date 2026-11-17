import CustomButton from '@components/buttons/Button';
import SecondaryButton from '@components/buttons/secondaryButton';
import React from 'react';

interface CheckOutFooterProps {
    handleCheckout?: () => void;
    lang: {
        cancel: string;
        placeOrder: string;
    };
    isLoading?: boolean;
}

const CheckOutFooter: React.FC<CheckOutFooterProps> = ({ lang, handleCheckout }) => {
    return (
        <footer className="footer-container border-t px-4 py-3 shadow-md">

            <div className="flex items-center gap-3 justify-between">
                <SecondaryButton className="cancel-button">
                    <h4 className="cancel-title">{lang.cancel}</h4>
                </SecondaryButton>
                <CustomButton className="place-order-button" onClick={handleCheckout}>
                    <div className="flex items-center justify-between">
                        <h4 className="place-order-title">{lang.placeOrder}</h4>
                        <h4 className="place-order-price">
                            {"$"}
                            {(22.22).toFixed(2)}
                        </h4>
                    </div>
                </CustomButton>
            </div>
            <style>{`
                .cancel-title{
                    font-size: var(--heading-h4);
                    font-weight: var(--font-regular);
                    color: var(--black);
                }
                .place-order-button{
                    width: 300px;
                    background-color: var(--primary-color);
                    color: var(--black);
                    border: 1px solid var(--primary-color);
                    border-radius: 10px;
                    padding: 10px;
                }
                .place-order-title,
                .place-order-price {
                    font-size: var(--heading-h4);
                    font-weight: var(--font-bold);
                    color: var(--black);
                }
            `}</style>
        </footer>
    );
};

export default CheckOutFooter;