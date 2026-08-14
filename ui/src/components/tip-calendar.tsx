import { useEffect, useRef, useState } from 'react';

import type { DailyTipEntry } from '../auth/api';
import { formatLocalDateKey } from '../lib/local-date';

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthOptions = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type CalendarCell = {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
};

type TipCalendarProps = {
    displayedMonth: Date;
    entriesByDate: Record<string, DailyTipEntry>;
    error: string | null;
    isLoading: boolean;
    onDayClick: (date: Date) => void;
    onMonthChange: (date: Date) => void;
};

const today = new Date();

const isSameDay = (date: Date, comparisonDate: Date) =>
    date.getFullYear() === comparisonDate.getFullYear() &&
    date.getMonth() === comparisonDate.getMonth() &&
    date.getDate() === comparisonDate.getDate();

const getCalendarCells = (displayedMonth: Date): CalendarCell[] => {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    return Array.from({ length: 42 }, (_, index) => {
        const dayOffset = index - firstDayOfMonth + 1;
        const date = new Date(year, month, dayOffset);
        const isCurrentMonth = date.getMonth() === month;

        return {
            date,
            isCurrentMonth,
            isToday: isCurrentMonth && isSameDay(date, today),
        };
    });
};

const getMonthLabel = (date: Date) =>
    date.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
    });

const formatTipAmount = (amount: number) => `$${amount.toFixed(2)}`;

