import { type FormEvent, useState } from 'react';

import { AppModal } from './app-modal';

export function PreferencesModal({ onClose }: { onClose: () => void }) {
    const [theme, setTheme] = useState('light');
    const [defaultView, setDefaultView] = useState('monthly');
    const [emailReminders, setEmailReminders] = useState('off');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onClose();
    };

    return (
        <AppModal
            title="Preferences"
            description="Choose how Tip Tracker should feel once preferences are wired up."
            onClose={onClose}
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                <fieldset>
                    <legend className="text-sm font-semibold text-zinc-700">Theme</legend>
                    <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-md border border-zinc-300 bg-white p-1">
                        {['light', 'dark'].map((option) => (
                            <button
                                className={[
                                    'h-9 rounded text-sm font-semibold capitalize transition focus:outline-none focus:ring-4 focus:ring-teal-700/10',
                                    theme === option
                                        ? 'bg-teal-700 text-white shadow-sm'
                                        : 'text-zinc-600 hover:bg-zinc-100',
                                ].join(' ')}
                                key={option}
                                type="button"
                                onClick={() => setTheme(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </fieldset>

                <fieldset>
                    <legend className="text-sm font-semibold text-zinc-700">Default home/calendar view</legend>
                    <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-md border border-zinc-300 bg-white p-1">
                        {['weekly', 'monthly'].map((option) => (
                            <button
                                className={[
                                    'h-9 rounded text-sm font-semibold capitalize transition focus:outline-none focus:ring-4 focus:ring-teal-700/10',
                                    defaultView === option
                                        ? 'bg-teal-700 text-white shadow-sm'
                                        : 'text-zinc-600 hover:bg-zinc-100',
                                ].join(' ')}
                                key={option}
                                type="button"
                                onClick={() => setDefaultView(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </fieldset>

                <fieldset>
                    <legend className="text-sm font-semibold text-zinc-700">Email reminders</legend>
                    <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-md border border-zinc-300 bg-white p-1">
                        {['on', 'off'].map((option) => (
                            <button
                                className={[
                                    'h-9 rounded text-sm font-semibold capitalize transition focus:outline-none focus:ring-4 focus:ring-teal-700/10',
                                    emailReminders === option
                                        ? 'bg-teal-700 text-white shadow-sm'
                                        : 'text-zinc-600 hover:bg-zinc-100',
                                ].join(' ')}
                                key={option}
                                type="button"
                                onClick={() => setEmailReminders(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </fieldset>

                <div className="rounded-lg border border-teal-700/15 bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-900">
                    Preferences are placeholder-only for now. Save Changes will close this modal without persisting.
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
                        className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-teal-700/15"
                        type="submit"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </AppModal>
    );
}
