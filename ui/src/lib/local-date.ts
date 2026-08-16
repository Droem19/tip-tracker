const padDatePart = (value: number) => value.toString().padStart(2, '0');

export const formatLocalDateKey = (date: Date) =>
    [date.getFullYear(), padDatePart(date.getMonth() + 1), padDatePart(date.getDate())].join('-');

export const getMonthDateRange = (displayedMonth: Date) => {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();

    return {
        startDate: formatLocalDateKey(new Date(year, month, 1)),
        endDate: formatLocalDateKey(new Date(year, month + 1, 0)),
    };
};

export const getStartOfWeek = (date: Date) => {
    const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    return weekStart;
};

export const getWeekDateRange = (date: Date) => {
    const startOfWeek = getStartOfWeek(date);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return {
        startDate: formatLocalDateKey(startOfWeek),
        endDate: formatLocalDateKey(endOfWeek),
    };
};
