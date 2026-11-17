"use client"
import React, { useState } from "react";

interface FilterOptions {
    sortBy: string[];
    calorie: string[];
    allergens: string[];
}

const MenuFilters: React.FC<{ filterOptions: FilterOptions }> = ({ filterOptions }) => {
    const [filters, setFilters] = useState(
        Object.fromEntries(Object.keys(filterOptions).map((key) => [key, filterOptions[key as keyof FilterOptions][0]]))
    );

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="menu-filters">
            {Object.entries(filterOptions).map(([key, options], index) => (
                <div key={key} className={`filter-box ${index === 0 ? "highlight" : ""}`}>
                    <label>{key.replace(/([A-Z])/g, " $1").trim()}:</label>
                    <select name={key} value={filters[key]} onChange={handleChange}>
                        {options.map((option: string) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            ))}
            <style>{`
                .menu-filters {
                    display: flex;
                    gap: 8px;
                }

                .filter-box {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 6px 12px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background: #fff;
                }

                .filter-box.highlight {
                    border-color: #f4d27b;
                    background: #fff8e1;
                }

                label {
                    font-size: var(--font-xs);
                    font-weight: var(--font-medium);
                }

                select {
                    border: none;
                    background: transparent;
                    font-size: var(--font-xs);
                    font-weight: var(--font-medium);
                    cursor: pointer;
                }
                .menu-filters {
                    display: flex;
                    gap: 10px;
                }

                .menu-filters select {
                    padding: 5px;
                    border-radius: 4px;
                }

      `}</style>
        </div>
    );
};

export default MenuFilters;
