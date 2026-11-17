'use client';

import React, { useState } from 'react';
import clsx from 'clsx';

type RatingSelectorProps = {
    label: string;
    maxRating?: number;
    onChange?: (value: number) => void;
    selectedRating?: number;
};

export const RatingSelector = ({
    label,
    maxRating = 5,
    onChange,
    selectedRating = 0
}: RatingSelectorProps) => {
    const [selected, setSelected] = useState<number | null>(selectedRating);

    const handleClick = (value: number) => {
        setSelected(value);
        if (onChange) onChange(value);
    };

    return (
        <>
        <div className="w-[85%]">
            <label className="block mb-[6px] md-font-medium">{label}</label>
            <div className="flex gap-2">
                {[...Array(maxRating)].map((_, index) => {
                    const value = index + 1;
                    return (
                        <button
                            key={value}
                            onClick={() => handleClick(value)}
                            className={clsx(
                                'w-full py-2 rounded border',
                                value <= (selected ?? 0)
                                    ? 'bg-[var(--accent-color)] text-[var(--white)]'
                                    : 'bg-[var(--cards-containers)] text-[var(--secondary-text)] border-[var(--rating-border-secondary)]'
                            )}
                        >
                            {value}
                        </button>
                    );
                })}
            </div>
        </div>
        <style>{`
            @media (min-width: 768px) {
                .md-font-medium {
                    font-weight: var(--font-medium);
                }
            }
        `}</style>
        </>
    );
};
export default RatingSelector;