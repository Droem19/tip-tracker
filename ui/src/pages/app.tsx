import { useState } from 'react';

import { AppLayout } from '../components/app-layout';
import { DailyIncomeModal } from '../components/daily-income-modal';
import { StatCard } from '../components/stat-card';
import { TipCalendar } from '../components/tip-calendar';

const summaryStats = [
    { title: 'Monthly Income', value: '$1450' },
    { title: 'Tip %', value: '24.2%' },
    { title: 'Average Hourly', value: '$45.50' },
];

export function AppPage() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    return (
        <AppLayout>
            <section className="mx-auto w-full max-w-5xl space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                    {summaryStats.map((stat) => (
                        <StatCard key={stat.title} title={stat.title} value={stat.value} />
                    ))}
                </div>

                <TipCalendar onDayClick={setSelectedDate} />
            </section>

            {selectedDate ? (
                <DailyIncomeModal selectedDate={selectedDate} onClose={() => setSelectedDate(null)} />
            ) : null}
        </AppLayout>
    );
}
