import { AppLayout } from '../components/app-layout';

export function AppPage() {
    return (
        <AppLayout>
            <section className="mx-auto w-full max-w-6xl">
                <div className="min-h-[28rem] rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold text-teal-700">Dashboard</p>
                        <h1 className="mt-3 text-2xl font-semibold text-zinc-950 sm:text-3xl">Tip Tracker</h1>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
