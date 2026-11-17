import React from 'react';
import MenuCategories from '../components/storeMenu/MenuCategories';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof MenuCategories> = {
    component: MenuCategories,
};

export default meta;
type Story = StoryObj<typeof MenuCategories>;

export const Default: Story = {
    args: {
        // categories: [
        //     { title: 'MEAL DEALS', image: 'Images/Inviting-Breakfast.png', desktop: "large", mobile: "large" },
        //     { title: 'SANDWICHES', image: 'Images/image-2.png', desktop: "small", mobile: "small" },
        //     { title: 'SALADS', image: 'Images/image-3.png', desktop: "small", mobile: "small" },
        //     { title: 'Wraps', image: 'Images/image-4.png', desktop: "small", mobile: "small" },
        //     { title: 'Coffee', image: 'Images/image-5.png', desktop: "small", mobile: "small" },
        //     { title: 'Burgers', image: 'Images/image-6.png', desktop: "small", mobile: "small" },
        //     { title: 'Fried Chicken', image: 'Images/image-7.png', desktop: "small", mobile: "small" },
        //     { title: 'Pastries & Cakes', image: 'Images/image-8.png', desktop: "small", mobile: "small" },
        //     { title: 'Cold Drinks', image: 'Images/image-9.png', desktop: "small", mobile: "small" },
        //     { title: 'Rice box', image: 'Images/image-10.png', desktop: "small", mobile: "small" },
        //     { title: 'Biscuits', image: 'Images/image-11.png', desktop: "small", mobile: "small" },
        //     // Add more categories as needed
        // ],
    },
};

