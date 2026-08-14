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
