import {authStorage} from './authStorage.ts';

const API_URL = import.meta.env.VITE_API_URL || 'https://dummyjson.com';

interface RequestOptions extends RequestInit {
    requiresAuth?: boolean;
}

export const httpClient = {
    async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const {requiresAuth = false, headers: customHeaders, ...rest} = options;
        const headers = new Headers(customHeaders);

        const token = authStorage.getToken();
        if (requiresAuth && token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...rest,
            headers,
        });

        if (!response.ok) {
            throw new Error (`HTTP Error: ${response.status} ${response.statusText}`);
        }

        return await response.json() as Promise<T>;
    }
}