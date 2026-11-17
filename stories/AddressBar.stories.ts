import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import AddressBar from '@components/address/AddressBar';

const meta: Meta<typeof AddressBar> = {
    title: 'AddressBar',
    component: AddressBar,
};

export default meta;

export const Default: StoryObj<typeof AddressBar> = {
    args: {
    },
};
