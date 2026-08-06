import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { cors } from 'hono/cors';
import { validator } from 'hono/validator';

export const app = new Hono();

type AuthSession = {
    email: string;
    displayName: string;
    accessToken: string;
};

type AuthResponse = {
    session: AuthSession;
};

type MessageResponse = {
    message: string;
};

type EmailPasswordRequest = {
    email: string;
    password: string;
};

type EmailRequest = {
    email: string;
};

const localSessionFor = (email: string): AuthSession => ({
    email,
    displayName: email.split('@')[0] ?? email,
    accessToken: `local-dev-token:${email}`,
});

const readStringField = (body: unknown, fieldName: string) => {
    if (!body || typeof body !== 'object' || !(fieldName in body)) return undefined;

    const value = (body as Record<string, unknown>)[fieldName];

    return typeof value === 'string' ? value.trim() : undefined;
};

const emailPasswordValidator = validator('json', (body, context) => {
    const email = readStringField(body, 'email');
    const password = readStringField(body, 'password');

    if (!email || !password) {
        return context.json<MessageResponse>({ message: 'Email and password are required.' }, 400);
    }

    return { email, password } satisfies EmailPasswordRequest;
});

const emailValidator = validator('json', (body, context) => {
    const email = readStringField(body, 'email');

    if (!email) {
        return context.json<MessageResponse>({ message: 'Email is required.' }, 400);
    }

    return { email } satisfies EmailRequest;
});

app.use(
    '*',
    cors({
        origin: ['http://localhost:5173'],
        allowHeaders: ['Authorization', 'Content-Type'],
        allowMethods: ['GET', 'POST', 'OPTIONS'],
    })
);

const routes = app
    .get('/health', (context) => {
        return context.json({ ok: true });
    })
    .post('/auth/login', emailPasswordValidator, (context) => {
        const { email } = context.req.valid('json');

        return context.json<AuthResponse>({ session: localSessionFor(email) });
    })
    .post('/auth/signup', emailPasswordValidator, (context) => {
        const { email } = context.req.valid('json');

        return context.json<AuthResponse>({ session: localSessionFor(email) });
    })
    .post('/auth/forgot-password', emailValidator, (context) => {
        return context.json<MessageResponse>({ message: 'Password reset request accepted.' });
    })
    .post('/auth/logout', (context) => {
        return context.json<MessageResponse>({ message: 'Signed out.' });
    })
    .get('/me', (context) => {
        return context.json({ message: 'Authenticated user endpoint is ready.' });
    });

export type AuthApp = typeof routes;
export type { AuthResponse, AuthSession, EmailPasswordRequest, EmailRequest, MessageResponse };

export const handler = handle(app);
