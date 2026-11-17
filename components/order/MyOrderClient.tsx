'use client';

import { useState, useEffect } from 'react';
import { loginSuccessSubject } from '@lib/rxSubject';
import MyOrder from './MyOrder';

const MyOrderClient = () => {
    const [rerenderKey, setRerenderKey] = useState(0);

    useEffect(() => {
        // Subscribe to login success events
        const subscription = loginSuccessSubject.subscribe(() => {
            // Increment key to force rerender of MyOrder component
            setRerenderKey(prev => prev + 1);
        });

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return <MyOrder key={`cart_${rerenderKey}`} rerenderKey={rerenderKey} />;
};

export default MyOrderClient;

