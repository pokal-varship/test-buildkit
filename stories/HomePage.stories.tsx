import { HomePage } from '@components/HomePage';
import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';

const meta: Meta<typeof HomePage> = {
    title: 'HomePage',
    component: HomePage,
};

export default meta;

const Template: StoryFn<typeof HomePage> = (args: any) => <HomePage {...args} />;

export const Default = Template.bind({});
Default.args = {}; 
