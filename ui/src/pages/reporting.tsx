import { AppLayout } from '../components/app-layout';

export function ReportingPage() {
    return (
        <AppLayout>
            <section className="mx-auto w-full max-w-6xl">
                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
                    <p className="text-sm font-semibold text-teal-700">Reporting</p>
                    <h1 className="mt-3 text-2xl font-semibold text-zinc-950 sm:text-3xl">Reporting coming soon</h1>
                </div>
            </section>
        </AppLayout>
    );
}
