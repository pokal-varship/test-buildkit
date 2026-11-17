import React from 'react';
import HeadingTag from '../components/HeadingTag';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof HeadingTag> = {
    component: HeadingTag,
};

export default meta;
type Story = StoryObj<typeof HeadingTag>;


export const H1: Story = {
    args: {
        title: 'Heading Level 1',
        tag: 'h1',
    },
};

export const H2: Story = {
    args: {
        title: 'Heading Level 2',
        tag: 'h2',
    },
};

export const H3: Story = {
    args: {
        title: 'Heading Level 3',
        tag: 'h3',
    },
};

export const H4: Story = {
    args: {
        title: 'Heading Level 4',
        tag: 'h4',
    },
};
export const H5: Story = {
    args: {
        title: 'Heading Level 5',
        tag: 'h5',
    },
};
export const H6: Story = {
    args: {
        title: 'Heading Level 6',
        tag: 'h6',
    },
}; 
