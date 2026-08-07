import { useState } from 'react';
import { Navigate } from 'react-router';

import { useAuth } from '../auth/auth-context';

export function AppPage() {
    const { logout, user } = useAuth();
    const [isSigningOut, setIsSigningOut] = useState(false);

    if (!user) return <Navigate to="/" replace />;

    const handleSignOut = async () => {
        setIsSigningOut(true);
        await logout();
    };

    return (
        <main className="min-h-svh bg-stone-50 px-6 py-8 text-zinc-950">
            <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
                <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-teal-700">project-template-with-login</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight">App</h1>
                    </div>
                    <button
                        className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isSigningOut}
                        type="button"
                        onClick={handleSignOut}
                    >
                        {isSigningOut ? 'Signing out...' : 'Sign out'}
                    </button>
                </header>

                <div className="grid gap-4 sm:grid-cols-2">
                    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-zinc-500">Signed in as</p>
                        <p className="mt-2 text-lg font-semibold">{user.email}</p>
                    </section>
                    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-zinc-500">Session source</p>
                        <p className="mt-2 text-lg font-semibold">Cognito cookie session</p>
                    </section>
                </div>
            </section>
        </main>
    );
}
