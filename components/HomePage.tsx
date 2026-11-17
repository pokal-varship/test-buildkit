import React from 'react';
import MenuCategories from './storeMenu/MenuCategories';

export const HomePage: React.FC = () => {

    // const menuItems = [
    //     { name: 'Item 1', price: '$10', description: 'Description 1', allergens: 'Allergen 1', calories: 200, imageUrl: 'Images/image-1.png' },
    //     { name: 'Item 2', price: '$15', description: 'Description 2', allergens: 'Allergen 2', calories: 250, imageUrl: 'Images/image-2.png' },
    // ];

    return (
        <article>
            <MenuCategories menuId="" categories={{ data: [] }} loading={false} />
            {/* <MenuList menuItems={menuItems} /> */}
        </article>
    );
}; 