import { type SyntheticEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';

import { useAuth } from '../auth/auth-context';

export function SignUpPage() {
    const { signUp, user } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (user) return <Navigate to="/app" replace />;

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setIsSubmitting(false);
            return;
        }

        try {
            await signUp(email, password);
            navigate(`/verify?email=${encodeURIComponent(email)}`, { replace: true, state: { password } });
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to create your account.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="grid min-h-svh place-items-center bg-stone-50 px-6 py-10 text-zinc-950">
            <section className="w-full max-w-sm">
                <div className="relative left-1/2 w-[23rem] max-w-[90vw] -translate-x-1/2">
                    <img className="h-auto w-full" alt="Tip Tracker" src="/banner-logo.png?v=2" />
                </div>
                <div className="mt-5 rounded-lg border border-zinc-200 bg-white px-6 py-5 shadow-sm">
                    <h1 className="text-center text-xl font-semibold tracking-tight">Create Account</h1>

                    <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
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

                        <div>
                            <label className="block text-sm font-medium text-zinc-700" htmlFor="password">
                                Password
                            </label>
                            <div className="relative mt-2">
                                <input
                                    className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 pr-10 text-base outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                                    autoComplete="new-password"
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                />
                                <button
                                    className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus:ring-4 focus:ring-teal-700/10"
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

                        <div>
                            <label className="block text-sm font-medium text-zinc-700" htmlFor="confirmPassword">
                                Confirm password
                            </label>
                            <div className="relative mt-2">
                                <input
                                    className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 pr-10 text-base outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                                    autoComplete="new-password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                />
                                <button
                                    className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus:ring-4 focus:ring-teal-700/10"
                                    type="button"
                                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                    aria-pressed={showConfirmPassword}
                                    onClick={() => setShowConfirmPassword((current) => !current)}
                                >
                                    {showConfirmPassword ? (
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

                        <button
                            className="h-11 w-full rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isSubmitting}
                            type="submit"
                        >
                            {isSubmitting ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <Link
                            className="font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-950"
                            to="/"
                        >
                            Back to login
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
