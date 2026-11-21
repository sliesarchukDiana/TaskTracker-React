const TOKEN_KEY = 'study_planner_access_token';

export const authStorage = {
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },
    setToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    },
    clearToken(): void {
        localStorage.removeItem(TOKEN_KEY);
    },
    hasToken(): boolean {
        return Boolean(localStorage.getItem(TOKEN_KEY));
    }
}