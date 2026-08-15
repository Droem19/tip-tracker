import { type FormEvent, useState } from 'react';

import { AppModal } from './app-modal';
import { useAuth } from '../auth/auth-context';

type ProfileModalProps = {
    onClose: () => void;
};

const getProfileNameParts = (name?: string, givenName?: string) => {
    const nameParts = name?.trim().split(/\s+/) ?? [];

    return {
        firstName: givenName?.trim() || nameParts[0] || '',
        lastName: nameParts.slice(1).join(' '),
    };
};

export function ProfileModal({ onClose }: ProfileModalProps) {
    const { user } = useAuth();
    const profileNameParts = getProfileNameParts(user?.name, user?.givenName);
    const [firstName, setFirstName] = useState(profileNameParts.firstName);
    const [lastName, setLastName] = useState(profileNameParts.lastName);
    const [hourlyRate, setHourlyRate] = useState('');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onClose();
    };

    return (
        <AppModal
            title="Profile"
            description="Update the profile details Tip Tracker will use across the app."
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
                            min="0"
                            name="hourlyRate"
                            step="0.01"
                            type="number"
                            value={hourlyRate}
                            onChange={(event) => setHourlyRate(event.target.value)}
                        />
                    </div>
                </label>

                <div className="rounded-lg border border-teal-700/15 bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-900">
                    Profile editing is placeholder-only for now. Save Changes will close this modal without persisting.
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-end">
                    <button
                        className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-100 focus:outline-none focus:ring-4 focus:ring-teal-700/10"
                        type="button"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="inline-flex h-10 items-center justify-center rounded-md bg-[#293453] px-4 text-sm font-semibold text-white transition hover:bg-[#222b45] focus:outline-none focus:ring-4 focus:ring-[#293453]/15"
                        type="submit"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </AppModal>
    );
}
