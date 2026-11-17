import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import MenuList from '@components/storeMenu/MenuList';

const meta: Meta<typeof MenuList> = {
    component: MenuList,
    title: 'Menu/MenuList',
};

export default meta;
type Story = StoryObj<typeof MenuList>;

export const Default: Story = {
    args: {
        menuItems: [
            { name: 'Cheddar Cheese Ploughman’s Sandwich', newPrice: '$4.99', oldPrice: '', description: 'Barber\'s mature Cheddar cheese with onion mayonnaise, sliced tomatoes, seasonal leaves & pickle on malted bread', allergens: 'Eggs, Milk, Gluten, Sulphite', calories: 200, imageUrl: 'Images/sandwich.png', tag: '' },
            { name: 'Ham Hock & Smocked Cheddar Farmhouse Sandwich', newPrice: '$3.19', oldPrice: '$5.29', description: 'Barber\'s mature Cheddar cheese with onion mayonnaise, sliced tomatoes, seasonal leaves & pickle on malted bread', allergens: 'Eggs, Milk, Gluten, Sulphite', calories: 250, imageUrl: 'Images/ClubSandwich.png', tag: 'FLAT $2 OFF' },
        ],
    },
};

