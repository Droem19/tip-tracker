import { useEffect, useState } from 'react';

import { type DailyTipEntry, dailyEntryApi, type SaveDailyTipEntryRequest } from '../auth/api';
import { AppLayout } from '../components/app-layout';
import { DailyIncomeModal } from '../components/daily-income-modal';
import { StatCard } from '../components/stat-card';
import { TipCalendar } from '../components/tip-calendar';
import { formatLocalDateKey, getMonthDateRange } from '../lib/local-date';

const summaryStats = [
    { title: 'Monthly Income', value: '$1450' },
    { title: 'Tip %', value: '24.2%' },
    { title: 'Average Hourly', value: '$45.50' },
];

const today = new Date();

const getInitialDisplayedMonth = () => new Date(today.getFullYear(), today.getMonth(), 1);

const mapEntriesByDate = (entries: DailyTipEntry[]) =>
    entries.reduce<Record<string, DailyTipEntry>>((entriesByDate, entry) => {
        entriesByDate[entry.date] = entry;

        return entriesByDate;
    }, {});

export function AppPage() {
    const [displayedMonth, setDisplayedMonth] = useState(getInitialDisplayedMonth);
    const [entriesByDate, setEntriesByDate] = useState<Record<string, DailyTipEntry>>({});
    const [isEntriesLoading, setIsEntriesLoading] = useState(false);
    const [entriesError, setEntriesError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        let isCurrentRequest = true;
        const { startDate, endDate } = getMonthDateRange(displayedMonth);

        setIsEntriesLoading(true);
        setEntriesError(null);

        dailyEntryApi
            .list(startDate, endDate)
            .then(({ entries }) => {
                if (isCurrentRequest) setEntriesByDate(mapEntriesByDate(entries));
            })
            .catch((requestError) => {
                if (!isCurrentRequest) return;

                setEntriesError(requestError instanceof Error ? requestError.message : 'Unable to load daily entries.');
            })
            .finally(() => {
                if (isCurrentRequest) setIsEntriesLoading(false);
            });

        return () => {
            isCurrentRequest = false;
        };
    }, [displayedMonth]);

    const selectedDateKey = selectedDate ? formatLocalDateKey(selectedDate) : null;
    const selectedEntry = selectedDateKey ? entriesByDate[selectedDateKey] : undefined;

    const saveDailyEntry = async (request: SaveDailyTipEntryRequest) => {
        if (!selectedDateKey) return;

        const { entry } = await dailyEntryApi.save(selectedDateKey, request);

        setEntriesByDate((currentEntries) => ({
            ...currentEntries,
            [entry.date]: entry,
        }));
    };

    const deleteDailyEntry = async () => {
        if (!selectedDateKey) return;

        await dailyEntryApi.delete(selectedDateKey);

        setEntriesByDate((currentEntries) => {
            const nextEntries = { ...currentEntries };
            delete nextEntries[selectedDateKey];

            return nextEntries;
        });
    };

    return (
        <AppLayout>
            <section className="mx-auto w-full max-w-5xl space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                    {summaryStats.map((stat) => (
                        <StatCard key={stat.title} title={stat.title} value={stat.value} />
                    ))}
                </div>

                <TipCalendar
                    displayedMonth={displayedMonth}
                    entriesByDate={entriesByDate}
                    error={entriesError}
                    isLoading={isEntriesLoading}
                    onDayClick={setSelectedDate}
                    onMonthChange={setDisplayedMonth}
                />
            </section>

            {selectedDate ? (
                <DailyIncomeModal
                    entry={selectedEntry}
                    selectedDate={selectedDate}
                    onClose={() => setSelectedDate(null)}
                    onDelete={deleteDailyEntry}
                    onSave={saveDailyEntry}
                />
            ) : null}
        </AppLayout>
    );
}
