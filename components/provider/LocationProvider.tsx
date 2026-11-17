'use client'
import React, { useEffect } from 'react';
import { useAddress } from '@hooks/useAddress';

interface LocationProviderProps {
    children: React.ReactNode; // Define the type for children
}

const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
    const { fetchLocation } = useAddress();

    useEffect(() => {
        fetchLocation();
    }, []);

    return <>{children}</>;
};

export default LocationProvider; 
