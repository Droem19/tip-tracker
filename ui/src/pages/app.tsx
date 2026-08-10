import { AppLayout } from '../components/app-layout';
import { StatCard } from '../components/stat-card';

const summaryStats = [
    { title: 'Monthly Income', value: '$1450' },
    { title: 'Tip %', value: '24.2%' },
    { title: 'Average Hourly', value: '$45.50' },
];

export function AppPage() {
    return (
        <AppLayout>
            <section className="mx-auto w-full max-w-5xl space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                    {summaryStats.map((stat) => (
                        <StatCard key={stat.title} title={stat.title} value={stat.value} />
                    ))}
                </div>

                <div className="min-h-[24rem] rounded-lg border border-zinc-200 bg-white/60" />
            </section>
        </AppLayout>
    );
}
