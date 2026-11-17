'use client';

import React from 'react';
import OrderToggle from '@components/buttons/orderToggle';

export default function OrderToggleWrapper() {
  return (
    <OrderToggle
      options={[
        { label: "Takeaway", value: "takeaway" },
        { label: "Delivery", value: "delivery" },
        { label: "Dine In", value: "dine-in" }
      ]}
      initialSelected="takeaway"
      handleOrderTypeChange={() => {}}
    />
  );
} 