import { EVENT_ENDPOINT } from "@config/api.config";
import axiosClient from "./axios";

export const getEvent = async (): Promise<any> => {
    try {
        const response = await axiosClient.get(EVENT_ENDPOINT);
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const getEventDetails = async (eventId: string): Promise<any> => {
    try {
        const response = await axiosClient.get(`${EVENT_ENDPOINT}?id=${eventId}`);
        return response.data;
    } catch (error) {

        throw error;
    }
};