import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import MenuSidebar from '@components/storeMenu/MenuSidebar';

const meta: Meta<typeof MenuSidebar> = {
    component: MenuSidebar,
    title: 'Menu/MenuSidebar',
};

export default meta;
type Story = StoryObj<typeof MenuSidebar>;

export const Default: Story = {
    args: {
        menuData: [
            { title: "Sandwiches", items: ["Club Sandwich", "BLT", "Grilled Cheese", "Philly Cheesesteak", "Monte Cristo", "Reuben"] },
            { title: "Salads" },
            { title: "Wraps", items: [] },
            { title: "Coffee", items: [] },
            { title: "Burgers", items: [] },
        ],
    },
};

