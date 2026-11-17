"use client";
import React, { useEffect, useState } from "react";
interface ToggleOption {
    label: string;
    value: string;
}

interface ToggleSelectionProps {
    options: ToggleOption[];
    initialSelected: string;
    handleOrderTypeChange: (type: string) => void;
}

const OrderToggle: React.FC<ToggleSelectionProps> = ({ options, initialSelected, handleOrderTypeChange }) => {
    const [selected, setSelected] = useState<string>(initialSelected);

    useEffect(() => {
        setSelected(initialSelected);
    }, [initialSelected]);

    return (
        <div className="toggle-container">
            {options.map((option, index) => (
                <button
                    key={option.value}
                    className={`toggle-button ${index < options.length - 1 ? 'toggle-border' : ''} ${selected === option.value ? "active" : ""}`}
                    onClick={() => {
                        setSelected(option.value);
                        handleOrderTypeChange(option.value);
                    }}
                >
                    <span className={`toggle-icon ${selected === option.value ? 'active' : ''}`}></span>
                    <span className="toggle-label">{option.label}</span>
                </button>
            ))}
            <style>{`
                .toggle-container {
                    display: flex;
                    border: 1px solid var(--primary-color);
                    border-radius: 8px;
                    overflow: hidden;
                    width: fit-content;
                    background-color: var(--cards-containers);
                }

                .toggle-button {
                    flex: 1;
                    padding: 10px 20px;
                    border: none;
                    background-color: var(--primary-background);
                    color: var(--primary-text);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: var(--font-family);
                    transition: background-color 0.2s ease;
                }

                .toggle-button:hover {
                    background-color: var(--secondary-active-background);
                }

                .toggle-border {
                    border-right: 1px solid var(--borders-dividers);
                }

                .toggle-button.active {
                    color: var(--primary-text);
                    font-weight: var(--font-bold);
                    background-color: var(--secondary-active-background);
                }

                .toggle-icon {
                    flex-shrink: 0;
                    width: 20px;
                    height: 20px;
                    border: 1.5px solid var(--primary-text);
                    border-radius: 6px;
                    background-color: transparent;
                    position: relative;
                    transition: all 0.2s ease;
                }

                .toggle-icon.active {
                    background-color: var(--primary-color);
                    border-color: var(--primary-color);
                    filter: brightness(1.1) saturate(1.2);
                    position: relative;
                }

                .toggle-icon.active::after {
                    content: '';
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: 5px;
                    height: 10px;
                    border: solid var(--primary-background);
                    border-width: 0 2px 2px 0;
                    transform: translate(-50%, -60%) rotate(45deg);
                }

                .toggle-label {
                    white-space: nowrap;
                }

                @media (max-width: 768px) {
                    .toggle-container {
                        width: 100%;
                    }
                    .toggle-button {
                        padding: 10px 12px;
                        font-size: var(--description-font);
                        gap: 6px;
                    }
                    .toggle-icon {
                        width: 18px;
                        height: 18px;
                    }
                }
            `}</style>
        </div>
    );
};

export default OrderToggle;
