import { AppLayout } from '../components/app-layout';

export function ReportingPage() {
    return (
        <AppLayout>
            <section className="mx-auto w-full max-w-6xl">
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm sm:p-8">
                    <p className="text-sm font-semibold text-[var(--color-accent)]">Reporting</p>
                    <h1 className="mt-3 text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
                        Reporting coming soon
                    </h1>
                </div>
            </section>
        </AppLayout>
    );
}
