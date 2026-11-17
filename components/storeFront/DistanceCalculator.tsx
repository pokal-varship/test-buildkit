import React from 'react';

interface DistanceCalculatorProps {
    lat1: number;
    lon1: number;
    lat2: number;
    lon2: number;
}

const DistanceCalculator: React.FC<DistanceCalculatorProps> = ({ lat1, lon1, lat2, lon2 }) => {
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 3958.8; // Earth's radius in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in miles
    };

    return <>{calculateDistance(lat1, lon1, lat2, lon2)?.toFixed?.(1)} mi</>;
};

export default DistanceCalculator; 
