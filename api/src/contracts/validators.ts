import { validator } from 'hono/validator';

import type {
    ConfirmForgotPasswordRequest,
    EmailCodeRequest,
    EmailPasswordRequest,
    EmailRequest,
    MessageResponse,
} from './types';

const readStringField = (body: unknown, fieldName: string) => {
    if (!body || typeof body !== 'object' || !(fieldName in body)) return undefined;

    const value = (body as Record<string, unknown>)[fieldName];

    return typeof value === 'string' ? value.trim() : undefined;
};

export const emailPasswordValidator = validator('json', (body, context) => {
    const email = readStringField(body, 'email');
    const password = readStringField(body, 'password');

    if (!email || !password) {
        return context.json<MessageResponse>({ message: 'Email and password are required.' }, 400);
    }

    return { email, password } satisfies EmailPasswordRequest;
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
