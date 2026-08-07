import { type SyntheticEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';

import { useAuth } from '../auth/auth-context';

export function HomePage() {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (user) return <Navigate to="/app" replace />;

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await login(email, password);
            navigate('/app', { replace: true });
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Unable to sign in.';

            if (message.toLowerCase().includes('verify')) {
                navigate(`/verify?email=${encodeURIComponent(email)}`);
                return;
            }

            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="grid min-h-svh place-items-center bg-stone-50 px-6 py-10 text-zinc-950">
            <section className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-teal-700">project-template-with-login</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight">Sign in</h1>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium text-zinc-700">
                        Email
                        <input
                            className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-base outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                            autoComplete="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </label>

                    <label className="block text-sm font-medium text-zinc-700">
                        Password
                        <input
                            className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-base outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                            autoComplete="current-password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </label>

                    {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

                    <button
                        className="h-11 w-full rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isSubmitting}
                        type="submit"
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-between text-sm">
                    <Link
                        className="font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-950"
                        to="/forgot-password"
                    >
                        Forgot password
                    </Link>
                    <Link
                        className="font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-950"
                        to="/signup"
                    >
                        Sign up
                    </Link>
                </div>
            </section>
        </main>
    );
}
