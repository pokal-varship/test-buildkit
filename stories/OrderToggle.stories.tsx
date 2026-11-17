import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import OrderToggle from '@components/buttons/orderToggle';

const meta: Meta<typeof OrderToggle> = {
    title: 'OrderToggle',
    component: OrderToggle,
};

export default meta;

const Template: StoryFn<typeof OrderToggle> = () => <OrderToggle options={[{ label: "Takeaway", value: "takeaway" }, { label: "Delivery", value: "delivery" }, { label: "Dine In", value: "dine-in" }]} initialSelected="takeaway" handleOrderTypeChange={() => {}} />;

export const Default = Template.bind({}); 
