export const sanitizeCurrencyAmountInput = (value: string) => {
    const sanitized = value.replace(/[^\d.]/g, '');
    const [dollars = '', ...centParts] = sanitized.split('.');

    if (centParts.length === 0) return dollars;

    return `${dollars}.${centParts.join('').slice(0, 2)}`;
};

export const parseCurrencyAmount = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue || !/^(?:\d+|\d*\.\d{1,2})$/.test(trimmedValue)) return null;

    const amount = Number(trimmedValue);

    return Number.isFinite(amount) && amount >= 0 ? amount : null;
};

export const formatCurrencyAmount = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === '') return '';

    const amount = typeof value === 'number' ? value : parseCurrencyAmount(value);

    return amount === null || !Number.isFinite(amount) ? '' : amount.toFixed(2);
};
