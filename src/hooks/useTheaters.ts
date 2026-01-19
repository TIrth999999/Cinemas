import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import type { TheaterType } from '../types';
import { useToast } from '../context/ToastContext';

export const useTheaters = () => {
    const [theaters, setTheaters] = useState<TheaterType[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchTheaters = async () => {
            try {
                const response = await axiosClient.get<{ data: TheaterType[] }>('/theaters');
                if (Array.isArray(response.data.data)) {
                    setTheaters(response.data.data);
                } else {
                    throw new Error("Invalid data format");
                }
            } catch (err) {
                console.error(err);
                showToast("Failed to load theaters. Please try again later.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchTheaters();
    }, [showToast]);

    return { theaters, loading };
};