export function TipCalendar({
    displayedMonth,
    entriesByDate,
    error,
    isLoading,
    onDayClick,
    onMonthChange,
}: TipCalendarProps) {
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [draftYear, setDraftYear] = useState(displayedMonth.getFullYear());
    const monthPickerRef = useRef<HTMLDivElement>(null);
    const calendarCells = getCalendarCells(displayedMonth);

    useEffect(() => {
        if (!isMonthPickerOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (!monthPickerRef.current?.contains(event.target as Node)) {
                setIsMonthPickerOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsMonthPickerOpen(false);
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMonthPickerOpen]);

    const openMonthPicker = () => {
        setDraftYear(displayedMonth.getFullYear());
        setIsMonthPickerOpen((current) => !current);
    };

    const jumpToMonth = (month: number) => {
        onMonthChange(new Date(draftYear, month, 1));
        setIsMonthPickerOpen(false);
    };

    const showPreviousMonth = () => {
        onMonthChange(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1));
        setIsMonthPickerOpen(false);
    };

    const showNextMonth = () => {
        onMonthChange(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1));
        setIsMonthPickerOpen(false);
    };

    const handleDayClick = (date: Date) => {
        onDayClick(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    };

    return (
        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                    <button
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-600 transition hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus:ring-4 focus:ring-teal-700/10"
                        type="button"
                        aria-label="Previous month"
                        onClick={showPreviousMonth}
                    >
                        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M12.8 4.2a.75.75 0 0 1 0 1.1L8.1 10l4.7 4.7a.75.75 0 1 1-1.1 1.1l-5.2-5.2a.75.75 0 0 1 0-1.1l5.2-5.2a.75.75 0 0 1 1.1 0Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>

                    <div className="relative" ref={monthPickerRef}>
                        <h2 className="text-center text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
                            <button
                                className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 transition hover:bg-zinc-100 focus:outline-none focus:ring-4 focus:ring-teal-700/10"
                                type="button"
                                aria-expanded={isMonthPickerOpen}
                                aria-haspopup="dialog"
                                onClick={openMonthPicker}
                            >
                                {getMonthLabel(displayedMonth)}
                            </button>
                        </h2>

                        {isMonthPickerOpen ? (
                            <div className="absolute left-1/2 z-20 mt-3 w-72 -translate-x-1/2 rounded-lg border border-zinc-200 bg-white p-4 text-left shadow-xl">
                                <div className="grid grid-cols-3 gap-2">
                                    {monthOptions.map((month, index) => {
                                        const isSelectedMonth =
                                            draftYear === displayedMonth.getFullYear() &&
                                            index === displayedMonth.getMonth();

                                        return (
                                            <button
                                                className={[
                                                    'h-10 rounded-md text-sm font-semibold uppercase transition focus:outline-none focus:ring-4 focus:ring-teal-700/10',
                                                    isSelectedMonth
                                                        ? 'bg-teal-700 text-white shadow-sm'
                                                        : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950',
                                                ].join(' ')}
                                                key={month}
                                                type="button"
                                                onClick={() => jumpToMonth(index)}
                                            >
                                                {month}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 flex items-center justify-center gap-3 border-t border-zinc-200 pt-4">
                                    <button
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-600 transition hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus:ring-4 focus:ring-teal-700/10"
                                        type="button"
                                        aria-label="Previous year"
                                        onClick={() => setDraftYear((currentYear) => currentYear - 1)}
                                    >
                                        <svg
                                            aria-hidden="true"
                                            className="h-4 w-4"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M12.8 4.2a.75.75 0 0 1 0 1.1L8.1 10l4.7 4.7a.75.75 0 1 1-1.1 1.1l-5.2-5.2a.75.75 0 0 1 0-1.1l5.2-5.2a.75.75 0 0 1 1.1 0Z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                    <p className="min-w-20 text-center text-lg font-semibold text-zinc-950">
                                        {draftYear}
                                    </p>
                                    <button
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-600 transition hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus:ring-4 focus:ring-teal-700/10"
                                        type="button"
                                        aria-label="Next year"
                                        onClick={() => setDraftYear((currentYear) => currentYear + 1)}
                                    >
                                        <svg
                                            aria-hidden="true"
                                            className="h-4 w-4"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M7.2 15.8a.75.75 0 0 1 0-1.1l4.7-4.7-4.7-4.7a.75.75 0 0 1 1.1-1.1l5.2 5.2a.75.75 0 0 1 0 1.1l-5.2 5.2a.75.75 0 0 1-1.1 0Z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <button
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-600 transition hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus:ring-4 focus:ring-teal-700/10"
                        type="button"
                        aria-label="Next month"
                        onClick={showNextMonth}
                    >
                        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M7.2 15.8a.75.75 0 0 1 0-1.1l4.7-4.7-4.7-4.7a.75.75 0 0 1 1.1-1.1l5.2 5.2a.75.75 0 0 1 0 1.1l-5.2 5.2a.75.75 0 0 1-1.1 0Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="p-3 sm:p-5">
                <div className="relative">
                    <div
                        className={[
                            'transition duration-200',
                            isLoading ? 'pointer-events-none select-none blur-[2px] opacity-60' : '',
                        ].join(' ')}
                    >
                        <div className="grid grid-cols-7 border-b border-zinc-200 pb-2">
                            {weekdayLabels.map((weekday) => (
                                <div
                                    className="text-center text-xs font-semibold uppercase text-zinc-500"
                                    key={weekday}
                                >
                                    {weekday}
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 grid grid-cols-7 gap-2">
                            {calendarCells.map((cell) => {
                                const dateKey = formatLocalDateKey(cell.date);
                                const entry = entriesByDate[dateKey];

                                return cell.isCurrentMonth ? (
                                    <button
                                        className={[
                                            'flex min-h-20 cursor-pointer flex-col items-center justify-start gap-1 rounded-lg border border-zinc-200 bg-white p-2 text-sm font-semibold text-zinc-700 transition hover:border-teal-700/30 hover:bg-teal-50/50 focus:outline-none focus:ring-4 focus:ring-teal-700/10 sm:min-h-24 sm:p-3',
                                            cell.isToday
                                                ? 'border-teal-700/40 bg-teal-50 text-teal-800 ring-1 ring-teal-700/15'
                                                : '',
                                        ].join(' ')}
                                        key={dateKey}
                                        type="button"
                                        onClick={() => handleDayClick(cell.date)}
                                    >
                                        <span>{cell.date.getDate()}</span>
                                        {entry ? (
                                            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-700 ring-1 ring-teal-700/10">
                                                {formatTipAmount(entry.tipsEarned)}
                                            </span>
                                        ) : null}
                                    </button>
                                ) : (
                                    <div
                                        className="min-h-20 rounded-lg border border-transparent bg-transparent p-2 sm:min-h-24 sm:p-3"
                                        key={dateKey}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {isLoading ? (
                        <div
                            className="absolute inset-0 z-10 grid place-items-center rounded-lg bg-white/60 backdrop-blur-[1px]"
                            aria-live="polite"
                            aria-busy="true"
                            role="status"
                            aria-label="Loading entries"
                        >
                            <div className="grid h-12 w-12 place-items-center rounded-full border border-teal-700/15 bg-white/90 shadow-lg shadow-zinc-950/10">
                                <span
                                    className="h-6 w-6 animate-spin rounded-full border-2 border-teal-700/25 border-t-teal-700"
                                    aria-hidden="true"
                                />
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="mt-4 min-h-6" aria-live="polite">
                    {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
                </div>
            </div>
        </section>
    );
}
