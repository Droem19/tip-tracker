import { type SyntheticEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';

import { useAuth } from '../auth/auth-context';

type HomeLocationState = {
    message?: string;
};

export function HomePage() {
    const { login, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const locationState = location.state as HomeLocationState | null;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState(typeof locationState?.message === 'string' ? locationState.message : null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (user) return <Navigate to="/app" replace />;

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
        setIsSubmitting(true);

        try {
            await login(email, password);
            navigate('/app', { replace: true });
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Unable to sign in.';

            if (message.toLowerCase().includes('verify')) {
                navigate(`/verify?email=${encodeURIComponent(email)}`, { state: { password } });
                return;
            }

            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="grid min-h-svh place-items-center bg-stone-50 px-6 py-10 text-zinc-950">
            <section className="w-full max-w-xs">
                <div className="relative left-1/2 w-[23rem] max-w-[90vw] -translate-x-1/2">
                    <img className="h-auto w-full" alt="Tip Tracker" src="/banner-logo.png?v=2" />
                </div>

                <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium text-zinc-700">
                        Email
                        <input
                            className="mt-2 h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                            autoComplete="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </label>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700" htmlFor="password">
                            Password
                        </label>
                        <div className="relative mt-2">
                            <input
                                className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 pr-10 text-sm outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                                autoComplete="current-password"
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                            <button
                                className="absolute right-1.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus:ring-4 focus:ring-teal-700/10"
                                type="button"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                aria-pressed={showPassword}
                                onClick={() => setShowPassword((current) => !current)}
                            >
                                {showPassword ? (
                                    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M3 3l18 18M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6M9.9 4.2A10.2 10.2 0 0 1 12 4c5.5 0 9 5.2 9 8a8.1 8.1 0 0 1-1.8 3.8M6.6 6.7C4.4 8.2 3 10.6 3 12c0 2.8 3.5 8 9 8 1.3 0 2.5-.3 3.5-.8"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                        />
                                    </svg>
                                ) : (
                                    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M3 12s3.5-8 9-8 9 8 9 8-3.5 8-9 8-9-8-9-8Z"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                        />
                                        <path
                                            d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
                    {message ? <p className="text-sm font-medium text-teal-700">{message}</p> : null}

                    <div className="space-y-3 pt-1 text-center">
                        <button
                            className="h-10 w-full rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isSubmitting}
                            type="submit"
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </button>

                        <Link
                            className="inline-flex text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-950"
                            to="/forgot-password"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                </form>

                <div className="mt-6 space-y-3 text-center">
                    <p className="text-base font-medium text-zinc-700">Don't have an account?</p>
                    <Link
                        className="inline-flex h-10 w-full items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-950 transition hover:border-zinc-400 hover:bg-zinc-100"
                        to="/signup"
                    >
                        Create new account
                    </Link>
                </div>
            </section>
        </main>
    );
}
