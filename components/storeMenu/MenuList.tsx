import React from "react";
import tenantConfig from "@config/tenant.config";

interface MenuItem {
    name: string;
    newPrice: string;
    oldPrice?: string;
    description: string;
    allergens: string;
    calories: number;
    imageUrl: string;
    tag?: string;
}

interface MenuListProps {
    menuItems: MenuItem[];
}

const MenuList: React.FC<MenuListProps> = ({ menuItems }) => {
    return (
        <div className="menu-list">
            {menuItems.map((item, index) => (
                <div key={index} className="menu-item" >
                    {item.tag && <p className="tag">
                        {item.tag}
                    </p>}
                    <div className="menu-item-header">
                        <p className="menu-item-header-text">{item.name}</p>
                        <img fetchPriority="high"  title="Arrow Icon" src={'/images/arrow.png'} alt={item.name} className="w-5 h-5" />
                    </div>
                    <div className="menu-item-body">
                        <div className="item-content">
                            <div className="price-section">
                                {tenantConfig.showStrikethroughPrice && item.oldPrice && <span className="old-price">{item.oldPrice}</span>}
                                <span className="new-price">{item.newPrice}</span>
                            </div>
                            <p className="description">{item.description}</p>
                            <p className="allergens">
                                <span className="font-bold">Allergens:</span> <span className="allergens-item">{item.allergens}</span>
                                {tenantConfig.showCaloriesInfo && (
                                  <> | <span className="font-bold">{item.calories} kcal</span></>
                                )}
                            </p>
                        </div>
                        <div className="image-container">
                            <img fetchPriority="high"  title={item.name} src={item.imageUrl} alt={item.name} className="rounded-md" />
                        </div>
                    </div>
                </div>
            ))}
            <style>{`
                .menu-list {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    padding: 20px;
                    background-color: var(--primary-background);
                }

                .menu-item {
                    padding: 15px;
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    background-color: var(--primary-background);
                    position: relative;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }

                .menu-item-body {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .item-content {
                    flex: 1;
                    margin-right: 15px; /* Space between text and image */
                }

                .menu-item-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    padding-right:40px;
                }

                .tag {
                   font-size: var(--font-xss);
                   font-weight: bold;
                   color: var(--color-orange);
                   padding: 5px 10px;
                   border-radius: 5px;
                   background-color: var(--menu-card-tag-color);
                   width: fit-content;
                }
                   
                .menu-item-header-text{
                    font-size: var(--font-md);
                    font-weight: var(--font-semi-bold);
                    color: var(--primary-text); 
                    font-family: var(--font-family);
                }

                .price-section {
                    display: flex;
                    align-items: center;
                    margin: 5px 0;
                }

                .new-price {
                    font-size: var(--font-sm);
                    color: var(--primary-color);
                }

                .old-price {
                    text-decoration: line-through;
                    color: var(--borders-dividers);
                    margin-right: 8px;
                    font-size: var(--font-sm);
                }

                .description {
                    font-size: var(--font-xs);
                    color: var(--primary-text); 
                }

                .allergens {
                    font-size: var(--font-xs);
                    color: var(--primary-text); 
                }
                
                .allergens-item{    
                    color: var(--borders-dividers);
                }

                .image-container {
                    width: 100px;
                    height: 100px;
                    position: relative;
                }
            `}</style>
        </div>
    );
};

export default MenuList;
