import { UPLOAD_ENDPOINT } from "@config/api.config";
import axiosClient from "./axios";

export const getPresignedUrl = async (payload: any) => {
    try {
        const response = await axiosClient.post(`${UPLOAD_ENDPOINT}`, payload);
        return response.data;
    } catch (error) {

        throw error;
    }
};