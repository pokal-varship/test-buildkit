import React from 'react';
import Icon from '@components/image/Icons';
import {
    HOME_ADDRESS_ICON,
    HOTEL_ADDRESS_ICON,
    OFFICE_ADDRESS_ICON
} from '@config/Header/image.config';
import { LanguageCode, TranslationKeys } from 'types';
import useLang from '@hooks/useLang';
import Loader from '@components/loader/Loader';

// AddressCard Component
interface AddressCardProps {
    id: string;
    label: string;
    address: string;
    selected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    type: string;
    isLoading: boolean;
    city: string;
    state: string;
    country: string;
    zipCode: string;
}

const AddressCard: React.FC<AddressCardProps> = ({
    id,
    address,
    selected,
    onSelect,
    onEdit,
    onDelete,
    type,
    isLoading,
    city,
    state,
    country,
    zipCode
}) => {
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const getIcon = () => {
        switch (type) {
            case 'Office':
                return `${OFFICE_ADDRESS_ICON}#office`;
            case 'Hotel':
                return `${HOTEL_ADDRESS_ICON}#hotel`;
            default:
                return `${HOME_ADDRESS_ICON}#home`;
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
                <Loader />
            </div>
        );
    }

    return (
        <div
            className="border-b border-gray-200 py-3"
            onClick={onSelect}
            data-testid={`address-card-${id}`}
        >
            <div className="px-1 flex items-start justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center mb-1">
                        <div className="mr-2">
                            <Icon
                                icon={getIcon()}
                                width={20}
                                height={20}
                                color="var(--primary-text)"
                                viewBox="0 0 24 24"
                            />
                        </div>
                        <span className="address-type-drawer">{type}</span>
                    </div>
                    <div className="address-text-drawer">
                        {address}
                        {city || state || country || zipCode ? ', ' : ''}
                        {[city, state, country, zipCode].filter(Boolean).join(', ')}
                    </div>
                    <div className="ml-7 mt-1 flex text-sm">
                        <button
                            type="button"
                            className="address-edit-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                        >
                            {lang.edit}
                        </button>
                        <button
                            type="button"
                            className="address-delete-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            {lang.delete}
                        </button>
                    </div>
                </div>

                <div className="radio-group">
                    <label key={type} className="radio-label">
                        <input
                            type="radio"
                            checked={selected}
                            onChange={() => onSelect()}
                        />
                        <span className="custom-radio" />
                    </label>
                </div>
            </div>
            <style>{`
                .radio-group {
                    display: flex;
                    margin-top: 0px;
                    justify-content: space-between;
                }
                .radio-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 1rem;
                    font-weight: var(--font-medium);
                    color: var(--primary-text);
                }
                .custom-radio {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 2px solid var(--primary-color);
                    background: #fff;
                    position: relative;
                    transition: background 0.2s ease;
                }

                .radio-label input[type="radio"] {
                    display: none;
                }
                .radio-label input[type="radio"]:checked + .custom-radio::after {
                    content: '';
                    width: 12px;
                    height: 12px;
                    background: var(--primary-color);
                    border-radius: 50%;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
                .address-type-drawer {
                    font-weight: var(--font-bold);
                    color: var(--primary-text);
                    font-size: var(--heading-h5);
                }
                .address-text-drawer {
                    font-size: var(--small-font);
                    color: var(--primary-text);
                    margin-left: 28px;
                }
                .address-edit-button {
                    color: var(--accent-color);
                    font-size: var(--small-font);
                    margin-right: 12px;
                    cursor: pointer;
                    pointer-events: auto;
                    position: relative;
                    z-index: 10;
                    background: none;
                    border: none;
                    padding: 0;
                    text-align: left;
                }
                .address-edit-button:hover {
                    text-decoration: underline;
                }
                .address-delete-button {
                    color: var(--accent-color);
                    font-size: var(--small-font);
                    cursor: pointer;
                    pointer-events: auto;
                    position: relative;
                    z-index: 10;
                    background: none;
                    border: none;
                    padding: 0;
                    text-align: left;
                }
                .address-delete-button:hover {
                    text-decoration: underline;
                }  
                
            `}</style>
        </div>
    );
};



export default AddressCard;