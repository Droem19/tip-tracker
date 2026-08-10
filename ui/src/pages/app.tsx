import { Navigate } from 'react-router';

import { useAuth } from '../auth/auth-context';
import { AppFooter } from '../components/app-footer';
import { AppNavbar } from '../components/app-navbar';

export function AppPage() {
    const { user } = useAuth();

    if (!user) return <Navigate to="/" replace />;

    return (
        <div className="flex min-h-svh flex-col bg-stone-50 text-zinc-950">
            <AppNavbar />

            <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
                <section className="mx-auto w-full max-w-6xl">
                    <div className="min-h-[28rem] rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold text-teal-700">Dashboard</p>
                            <h1 className="mt-3 text-2xl font-semibold text-zinc-950 sm:text-3xl">Tip Tracker</h1>
                        </div>
                    </div>
                </section>
            </main>

            <AppFooter />
        </div>
    );
}
