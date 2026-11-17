import Icon from "@components/image/Icons";
import { PLUS_ICON } from "@config/Header/image.config";
import { AddOn } from "./order.type";

interface AddonCardProps {
    id: string;
    name: string;
    price: number;
    currency: string;
    onAdd?: (extra: AddOn) => void;
}

export const AddonCard = ({ id, name, price, currency }: AddonCardProps) => {
    return (
        <div
            key={id}
            className="min-w-[200px] border rounded-xl p-3 flex flex-col justify-between text-left"
        >
            <p className="font-semibold">{name}</p>
            <div className="flex items-center justify-between mt-2">
                <p className="text-gray-600">
                    {currency}
                    {price?.toFixed?.(2)}
                </p>
                <Icon
                    icon={`${PLUS_ICON}#plus-icon`}
                    width={24}
                    height={24}
                    className="cursor-pointer"
                    viewBox="0 0 40 40"
                />
            </div>
        </div>
    );
};
