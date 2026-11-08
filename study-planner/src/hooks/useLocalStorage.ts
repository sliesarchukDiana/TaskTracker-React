import {useState, useEffect} from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error occurred in useLocalStorage() while reading', key, error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(initialValue));
        } catch (error) {
            console.error('Error occurred in useLocalStorage() while writing', key, error);
        }
    }, [key, initialValue]);

    return [storedValue, setStoredValue] as const;
}