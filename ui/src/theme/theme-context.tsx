import { createContext, type ReactNode, use, useCallback, useEffect, useState } from 'react';

import type { ThemePreference } from '../auth/api';
import { useAuth } from '../auth/auth-context';

const themeStorageKey = 'tip-tracker-theme-preference';
const themePreferences = ['light', 'dark', 'system'] as const satisfies readonly ThemePreference[];

type ResolvedTheme = 'light' | 'dark';

type ThemeContextValue = {
    themePreference: ThemePreference;
    resolvedTheme: ResolvedTheme;
    setThemePreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isThemePreference = (value: string | null): value is ThemePreference =>
    value !== null && themePreferences.includes(value as ThemePreference);

const getStoredThemePreference = (): ThemePreference => {
    if (typeof window === 'undefined') return 'system';

    const storedPreference = window.localStorage.getItem(themeStorageKey);

    return isThemePreference(storedPreference) ? storedPreference : 'system';
};

const getSystemTheme = (): ResolvedTheme => {
    if (typeof window === 'undefined') return 'light';

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveTheme = (preference: ThemePreference): ResolvedTheme =>
    preference === 'system' ? getSystemTheme() : preference;

const applyTheme = (theme: ResolvedTheme) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [themePreference, setThemePreferenceState] = useState(getStoredThemePreference);
    const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(getStoredThemePreference()));

    const setThemePreference = useCallback((preference: ThemePreference) => {
        window.localStorage.setItem(themeStorageKey, preference);
        setThemePreferenceState(preference);
    }, []);

    useEffect(() => {
        if (!user?.themePreference) return;

        setThemePreference(user.themePreference);
    }, [setThemePreference, user?.themePreference]);

    useEffect(() => {
        const updateResolvedTheme = () => {
            const nextTheme = resolveTheme(themePreference);
            setResolvedTheme(nextTheme);
            applyTheme(nextTheme);
        };

        updateResolvedTheme();

        if (themePreference !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', updateResolvedTheme);

        return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
    }, [themePreference]);

    return <ThemeContext value={{ themePreference, resolvedTheme, setThemePreference }}>{children}</ThemeContext>;
}

export function useTheme() {
    const context = use(ThemeContext);

    if (!context) throw new Error('useTheme must be used within ThemeProvider');

    return context;
}
