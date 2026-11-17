import { useState, useEffect } from 'react';
import { getEvent, getEventDetails } from '@services/eventService';
import { Event, EventsResponse } from './useEvents';

export const useEventDetails = (eventId?: string) => {
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEventDetails = async () => {
        if (!eventId) {
            setError('Event ID is required');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response: EventsResponse = await getEventDetails(eventId);
            
            // Find the specific event by ID
            const foundEvent = response.data.events?.find(e => e.id === eventId);
            
            if (foundEvent) {
                setEvent(foundEvent);
            } else {
                setError('Event not found');
            }
        } catch {

            setError('Failed to fetch event details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

    return {
        event,
        loading,
        error,
        refetch: fetchEventDetails
    };
}; 