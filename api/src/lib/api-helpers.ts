import type { Context } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';

import type { MessageResponse } from '../contracts/types';
import { isValidDateOnlyString } from '../contracts/validators';

export const readEnv = (name: string) => {
    const runtime = globalThis as typeof globalThis & {
        process?: { env?: Record<string, string | undefined> };
    };

    return runtime.process?.env?.[name];
};

export const getAllowedOrigins = () => {
    const configuredOrigins = readEnv('ALLOWED_ORIGINS') ?? 'http://localhost:5173';

    return configuredOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
};

export const corsMiddleware = cors({
    origin: getAllowedOrigins(),
    credentials: true,
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

export const readDatePathParam = (date: string | undefined) => {
    if (!isValidDateOnlyString(date)) {
        throw new HTTPException(400, { message: 'Date must be a valid YYYY-MM-DD calendar date.' });
    }

    return date;
};

export const readDateRangeQuery = (startDate: string | undefined, endDate: string | undefined) => {
    if (!isValidDateOnlyString(startDate) || !isValidDateOnlyString(endDate)) {
        throw new HTTPException(400, { message: 'startDate and endDate must be valid YYYY-MM-DD calendar dates.' });
    }

    if (startDate > endDate) {
        throw new HTTPException(400, { message: 'startDate must be before or equal to endDate.' });
    }

    return { startDate, endDate };
};

export const errorHandler = (error: Error, context: Context) => {
    if (error instanceof HTTPException) {
        return context.json<MessageResponse>({ message: error.message }, error.status);
    }

    console.error(error);
    return context.json<MessageResponse>({ message: 'Internal server error.' }, 500);
};
