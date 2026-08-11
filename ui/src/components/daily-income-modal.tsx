import { type FormEvent, useState } from 'react';

import { AppModal } from './app-modal';

type DailyIncomeModalProps = {
    selectedDate: Date;
    onClose: () => void;
};

const formatSelectedDate = (date: Date) =>
    date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

export function DailyIncomeModal({ selectedDate, onClose }: DailyIncomeModalProps) {
    const [tipsEarned, setTipsEarned] = useState('');
    const [hoursWorked, setHoursWorked] = useState('');
    const [totalSales, setTotalSales] = useState('');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onClose();
    };

    return (
        <AppModal
            title="Daily Income"
            description={formatSelectedDate(selectedDate)}
            headerAlign="center"
            showCloseButton={false}
            onClose={onClose}
        >
            <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block text-sm font-semibold text-zinc-700">
                    Tips Earned
                    <div className="relative mt-2">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">
                            $
                        </span>
                        <input
                            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 pl-7 text-sm font-medium text-zinc-950 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                            inputMode="decimal"
                            min="0"
                            name="tipsEarned"
                            step="0.01"
                            type="number"
                            value={tipsEarned}
                            onChange={(event) => setTipsEarned(event.target.value)}
                        />
                    </div>
                </label>

                <label className="block text-sm font-semibold text-zinc-700">
                    Hours Worked
                    <input
                        className="mt-2 h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                        inputMode="decimal"
                        min="0"
                        name="hoursWorked"
                        step="0.01"
                        type="number"
                        value={hoursWorked}
                        onChange={(event) => setHoursWorked(event.target.value)}
                    />
                </label>

                <label className="block text-sm font-semibold text-zinc-700">
                    Total Sales
                    <div className="relative mt-2">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">
                            $
                        </span>
                        <input
                            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 pl-7 text-sm font-medium text-zinc-950 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                            inputMode="decimal"
                            min="0"
                            name="totalSales"
                            step="0.01"
                            type="number"
                            value={totalSales}
                            onChange={(event) => setTotalSales(event.target.value)}
                        />
                    </div>
                </label>

                <div className="rounded-lg border border-teal-700/15 bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-900">
                    Save is UI-only for now. Nothing will be stored or calculated yet.
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-end">
                    <button
                        className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-100 focus:outline-none focus:ring-4 focus:ring-teal-700/10"
                        type="button"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="inline-flex h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-700/15"
                        type="submit"
                    >
                        Save
                    </button>
                </div>
            </form>
        </AppModal>
    );
}
