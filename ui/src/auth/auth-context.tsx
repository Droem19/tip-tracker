import { createContext, type ReactNode, use, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';

import { type AuthSession, authApi } from './api';

const storageKey = 'project-template-with-login:session';

type AuthContextValue = {
    session: AuthSession | null;
    login: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<string>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const readStoredSession = () => {
    const storedSession = window.localStorage.getItem(storageKey);

    if (!storedSession) return null;

    try {
        return JSON.parse(storedSession) as AuthSession;
    } catch {
        window.localStorage.removeItem(storageKey);
        return null;
    }
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());

    useEffect(() => {
        if (session) {
            window.localStorage.setItem(storageKey, JSON.stringify(session));
            return;
        }

        window.localStorage.removeItem(storageKey);
    }, [session]);

    const value: AuthContextValue = {
        session,
        login: async (email, password) => {
            const response = await authApi.login(email, password);
            setSession(response.session);
        },
        signUp: async (email, password) => {
            const response = await authApi.signUp(email, password);
            setSession(response.session);
        },
        forgotPassword: async (email) => {
            const response = await authApi.forgotPassword(email);
            return response.message;
        },
        logout: async () => {
            await authApi.logout();
            setSession(null);
        },
    };

    return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
    const context = use(AuthContext);

    if (!context) throw new Error('useAuth must be used within AuthProvider');

    return context;
}

export function RequireAuth({ children }: { children: ReactNode }) {
    const { session } = useAuth();
    const location = useLocation();

    if (!session) {
        return <Navigate to="/" replace state={{ from: location.pathname }} />;
    }

    return children;
}
