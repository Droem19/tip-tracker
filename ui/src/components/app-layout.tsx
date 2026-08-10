import { type ReactNode, useState } from 'react';

import { AppFooter } from './app-footer';
import { AppNavbar } from './app-navbar';
import { PreferencesModal } from './preferences-modal';
import { ProfileModal } from './profile-modal';

type AppLayoutProps = {
    children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
    const [activeModal, setActiveModal] = useState<'preferences' | 'profile' | null>(null);

    return (
        <div className="flex min-h-svh flex-col bg-stone-50 text-zinc-950">
            <AppNavbar
                onPreferencesSelect={() => setActiveModal('preferences')}
                onProfileSelect={() => setActiveModal('profile')}
            />

            <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>

            <AppFooter />

            {activeModal === 'profile' ? <ProfileModal onClose={() => setActiveModal(null)} /> : null}
            {activeModal === 'preferences' ? <PreferencesModal onClose={() => setActiveModal(null)} /> : null}
        </div>
    );
}
