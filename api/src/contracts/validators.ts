import { validator } from 'hono/validator';

import type {
    ConfirmForgotPasswordRequest,
    DefaultViewPreference,
    EmailCodeRequest,
    EmailPasswordRequest,
    EmailRequest,
    MessageResponse,
    SaveDailyTipEntryRequest,
    SignUpRequest,
    ThemePreference,
    UpdateProfileRequest,
} from './types';

const themePreferences = ['light', 'dark', 'system'] as const satisfies readonly ThemePreference[];
const defaultViewPreferences = ['weekly', 'monthly'] as const satisfies readonly DefaultViewPreference[];

const readStringField = (body: unknown, fieldName: string) => {
    if (!body || typeof body !== 'object' || !(fieldName in body)) return undefined;

    const value = (body as Record<string, unknown>)[fieldName];

    return typeof value === 'string' ? value.trim() : undefined;
};

const readFiniteNonNegativeNumberField = (body: unknown, fieldName: string) => {
    if (!body || typeof body !== 'object' || !(fieldName in body)) return undefined;

    const value = (body as Record<string, unknown>)[fieldName];

    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
};

const readEnumField = <Value extends string>(body: unknown, fieldName: string, options: readonly Value[]) => {
    const value = readStringField(body, fieldName);

    return value && options.includes(value as Value) ? (value as Value) : undefined;
};

export const isValidDateOnlyString = (value: unknown): value is string => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const [yearText, monthText, dayText] = value.split('-');
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);

    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
    if (month < 1 || month > 12 || day < 1) return false;

    return (
        new Date(year, month - 1, day).getFullYear() === year &&
        new Date(year, month - 1, day).getMonth() === month - 1 &&
        new Date(year, month - 1, day).getDate() === day
    );
};

export const emailPasswordValidator = validator('json', (body, context) => {
    const email = readStringField(body, 'email');
    const password = readStringField(body, 'password');

    if (!email || !password) {
        return context.json<MessageResponse>({ message: 'Email and password are required.' }, 400);
    }

    return { email, password } satisfies EmailPasswordRequest;
});

export const signUpValidator = validator('json', (body, context) => {
    const email = readStringField(body, 'email');
    const password = readStringField(body, 'password');
    const firstName = readStringField(body, 'firstName');
    const lastName = readStringField(body, 'lastName');
    const hourlyWage = readFiniteNonNegativeNumberField(body, 'hourlyWage');

    if (!email || !password || !firstName || !lastName || hourlyWage === undefined) {
        return context.json<MessageResponse>(
            { message: 'Email, password, first name, last name, and hourly wage are required.' },
            400
        );
    }

    return { email, password, firstName, lastName, hourlyWage } satisfies SignUpRequest;
});

export const updateProfileValidator = validator('json', (body, context) => {
    const firstName = readStringField(body, 'firstName');
    const lastName = readStringField(body, 'lastName');
    const hourlyWage = readFiniteNonNegativeNumberField(body, 'hourlyWage');
    const themePreference = readEnumField(body, 'themePreference', themePreferences);
    const defaultView = readEnumField(body, 'defaultView', defaultViewPreferences);

    if (
        firstName === undefined &&
        lastName === undefined &&
        hourlyWage === undefined &&
        themePreference === undefined &&
        defaultView === undefined
    ) {
        return context.json<MessageResponse>({ message: 'At least one profile field is required.' }, 400);
    }

    return {
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(hourlyWage !== undefined ? { hourlyWage } : {}),
        ...(themePreference !== undefined ? { themePreference } : {}),
        ...(defaultView !== undefined ? { defaultView } : {}),
    } satisfies UpdateProfileRequest;
});

export const emailCodeValidator = validator('json', (body, context) => {
    const email = readStringField(body, 'email');
    const code = readStringField(body, 'code');

    if (!email || !code) {
        return context.json<MessageResponse>({ message: 'Email and verification code are required.' }, 400);
    }

    return { email, code } satisfies EmailCodeRequest;
});

export const confirmForgotPasswordValidator = validator('json', (body, context) => {
    const email = readStringField(body, 'email');
    const code = readStringField(body, 'code');
    const password = readStringField(body, 'password');

    if (!email || !code || !password) {
        return context.json<MessageResponse>({ message: 'Email, verification code, and password are required.' }, 400);
    }

    return { email, code, password } satisfies ConfirmForgotPasswordRequest;
});

export const emailValidator = validator('json', (body, context) => {
    const email = readStringField(body, 'email');

    if (!email) {
        return context.json<MessageResponse>({ message: 'Email is required.' }, 400);
    }

    return { email } satisfies EmailRequest;
});

export const saveDailyTipEntryValidator = validator('json', (body, context) => {
    const tipsEarned = readFiniteNonNegativeNumberField(body, 'tipsEarned');
    const hoursWorked = readFiniteNonNegativeNumberField(body, 'hoursWorked');
    const totalSales = readFiniteNonNegativeNumberField(body, 'totalSales');

    if (tipsEarned === undefined || hoursWorked === undefined || totalSales === undefined) {
        return context.json<MessageResponse>(
            { message: 'Tips earned, hours worked, and total sales must be finite non-negative numbers.' },
            400
        );
    }

    return { tipsEarned, hoursWorked, totalSales } satisfies SaveDailyTipEntryRequest;
});
