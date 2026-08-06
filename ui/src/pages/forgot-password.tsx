import { type FormEvent, useState } from 'react';
import { Link } from 'react-router';

import { useAuth } from '../auth/auth-context';

export function ForgotPasswordPage() {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
        setIsSubmitting(true);

        try {
            const responseMessage = await forgotPassword(email);
            setMessage(responseMessage);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to request a reset.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthShell title="Reset password" eyebrow="Account recovery">
            <form className="space-y-5" onSubmit={handleSubmit}>
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

                {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
                {message ? <p className="text-sm font-medium text-teal-700">{message}</p> : null}

                <button
                    className="h-11 w-full rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSubmitting}
                    type="submit"
                >
                    {isSubmitting ? 'Sending...' : 'Send reset email'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                <Link className="font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-950" to="/">
                    Back to login
                </Link>
            </div>
        </AuthShell>
    );
}

function AuthShell({ children, eyebrow, title }: { children: React.ReactNode; eyebrow: string; title: string }) {
    return (
        <main className="grid min-h-svh place-items-center bg-stone-50 px-6 py-10 text-zinc-950">
            <section className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-teal-700">{eyebrow}</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
                <div className="mt-8">{children}</div>
            </section>
        </main>
    );
}
