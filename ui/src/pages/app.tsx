import { useEffect, useState } from 'react';

import { type DailyTipEntry, dailyEntryApi, type SaveDailyTipEntryRequest } from '../auth/api';
import { useAuth } from '../auth/auth-context';
import { AppLayout } from '../components/app-layout';
import { DailyIncomeModal } from '../components/daily-income-modal';
import { StatCard } from '../components/stat-card';
import { TipCalendar } from '../components/tip-calendar';
import { formatLocalDateKey, getMonthDateRange } from '../lib/local-date';

const currencyFormatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
});

const percentFormatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
    style: 'percent',
});

const today = new Date();
const ESTIMATED_PAYROLL_TAX_RATE = 0.2;

const getInitialDisplayedMonth = () => new Date(today.getFullYear(), today.getMonth(), 1);

const mapEntriesByDate = (entries: DailyTipEntry[]) =>
    entries.reduce<Record<string, DailyTipEntry>>((entriesByDate, entry) => {
        entriesByDate[entry.date] = entry;

        return entriesByDate;
    }, {});

const getSummaryStats = (entriesByDate: Record<string, DailyTipEntry>, hourlyWage = 0) => {
    const totals = Object.values(entriesByDate).reduce(
        (monthlyTotals, entry) => ({
            hoursWorked: monthlyTotals.hoursWorked + entry.hoursWorked,
            tipsEarned: monthlyTotals.tipsEarned + entry.tipsEarned,
            totalSales: monthlyTotals.totalSales + entry.totalSales,
        }),
        { hoursWorked: 0, tipsEarned: 0, totalSales: 0 }
    );
    const baseWages = totals.hoursWorked * hourlyWage;
    const estimatedPayrollTaxes = (totals.tipsEarned + baseWages) * ESTIMATED_PAYROLL_TAX_RATE;
    const estimatedNetPaycheck = Math.max(baseWages - estimatedPayrollTaxes, 0);
    const estimatedTakeHome = totals.tipsEarned + estimatedNetPaycheck;
    const averageHourly = totals.hoursWorked > 0 ? estimatedTakeHome / totals.hoursWorked : 0;
    const tipPercent = totals.totalSales > 0 ? totals.tipsEarned / totals.totalSales : 0;

    return [
        { title: 'Total Tips', value: currencyFormatter.format(totals.tipsEarned) },
        { title: 'Average Tip %', value: percentFormatter.format(tipPercent) },
        { title: 'Est. Take-Home / Hour', value: currencyFormatter.format(averageHourly) },
    ];
};

export function AppPage() {
    const { user } = useAuth();
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
        setEntriesByDate({});

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
    const summaryStats = getSummaryStats(entriesByDate, user?.hourlyWage);

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
