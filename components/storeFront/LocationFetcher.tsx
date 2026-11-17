import { Coordinates, LocationFetcherProps } from '@components/type/home.type';
import React, { useEffect, useState } from 'react';

const LocationFetcher: React.FC<LocationFetcherProps> = ({ children }) => {
    const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    setLocationError(`Unable to retrieve your location: ${error.message}`);

                }
            );
        } else {
            setLocationError("Geolocation is not supported by this browser.");
        }
    }, []);

    return (
        <>
            {children(userLocation, locationError)}
        </>
    );
};

export default LocationFetcher; 