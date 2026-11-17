import { Event } from '@hooks/useEvents';
import formatCurrency from '@lib/helper/price';
import { TranslationKeys } from 'types';

export const formatEventPrice = (event: Event, lang: TranslationKeys): string => {
    if (event.priceType === 'FREE') {
        return 'Free';
    }
    return `${formatCurrency({ amount: event.price })} / ${lang.seat}`;
};

export const formatEventDateTime = (startTime: number, endTime: number): string => {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    
    const startFormatted = startDate.toLocaleDateString('en-US', options);
    const endTimeFormatted = endDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    
    return `${startFormatted} · ${startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    })} - ${endTimeFormatted}`;
};

export const formatEventLocation = (event: Event): string => {
    const { address } = event;
    if (address.city && address.state) {
        return `${address.city}, ${address.state}`;
    }
    return event.location || 'Location TBD';
};

export const getEventLabel = (event: Event): string => {
    // You can customize this based on event category or other criteria
    if (event.category) {
        return event.category;
    }
    
    // Default labels based on event type or name
    const eventName = event.name.toLowerCase();
    if (eventName.includes('conference')) return 'Conference';
    if (eventName.includes('workshop')) return 'Workshop';
    if (eventName.includes('meetup')) return 'Meetup';
    if (eventName.includes('seminar')) return 'Seminar';
    
    return 'Event';
};

// New functions for event details page
export const formatEventPriceRange = (event: Event): string => {
    if (event.priceType === 'FREE') {
        return 'Free';
    }
    return `$${event.price}`;
};

export const formatEventDuration = (event: Event): string => {
    const { duration, durationUnit } = event;
    if (duration === 1) {
        return `${duration} ${durationUnit.slice(0, -1)}`; // Remove 's' for singular
    }
    return `${duration} ${durationUnit}`;
};

export const getEventImages = (event: Event): string[] => {
    if (event.images && event.images.length > 0) {
        return event.images.map(img => img.url);
    }
    // Fallback images
    return [
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop'
    ];
};

export const formatEventAddress = (event: Event): string => {
    const { address } = event;
    const parts = [];
    
    if (address.address) parts.push(address.address);
    if (address.addressLine2) parts.push(address.addressLine2);
    if (address.city && address.state) {
        parts.push(`${address.city}, ${address.state} ${address.zipCode}`);
    } else if (address.city) {
        parts.push(address.city);
    }
    if (address.country) parts.push(address.country);
    
    return parts.join(', ');
};

export const getEventStatus = (event: Event): { saleEnded: boolean; status: string } => {
    const now = Date.now();
    const bookingEnded = event.bookingEndDateTime > 0 && now > event.bookingEndDateTime;
    const eventEnded = now > event.endDateAndtime;
    
    if (bookingEnded || eventEnded) {
        return { saleEnded: false, status: 'Sale Ended' };
    }
    
    return { saleEnded: true, status: 'Active' };
}; 