import React from 'react';
import CartButton from '@components/buttons/CartButton';
import type { Meta, StoryObj } from '@storybook/react';

// Define the meta information for the story
const meta: Meta<typeof CartButton> = {
    component: CartButton,
};

export default meta;
type Story = StoryObj<typeof CartButton>;

// Define a default story
export const Default: Story = {
    args: {
    },
};

// You can add more stories if needed
export const EmptyCart: Story = {
    args: {
    },
};
