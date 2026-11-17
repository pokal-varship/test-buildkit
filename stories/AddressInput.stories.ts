import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SearchInput } from '@components/address/SearchInput';
import { LOCATION_IMAGE, SEARCH_ICON } from '@config/Header/image.config';

const meta: Meta<typeof SearchInput> = {
    title: 'SearchInput',
    component: SearchInput,
};

export default meta;

export const Default: StoryObj<typeof SearchInput> = {
    args: {
        search: false,
        searchIcon: SEARCH_ICON,
        location: true,
        locationIcon: LOCATION_IMAGE,
        placeholder: 'Enter your address',
    },
};
