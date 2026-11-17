import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import MenuCard from '@components/storeMenu/MenuCard';

const meta: Meta<typeof MenuCard> = {
    component: MenuCard,
};

export default meta;
type Story = StoryObj<typeof MenuCard>;

export const Default: Story = {
    args: {
        menuItems: [
            {
                title: 'Cheddar Cheese Ploughman\'s Sandwich',
                imageSrc: 'Images/sandwich.png',
                newPrice: '$4.99',
                oldPrice: '',
                calories: '477',
            },
            {
                title: 'Chicken & Bacon Club Sandwich',
                imageSrc: 'Images/ClubSandwich.png',
                newPrice: '$3.19',
                oldPrice: '$5.29',
                calories: '653',
            },
        ],
    },
};

