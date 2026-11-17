"use client"
import React, { useState } from "react";

interface MenuItem {
    title: string;
    items?: string[];
}

interface MenuProps {
    menuData: MenuItem[];
}

const MenuSidebar: React.FC<MenuProps> = ({ menuData }) => {
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

    const toggleSection = (title: string) => {
        setExpandedSections((prev) =>
            prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
        );
    };

    return (
        <div className="menu-container">
            {menuData.map(({ title, items }) => (
                <div key={title} className="menu-section">
                    <div className="menu-header" onClick={() => toggleSection(title)} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <img fetchPriority="high"  title="Arrow Icon" src={expandedSections.includes(title) ? "/images/arrow-up.png" : "/images/arrow-down.png"} alt="arrow" className="arrow-icon" />
                        <span>{title}</span>
                    </div>
                    {expandedSections.includes(title) && items && (
                        <ul className="menu-list">
                            {items.map((item) => (
                                <li key={item} className="menu-item">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
            <style>{`
                .menu-container {
                    width: 250px;
                    background: #fdfcf7;
                    padding: 10px;
                }

                .menu-section {
                    margin-bottom: 5px;
                }

                .menu-header {
                    font-weight: bold;
                    padding: 8px;
                    cursor: pointer;
                    background: #fff;
                    border-radius: 5px;
                }

                .menu-list {
                    background: #fdf6e4;
                    padding-left: 20px;
                }

                .menu-item {
                    padding: 5px 0;
                }
                .arrow-icon {
                    width: 8px;
                    height: 8px;
                }
      `}</style>
        </div>
    );
};

export default MenuSidebar;
