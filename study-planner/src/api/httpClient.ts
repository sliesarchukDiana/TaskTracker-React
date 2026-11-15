const API_URL = import.meta.env.VITE_API_URL || 'https://dummyjson.com';

export const httpClient = {
    async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${API_URL}${endpoint}`, options);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }
};