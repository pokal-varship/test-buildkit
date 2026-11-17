import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import MenuFilters from '@components/storeMenu/MenuFilters';

const meta: Meta<typeof MenuFilters> = {
    component: MenuFilters,
    title: 'Menu/MenuFilters',
};

export default meta;
type Story = StoryObj<typeof MenuFilters>;

export const Default: Story = {
    args: {
        filterOptions: {
            sortBy: ["Bestseller", "Price", "Rating"],
            calorie: ["Any", "Low", "Medium", "High"],
            allergens: ["Any", "Gluten", "Nuts", "Dairy"],
        },
    },
};

