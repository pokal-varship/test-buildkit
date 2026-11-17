import { useState, useEffect } from 'react';
import { getEvent } from '@services/eventService';

export interface EventImage {
    url: string;
    altText: {
        en: string;
        es: string;
    };
    mobileUrl: string;
}

export interface EventAddress {
    id: string;
    address: string;
    addressLine2: string;
    landmark: string;
    city: string;
    state: string;
    country: string;
    area: string;
    zipCode: string;
    type: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    locationName: string;
    unitNumber: string;
}

export interface EventStatusLog {
    status: string;
    timeStamp: number;
    actionByUserId: string;
    notes: string;
}

export interface Event {
    id: string;
    clientName: string;
    name: string;
    images: EventImage[];
    location: string;
    address: EventAddress;
    description: string;
    priceType: 'PAID' | 'FREE';
    price: number;
    priceUnit: string;
    duration: number;
    durationUnit: string;
    minAge: number | null;
    bookingUrl: string;
    category: string;
    startDateAndtime: number;
    endDateAndtime: number;
    bookingEndDateTime: number;
    status: string;
    statusLogs: EventStatusLog[];
    storefrontId: string;
    tenantId: string;
    organizerDetails: {
        countryCode: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        phoneIsoCode: string;
    }
}

export interface EventsResponse {
    data: {
        events: Event[];
    };
}

export const useEvents = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            const response: EventsResponse = await getEvent();
            setEvents(response.data.events || []);
        } catch {
            // Error handled in UI
            setError('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return {
        events,
        loading,
        error,
        refetch: fetchEvents
    };
}; 