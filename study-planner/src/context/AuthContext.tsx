import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { httpClient } from '../api/httpClient';
import { authStorage } from '../api/authStorage';
import type { AuthUser, LoginResponse } from '../types/auth';
import type { LoginFormData } from '../schemas/authSchema';

export interface AuthContextType {
    user: AuthUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    login: (credentials: LoginFormData) => Promise<void>;
    logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(() => authStorage.getToken());
    const [isInitializing, setIsInitializing] = useState<boolean>(() => authStorage.hasToken());

    useEffect(() => {
        const token = authStorage.getToken();
        if (!token) return;

        const controller = new AbortController();

        const restoreSession = async () => {
            try {
                const me = await httpClient.request<AuthUser>('/auth/me', {
                    requiresAuth: true,
                    signal: controller.signal,
                });
                setUser(me);
                setAccessToken(token);
            } catch (err: unknown) {
                if (err instanceof Error && err.name === 'AbortError') return;
                authStorage.clearToken();
                setUser(null);
                setAccessToken(null);
            } finally {
                setIsInitializing(false);
            }
        };

        void restoreSession();

        return () => controller.abort();
    }, []);

    const login = useCallback(async (credentials: LoginFormData) => {
        const data = await httpClient.request<LoginResponse>('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
                expiresInMins: 60,
            }),
        });

        authStorage.setToken(data.accessToken);
        setAccessToken(data.accessToken);
        setUser({
            id: data.id,
            username: data.username,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            image: data.image,
        });
    }, []);

    const logout = useCallback(() => {
        authStorage.clearToken();
        setAccessToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
        user,
            accessToken,
            isAuthenticated: Boolean(accessToken),
            isInitializing,
            login,
            logout,
    }}
>
    {children}
    </AuthContext.Provider>
);
}