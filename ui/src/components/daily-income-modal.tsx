import { type FormEvent, useCallback, useEffect, useState } from 'react';

import { AppModal } from './app-modal';
import type { DailyTipEntry, SaveDailyTipEntryRequest } from '../auth/api';

type DailyIncomeModalProps = {
    entry?: DailyTipEntry;
    selectedDate: Date;
    onClose: () => void;
    onDelete: () => Promise<void>;
    onSave: (request: SaveDailyTipEntryRequest) => Promise<void>;
};

const formatSelectedDate = (date: Date) =>
    date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

const formatDeleteDate = (date: Date) =>
    date.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

const formatInitialNumber = (value: number | undefined) => (value === undefined ? '' : value.toString());

const parseFormNumber = (value: string) => {
    if (!value.trim()) return null;

    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : null;
};

export function DailyIncomeModal({ entry, selectedDate, onClose, onDelete, onSave }: DailyIncomeModalProps) {
    const [tipsEarned, setTipsEarned] = useState(() => formatInitialNumber(entry?.tipsEarned));
    const [hoursWorked, setHoursWorked] = useState(() => formatInitialNumber(entry?.hoursWorked));
    const [totalSales, setTotalSales] = useState(() => formatInitialNumber(entry?.totalSales));
    const [error, setError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleClose = useCallback(() => {
        if (!isSaving && !isDeleting) onClose();
    }, [isDeleting, isSaving, onClose]);

    useEffect(() => {
        setTipsEarned(formatInitialNumber(entry?.tipsEarned));
        setHoursWorked(formatInitialNumber(entry?.hoursWorked));
        setTotalSales(formatInitialNumber(entry?.totalSales));
        setError(null);
        setDeleteError(null);
        setIsConfirmingDelete(false);
    }, [entry]);

    const handleDelete = async () => {
        setDeleteError(null);
        setIsDeleting(true);

        try {
            await onDelete();
            setIsDeleting(false);
            setIsConfirmingDelete(false);
            onClose();
        } catch (requestError) {
            setDeleteError(requestError instanceof Error ? requestError.message : 'Unable to delete daily income.');
            setIsDeleting(false);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const parsedTipsEarned = parseFormNumber(tipsEarned);
        const parsedHoursWorked = parseFormNumber(hoursWorked);
        const parsedTotalSales = parseFormNumber(totalSales);

        if (parsedTipsEarned === null || parsedHoursWorked === null || parsedTotalSales === null) {
            setError('Enter non-negative numbers for tips earned, hours worked, and total sales.');
            return;
        }

        setError(null);
        setIsSaving(true);

        try {
            await onSave({
                tipsEarned: parsedTipsEarned,
                hoursWorked: parsedHoursWorked,
                totalSales: parsedTotalSales,
            });
            setIsSaving(false);
            onClose();
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to save daily income.');
            setIsSaving(false);
        }
    };

    return (
        <AppModal
            title="Daily Income"
            description={formatSelectedDate(selectedDate)}
            headerAlign="center"
            showCloseButton={false}
            onClose={handleClose}
        >
            <form className="space-y-5" onSubmit={handleSubmit}>
                {isConfirmingDelete ? (
                    <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-950">
                        <div>
                            <h3 className="text-base font-semibold">Delete this entry?</h3>
                            <p className="mt-2 leading-6">
                                This will permanently remove the saved income entry for{' '}
                                <span className="font-semibold">{formatDeleteDate(selectedDate)}</span>.
                            </p>
                        </div>

                        {deleteError ? <p className="font-medium text-red-700">{deleteError}</p> : null}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                className="inline-flex h-10 items-center justify-center rounded-md border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-700/10 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={isDeleting}
                                type="button"
                                onClick={() => setIsConfirmingDelete(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="inline-flex h-10 items-center justify-center rounded-md bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-700/15 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={isDeleting}
                                type="button"
                                onClick={handleDelete}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
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
                                    disabled={isSaving}
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
                                disabled={isSaving}
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
                                    disabled={isSaving}
                                    onChange={(event) => setTotalSales(event.target.value)}
                                />
                            </div>
                        </label>

                        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

                        {entry ? (
                            <div className="border-t border-zinc-200 pt-5">
                                <button
                                    className="inline-flex h-10 items-center justify-center rounded-md border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-700/10 disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled={isSaving || isDeleting}
                                    type="button"
                                    onClick={() => {
                                        setDeleteError(null);
                                        setIsConfirmingDelete(true);
                                    }}
                                >
                                    Delete Entry
                                </button>
                            </div>
                        ) : null}

                        <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-end">
                            <button
                                className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-100 focus:outline-none focus:ring-4 focus:ring-teal-700/10 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={isSaving}
                                type="button"
                                onClick={handleClose}
                            >
                                Cancel
                            </button>
                            <button
                                className="inline-flex h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-700/15 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={isSaving}
                                type="submit"
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </>
                )}
            </form>
        </AppModal>
    );
}
