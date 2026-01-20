import axiosClient from '../api/axiosClient';

// Types
export interface LoginResponse {
    data: {
        message: string;
        accessToken: string;
        expireAt: number;
    };
}

export const authService = {
    login: async (credentials: { email: string; password: string }) => {
        const response = await axiosClient.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    signup: async (userData: any) => {
        const response = await axiosClient.post('/auth/signup', userData);
        return response.data;
    },
};