import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import type { CardType } from '../types';
import { useToast } from '../context/ToastContext';

export const useMovies = () => {
    const [movies, setMovies] = useState<CardType[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axiosClient.get<CardType[]>('/movies');
                setMovies(response.data);
            } catch (err: any) {
                console.error(err);
                // Don't show toast for 401 errors - handled globally
                if (err.response?.status !== 401) {
                    showToast("Failed to load movies. Please try again later.", "error");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, [showToast]);

    return { movies, loading };
};
