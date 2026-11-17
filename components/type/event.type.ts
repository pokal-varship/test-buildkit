export interface EventLocation {
  venue: string;
  address: string;
  phone: string;
  mapImage: string;
}

export interface EventDateTime {
  date: string;
  display: string;
  duration: string;
  endTime: string;
}

export interface EventTags {
  ageLimit: string;
  type: string;
  category: string;
}

export interface EventOrganizer {
  name: string;
  title: string;
  company: string;
  location: string;
  avatar: string;
  rating: number;
  phone: string;
}

export interface EventAddress {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  unitNumber?: string;
}

export interface EventData {
  id: number;
  title: string;
  images: string[];
  priceRange: string;
  minPrice: number;
  maxPrice: number;
  dateTime: EventDateTime;
  tags: EventTags;
  amenities: string[];
  parking: string;
  description: string;
  location: EventLocation;
  organizer: EventOrganizer;
  saleEnded: boolean;
  address: EventAddress;
  organizerDetails: {
    countryCode: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    phoneIsoCode: string;
  }
} 