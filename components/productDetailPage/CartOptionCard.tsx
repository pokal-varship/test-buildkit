import PriceTag from "@components/ui/PriceTag";
import { cn } from "@lib/utils";
import { DiscountOffer } from "@services/typesense";
import Image from "next/image";
import React from "react";
import TickCircle from "stories/assets/TickCircle";


type CartOptionCardProps = {
    image?: string;
    heading?: string;
    details?: string;
    price?: string | number;
    discountedPrice?: string | number;
    isSelected?: boolean;
    containerClassName?: string;
    onClick?: () => void;
    showIcon?: boolean;
    icon?: React.ReactNode;
    bestOffer?: DiscountOffer;
    /** When true (combo variant pick), show "Combo Default" for details/price. Modifiers in combo should omit this so real prices show. */
    showComboDefaultPrice?: boolean;
};

const CartOptionCard: React.FC<CartOptionCardProps> = ({
    bestOffer,
    image = '',
    heading,
    details,
    isSelected = false,
    onClick,
    showIcon,
    containerClassName,
    icon = <TickCircle className="absolute right-2 top-3" />,
    price,
    discountedPrice,
    showComboDefaultPrice,


}) => {
    return (
        <>
        
        
        <div
            onClick={onClick}
            className={cn(`min-w-[220px] bg-[var(--tertiary-background)] md:min-w-[225px] md:pr-4 lg:min-w-[250px] relative cursor-pointer rounded-xl border p-2 lg:p-3 pr-9 lg:pr-8 flex items-center gap-2 lg:gap-3 transition-all duration-200 ${isSelected ? "border-[var(--button-secondary-border-color)]" : "border-[var(--borders-dividers)]"
                }`, containerClassName)}
        >
            {image && (
                <Image
                    src={image}
                    alt={heading || ""}
                    width={64}
                    height={64}
                    className=" w-14 h-14 lg:w-16 lg:h-16 max-w-16 max-h-16 object-contain rounded"
                />
            )}

            <div className="flex flex-col gap-2 lg:gap-3 text-[var(--primary-text)]">
                {heading && <h4 className="font-600 description-font">{heading}</h4>}
                {details && <p className="">{showComboDefaultPrice ? "Combo Default" : details}</p>}
                {(price || discountedPrice) && <PriceTag price={price} discountedPrice={discountedPrice} bestOffer={bestOffer} showComboDefaultPrice={showComboDefaultPrice} />}
            </div>

            {showIcon && (
                icon
            )}
        </div>
       <style>
        {`
        .small-font{
            font-size: var(--small-font);
        }
         .description-font{
                font-size: var(--description-font);
            }
        .extra-small-font {
            font-size: var(--extraSmall-font);
        }
            .font-600{
                font-weight: var(--font-semi-bold);
            }
    `}
    </style>
        </>
    );
};

export default CartOptionCard;
