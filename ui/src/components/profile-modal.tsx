import { type FormEvent, useEffect, useState } from 'react';

import { AppModal } from './app-modal';
import { useAuth } from '../auth/auth-context';
import { formatCurrencyAmount, parseCurrencyAmount, sanitizeCurrencyAmountInput } from '../lib/currency';

type ProfileModalProps = {
    onClose: () => void;
};

const getProfileNameParts = (name?: string, givenName?: string, familyName?: string) => {
    const nameParts = name?.trim().split(/\s+/) ?? [];

    return {
        firstName: givenName?.trim() || nameParts[0] || '',
        lastName: familyName?.trim() || nameParts.slice(1).join(' '),
    };
};

export function ProfileModal({ onClose }: ProfileModalProps) {
    const { refreshUser, updateProfile, user } = useAuth();
    const profileNameParts = getProfileNameParts(user?.name, user?.givenName, user?.familyName);
    const [firstName, setFirstName] = useState(profileNameParts.firstName);
    const [lastName, setLastName] = useState(profileNameParts.lastName);
    const [hourlyRate, setHourlyRate] = useState(formatCurrencyAmount(user?.hourlyWage));
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        void refreshUser();
    }, [refreshUser]);

    useEffect(() => {
        const nextNameParts = getProfileNameParts(user?.name, user?.givenName, user?.familyName);

        setFirstName(nextNameParts.firstName);
        setLastName(nextNameParts.lastName);
        setHourlyRate(formatCurrencyAmount(user?.hourlyWage));
    }, [user]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        const hourlyWage = parseCurrencyAmount(hourlyRate);

        if (!firstName.trim() || !lastName.trim()) {
            setError('First and last name are required.');
            return;
        }

        if (hourlyWage === null) {
            setError('Enter a valid hourly rate.');
            return;
        }

        setIsSaving(true);

        try {
            await updateProfile({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                hourlyWage,
            });
            onClose();
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Unable to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AppModal
            title="Profile"
            description="Update the profile details Tip Tracker will use across the app."
            showCloseButton={false}
            onClose={onClose}
        >
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-semibold text-zinc-700">
                        First Name
                        <input
                            className="mt-2 h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                            autoComplete="given-name"
                            name="firstName"
                            type="text"
                            value={firstName}
                            required
                            onChange={(event) => setFirstName(event.target.value)}
                        />
                    </label>

                    <label className="block text-sm font-semibold text-zinc-700">
                        Last Name
                        <input
                            className="mt-2 h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                            autoComplete="family-name"
                            name="lastName"
                            type="text"
                            value={lastName}
                            required
                            onChange={(event) => setLastName(event.target.value)}
                        />
                    </label>
                </div>

                <label className="block text-sm font-semibold text-zinc-700">
                    Hourly Rate
                    <div className="relative mt-2">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">
                            $
                        </span>
                        <input
                            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 pl-7 text-sm font-medium text-zinc-950 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                            inputMode="decimal"
                            name="hourlyRate"
                            type="text"
                            value={hourlyRate}
                            required
                            onBlur={() => setHourlyRate(formatCurrencyAmount(hourlyRate))}
                            onChange={(event) => setHourlyRate(sanitizeCurrencyAmountInput(event.target.value))}
                        />
                    </div>
                </label>

                {error ? (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">
                        {error}
                    </div>
                ) : null}

                <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-between">
                    <button
                        className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-100 focus:outline-none focus:ring-4 focus:ring-teal-700/10"
                        type="button"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="inline-flex h-10 items-center justify-center rounded-md bg-[#293453] px-4 text-sm font-semibold text-white transition hover:bg-[#222b45] focus:outline-none focus:ring-4 focus:ring-[#293453]/15 disabled:cursor-not-allowed disabled:opacity-70"
                        type="submit"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </AppModal>
    );
}
