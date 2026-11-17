import { ABOUT_US_ENDPOINT } from "@config/api.config";
import axiosClient from "./axios";

export const getTeamMembersData = async (): Promise<object> => {
    try {
        const response = await axiosClient.get(ABOUT_US_ENDPOINT, {
        });
        return response.data;
    } catch (error) {

        throw error;
    }
};

// Server-side version that doesn't use cookies
export const getTeamMembersDataServer = async (): Promise<object> => {
    try {
        // Get a fresh token for server-side requests
        const token = await getServerSideToken();
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${ABOUT_US_ENDPOINT}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Tenant-Id': process.env.NEXT_PUBLIC_TENANT_ID || '',
                'Authorization': token
            },
            next: { revalidate: 900 } // Cache for 15 minutes
        });

        // Handle 204 No Content status - return empty data
        if (response.status === 204) {
            return { data: [], totalCount: 0 };
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {

        throw error;
    }
};

// Helper function to get server-side token
async function getServerSideToken(): Promise<string> {
    try {
        // Import guestToken service for server-side token generation
        const { fetchGuestTokenServer } = await import('./guestToken');
        return await fetchGuestTokenServer();
    } catch {

        return '';
    }
}