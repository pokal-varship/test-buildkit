import { GET_PRODUCT_STORES_ENDPOINT } from '@config/api.config';
import axios from 'axios';
import axiosClient from './axios';
/**
 * Fetches the address from OpenStreetMap Nominatim API using reverse geocoding.
 * @param {number} lat - Latitude of the location.
 * @param {number} lon - Longitude of the location.
 * @returns {Promise<Object>} - A promise that resolves to the address data.
 */
export const getAddressFromCoordinates = async (lat: number, lon: number) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const getSearchAddress = async (
    address: string, 
    options?: {
        lat?: number;
        lon?: number;
        radius?: number; // in kilometers
    }
) => {
    // Start with base URL and query parameter
    let url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(address)}`;
    
    // Add viewbox parameters if lat/lon and radius are provided
    if (options?.lat !== undefined && options?.lon !== undefined && options?.radius !== undefined) {
        // Convert radius in km to bounding box (approximation)
        // 1 degree of latitude is approximately 111 km
        const latDelta = options.radius / 111;
        // 1 degree of longitude varies, but at the equator it's also roughly 111 km
        // We adjust for latitude with the cosine
        const lonDelta = options.radius / (111 * Math.cos(options.lat * Math.PI / 180));
        
        // Calculate bounding box
        const viewBox = [
            options.lon - lonDelta, // min longitude
            options.lat - latDelta, // min latitude
            options.lon + lonDelta, // max longitude
            options.lat + latDelta  // max latitude
        ].join(',');
        
        url += `&viewbox=${viewBox}&bounded=1`;
    }
    
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const fetchIPInfo = async () => {
    try {
        const response = await fetch("https://ipinfo.io?token=10ff35cdc096c5");
        const data = await response.json();
        return data;
    } catch {

    }
};

export const handleManualAddressSearchbyZipcode = async (zipcode: string) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(zipcode)}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const getProductStores = async (productId: string) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${GET_PRODUCT_STORES_ENDPOINT}?productId=${productId}`;
    try {
        const response = await axiosClient.get(url);
        return response.data;
    } catch (error) {

        throw error;
    }
};