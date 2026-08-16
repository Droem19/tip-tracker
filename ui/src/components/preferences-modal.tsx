import { type FormEvent, useState } from 'react';

import { AppModal } from './app-modal';
import type { DefaultViewPreference, ThemePreference } from '../auth/api';
import { useAuth } from '../auth/auth-context';
import { useTheme } from '../theme/theme-context';

const themeOptions = ['light', 'dark', 'system'] as const satisfies readonly ThemePreference[];
const defaultViewOptions = ['weekly', 'monthly'] as const satisfies readonly DefaultViewPreference[];

export function PreferencesModal({ onClose }: { onClose: () => void }) {
    const { updateProfile, user } = useAuth();
    const { setThemePreference, themePreference } = useTheme();
    const [theme, setTheme] = useState<ThemePreference>(user?.themePreference ?? themePreference);
    const [defaultView, setDefaultView] = useState<DefaultViewPreference>(user?.defaultView ?? 'monthly');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setIsSaving(true);

        try {
            await updateProfile({ themePreference: theme, defaultView });
            setThemePreference(theme);
            onClose();
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Unable to update preferences.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AppModal
            title="Preferences"
            description="Choose how Tip Tracker should feel across devices."
            showCloseButton={false}
            onClose={onClose}
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                <fieldset>
                    <legend className="text-sm font-semibold text-[var(--color-text-muted)]">Theme</legend>
                    <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-md border border-[var(--color-border-strong)] bg-[var(--color-field-bg)] p-1">
                        {themeOptions.map((option) => (
                            <button
                                className={[
                                    'h-9 rounded text-sm font-semibold capitalize transition focus:outline-none focus:ring-4 focus:ring-[#293453]/15',
                                    theme === option
                                        ? 'bg-[var(--color-primary-action)] text-white shadow-sm'
                                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-hover)]',
                                ].join(' ')}
                                key={option}
                                type="button"
                                disabled={isSaving}
                                onClick={() => setTheme(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </fieldset>

                <fieldset>
                    <legend className="text-sm font-semibold text-[var(--color-text-muted)]">
                        Default home/calendar view
                    </legend>
                    <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-md border border-[var(--color-border-strong)] bg-[var(--color-field-bg)] p-1">
                        {defaultViewOptions.map((option) => (
                            <button
                                className={[
                                    'h-9 rounded text-sm font-semibold capitalize transition focus:outline-none focus:ring-4 focus:ring-[#293453]/15',
                                    defaultView === option
                                        ? 'bg-[var(--color-primary-action)] text-white shadow-sm'
                                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-hover)]',
                                ].join(' ')}
                                key={option}
                                type="button"
                                disabled={isSaving}
                                onClick={() => setDefaultView(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </fieldset>

                {error ? (
                    <div className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-4 py-3 text-sm leading-6 text-[var(--color-danger-text)]">
                        {error}
                    </div>
                ) : null}

                <div className="flex flex-col-reverse gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:justify-between">
                    <button
                        className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--color-border-strong)] bg-[var(--color-field-bg)] px-4 text-sm font-semibold text-[var(--color-text-muted)] transition hover:bg-[var(--color-hover)] focus:outline-none focus:ring-4 focus:ring-teal-700/10"
                        type="button"
                        disabled={isSaving}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="inline-flex h-10 items-center justify-center rounded-md bg-[#293453] px-4 text-sm font-semibold text-white transition hover:bg-[#222b45] focus:outline-none focus:ring-4 focus:ring-[#293453]/15"
                        disabled={isSaving}
                        type="submit"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </AppModal>
    );
}
