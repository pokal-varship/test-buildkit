import MenuFilters from '@components/storeMenu/MenuFilters';
import MenuList from '@components/storeMenu/MenuList';
import MenuSidebar from '@components/storeMenu/MenuSidebar';
import React from 'react';


export default function RestaurantMenu() {
    const menuData = [
        { title: "Sandwiches", items: ["Club Sandwich", "BLT", "Grilled Cheese", "Philly Cheesesteak", "Monte Cristo", "Reuben"] },
        { title: "Salads" },
        { title: "Wraps" },
        { title: "Coffee" },
        { title: "Burgers" },
    ];

    const filterOptions = {
        sortBy: ["Bestseller", "Price", "Rating"],
        calorie: ["Any", "Low", "Medium", "High"],
        allergens: ["Any", "Gluten", "Nuts", "Dairy"],
    }

    const menuItems = [
        { name: 'Cheddar Cheese Ploughman’s Sandwich', newPrice: '$4.99', oldPrice: '', description: 'Barber\'s mature Cheddar cheese with onion mayonnaise, sliced tomatoes, seasonal leaves & pickle on malted bread', allergens: 'Eggs, Milk, Gluten, Sulphite', calories: 200, imageUrl: 'Images/sandwich.png', tag: '' },
        { name: 'Ham Hock & Smocked Cheddar Farmhouse Sandwich', newPrice: '$3.19', oldPrice: '$5.29', description: 'Barber\'s mature Cheddar cheese with onion mayonnaise, sliced tomatoes, seasonal leaves & pickle on malted bread', allergens: 'Eggs, Milk, Gluten, Sulphite', calories: 250, imageUrl: 'Images/ClubSandwich.png', tag: 'FLAT $2 OFF' },
    ]

    return (
        <div className="restaurant-menu-page">
            <MenuSidebar menuData={menuData} />
            <div className="menu-content">
                <MenuFilters filterOptions={filterOptions} />
                <MenuList menuItems={menuItems} />
            </div>
        </div>
    );
};
