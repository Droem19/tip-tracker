import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';

import type { AuthUser } from '../auth/api';
import { useAuth } from '../auth/auth-context';

const firstWord = (value: string) => value.trim().split(/\s+/)[0] ?? '';

const formatFallbackName = (email: string) => {
    const localPart = email.split('@')[0] ?? '';
    const firstPart = localPart.split(/[._-]/)[0] ?? localPart;

    if (!firstPart) return 'Account';

    return `${firstPart.charAt(0).toUpperCase()}${firstPart.slice(1)}`;
};

const getDisplayFirstName = (user: AuthUser) => {
    if (user.givenName) return firstWord(user.givenName);
    if (user.name) return firstWord(user.name);

    return formatFallbackName(user.email);
};

type AppNavbarProps = {
    onPreferencesSelect?: () => void;
    onProfileSelect?: () => void;
};

export function AppNavbar({ onPreferencesSelect, onProfileSelect }: AppNavbarProps) {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    useEffect(() => {
        if (!isMenuOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (!menuRef.current?.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMenuOpen]);

    const handleProfileClick = () => {
        setIsMenuOpen(false);
        onProfileSelect?.();
    };

    const handlePreferencesClick = () => {
        setIsMenuOpen(false);
        onPreferencesSelect?.();
    };

    const handleLogout = async () => {
        setIsMenuOpen(false);
        setIsSigningOut(true);

        try {
            await logout();
            navigate('/', { replace: true });
        } finally {
            setIsSigningOut(false);
        }
    };

    if (!user) return null;

    const firstName = getDisplayFirstName(user);

    return (
        <header className="border-b border-zinc-200 bg-white shadow-sm">
            <nav className="mx-auto flex h-20 w-full max-w-6xl items-center gap-3 px-4 sm:px-6" aria-label="Main">
                <Link
                    className="flex h-14 w-40 shrink-0 items-center sm:w-48"
                    to="/app"
                    aria-label="Tip Tracker dashboard"
                >
                    <img className="h-auto w-full translate-y-1" alt="Tip Tracker" src="/banner-logo.png?v=2" />
                </Link>

                <div className="flex flex-1 justify-center px-2">
                    <NavLink
                        className={({ isActive }) =>
                            [
                                'inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-semibold transition',
                                isActive
                                    ? 'bg-teal-50 text-teal-800 ring-1 ring-teal-700/15'
                                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950',
                            ].join(' ')
                        }
                        to="/reporting"
                    >
                        Reporting
                    </NavLink>
                </div>

                <div className="relative shrink-0" ref={menuRef}>
                    <button
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-100 focus:outline-none focus:ring-4 focus:ring-teal-700/10"
                        type="button"
                        aria-expanded={isMenuOpen}
                        aria-haspopup="menu"
                        onClick={() => setIsMenuOpen((current) => !current)}
                    >
                        <span>{firstName}</span>
                        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M5.2 7.7a.75.75 0 0 1 1.1 0L10 11.4l3.7-3.7a.75.75 0 1 1 1.1 1.1l-4.2 4.2a.75.75 0 0 1-1.1 0L5.2 8.8a.75.75 0 0 1 0-1.1Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>

                    {isMenuOpen ? (
                        <div
                            className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
                            role="menu"
                        >
                            <button
                                className="block w-full px-4 py-2 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 focus:bg-zinc-100 focus:text-zinc-950 focus:outline-none"
                                type="button"
                                role="menuitem"
                                onClick={handleProfileClick}
                            >
                                Profile
                            </button>
                            <button
                                className="block w-full px-4 py-2 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 focus:bg-zinc-100 focus:text-zinc-950 focus:outline-none"
                                type="button"
                                role="menuitem"
                                onClick={handlePreferencesClick}
                            >
                                Preferences
                            </button>
                            <button
                                className="block w-full px-4 py-2 text-left text-sm font-medium text-red-700 transition hover:bg-red-50 hover:text-red-800 focus:bg-red-50 focus:text-red-800 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={isSigningOut}
                                type="button"
                                role="menuitem"
                                onClick={handleLogout}
                            >
                                {isSigningOut ? 'Logging out...' : 'Log Out'}
                            </button>
                        </div>
                    ) : null}
                </div>
            </nav>
        </header>
    );
}
