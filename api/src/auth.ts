import {
    type AuthenticationResultType,
    CodeDeliveryFailureException,
    CodeMismatchException,
    CognitoIdentityProviderClient,
    ConfirmForgotPasswordCommand,
    ConfirmSignUpCommand,
    ExpiredCodeException,
    ForgotPasswordCommand,
    GlobalSignOutCommand,
    InitiateAuthCommand,
    InvalidParameterException,
    InvalidPasswordException,
    NotAuthorizedException,
    ResendConfirmationCodeCommand,
    SignUpCommand,
    TooManyRequestsException,
    UserNotConfirmedException,
    UserNotFoundException,
    UsernameExistsException,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { getCookie, setCookie } from 'hono/cookie';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { validator } from 'hono/validator';

export const app = new Hono();

type AuthUser = {
    sub: string;
    email: string;
    emailVerified: boolean;
};

type AuthResponse = {
    user: AuthUser;
};

type MeResponse = {
    user: AuthUser;
};

type MessageResponse = {
    message: string;
};

type SignUpResponse = MessageResponse & {
    userConfirmed: boolean;
};

type EmailPasswordRequest = {
    email: string;
    password: string;
};

type EmailCodeRequest = {
    email: string;
    code: string;
};

type ConfirmForgotPasswordRequest = EmailCodeRequest & {
    password: string;
};

type EmailRequest = {
    email: string;
};

type CognitoConfig = {
    userPoolId: string;
    clientId: string;
    region: string;
};

const cookieNames = {
    accessToken: 'access_token',
    idToken: 'id_token',
    refreshToken: 'refresh_token',
} as const;

let cognitoClient: CognitoIdentityProviderClient | null = null;
let cognitoClientRegion: string | null = null;
let accessTokenVerifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;
let idTokenVerifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;
let verifierKey: string | null = null;

const readEnv = (name: string) => {
    const runtime = globalThis as typeof globalThis & {
        process?: { env?: Record<string, string | undefined> };
    };

    return runtime.process?.env?.[name];
};

const getAllowedOrigins = () => {
    const configuredOrigins = readEnv('ALLOWED_ORIGINS') ?? 'http://localhost:5173';

    return configuredOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
};

const getCookieSecure = () => {
    const cookieSecure = readEnv('COOKIE_SECURE');
    if (cookieSecure) return cookieSecure === 'true';

    return Boolean(readEnv('AWS_EXECUTION_ENV'));
};

const getCookieSameSite = () => (getCookieSecure() ? 'None' : 'Lax');

const getCognitoConfig = (): CognitoConfig => {
    const userPoolId = readEnv('USER_POOL_ID');
    const clientId = readEnv('USER_POOL_CLIENT_ID');
    const region = readEnv('USER_POOL_REGION') ?? readEnv('AWS_REGION') ?? readEnv('AWS_DEFAULT_REGION');

    if (!userPoolId || !clientId || !region) {
        throw new HTTPException(500, { message: 'Cognito is not configured.' });
    }

    return { userPoolId, clientId, region };
};

const getCognitoClient = (region: string) => {
    if (!cognitoClient || cognitoClientRegion !== region) {
        cognitoClient = new CognitoIdentityProviderClient({ region });
        cognitoClientRegion = region;
    }

    return cognitoClient;
};

const getVerifier = (config: CognitoConfig, tokenUse: 'access' | 'id') => {
    const nextVerifierKey = `${config.userPoolId}:${config.clientId}`;

    if (verifierKey !== nextVerifierKey) {
        accessTokenVerifier = null;
        idTokenVerifier = null;
        verifierKey = nextVerifierKey;
    }

    if (tokenUse === 'access') {
        accessTokenVerifier ??= CognitoJwtVerifier.create({
            userPoolId: config.userPoolId,
            clientId: config.clientId,
            tokenUse: 'access',
        });

        return accessTokenVerifier;
    }

    idTokenVerifier ??= CognitoJwtVerifier.create({
        userPoolId: config.userPoolId,
        clientId: config.clientId,
        tokenUse: 'id',
    });

    return idTokenVerifier;
};

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

const emailCodeValidator = validator('json', (body, context) => {
    const email = readStringField(body, 'email');
    const code = readStringField(body, 'code');

    if (!email || !code) {
        return context.json<MessageResponse>({ message: 'Email and verification code are required.' }, 400);
    }

    return { email, code } satisfies EmailCodeRequest;
});

const confirmForgotPasswordValidator = validator('json', (body, context) => {
    const email = readStringField(body, 'email');
    const code = readStringField(body, 'code');
    const password = readStringField(body, 'password');

    if (!email || !code || !password) {
        return context.json<MessageResponse>({ message: 'Email, verification code, and password are required.' }, 400);
    }

    return { email, code, password } satisfies ConfirmForgotPasswordRequest;
});

const emailValidator = validator('json', (body, context) => {
    const email = readStringField(body, 'email');

    if (!email) {
        return context.json<MessageResponse>({ message: 'Email is required.' }, 400);
    }

    return { email } satisfies EmailRequest;
});

const setAuthCookie = (context: Parameters<typeof setCookie>[0], name: string, value: string, maxAge: number) => {
    setCookie(context, name, value, {
        httpOnly: true,
        secure: getCookieSecure(),
        sameSite: getCookieSameSite(),
        path: '/',
        maxAge,
    });
};

const clearAuthCookies = (context: Parameters<typeof setCookie>[0]) => {
    for (const name of Object.values(cookieNames)) {
        setAuthCookie(context, name, '', 0);
    }
};

const userFromTokens = async (accessToken: string, idToken: string): Promise<AuthUser> => {
    const config = getCognitoConfig();
    const accessPayload = await getVerifier(config, 'access').verify(accessToken);
    const idPayload = await getVerifier(config, 'id').verify(idToken);
    const email = typeof idPayload.email === 'string' ? idPayload.email : undefined;

    if (!accessPayload.sub || !email) {
        throw new HTTPException(401, { message: 'Unauthorized' });
    }

    return {
        sub: accessPayload.sub,
        email,
        emailVerified: idPayload.email_verified === true || idPayload.email_verified === 'true',
    };
};

const setAuthenticationResultCookies = (
    context: Parameters<typeof setCookie>[0],
    authenticationResult: AuthenticationResultType
) => {
    const { AccessToken, ExpiresIn, IdToken, RefreshToken } = authenticationResult;

    if (!AccessToken || !ExpiresIn || !IdToken) {
        throw new HTTPException(500, { message: 'Authentication failed.' });
    }

    setAuthCookie(context, cookieNames.accessToken, AccessToken, ExpiresIn);
    setAuthCookie(context, cookieNames.idToken, IdToken, ExpiresIn);

    if (RefreshToken) {
        setAuthCookie(context, cookieNames.refreshToken, RefreshToken, 60 * 60 * 24 * 30);
    }

    return userFromTokens(AccessToken, IdToken);
};

const readUserFromCookies = async (context: Parameters<typeof getCookie>[0]) => {
    const accessToken = getCookie(context, cookieNames.accessToken);
    const idToken = getCookie(context, cookieNames.idToken);

    if (!accessToken || !idToken) {
        throw new HTTPException(401, { message: 'Unauthorized' });
    }

    try {
        return await userFromTokens(accessToken, idToken);
    } catch (error) {
        if (error instanceof HTTPException) throw error;

        throw new HTTPException(401, { message: 'Unauthorized' });
    }
};

const friendlyCognitoError = (error: unknown) => {
    if (error instanceof InvalidPasswordException) {
        return new HTTPException(400, { message: error.message || 'Password does not meet the required policy.' });
    }
    if (error instanceof InvalidParameterException) {
        return new HTTPException(400, { message: error.message || 'Invalid request.' });
    }
    if (error instanceof CodeMismatchException) {
        return new HTTPException(400, { message: 'Invalid verification code.' });
    }
    if (error instanceof ExpiredCodeException) {
        return new HTTPException(400, { message: 'Verification code has expired.' });
    }
    if (error instanceof TooManyRequestsException) {
        return new HTTPException(429, { message: 'Too many requests. Please try again later.' });
    }
    if (error instanceof CodeDeliveryFailureException) {
        return new HTTPException(503, { message: 'Unable to send a verification code right now.' });
    }

    return null;
};

app.use(
    '*',
    cors({
        origin: getAllowedOrigins(),
        credentials: true,
        allowHeaders: ['Authorization', 'Content-Type'],
        allowMethods: ['GET', 'POST', 'OPTIONS'],
    })
);

app.onError((error, context) => {
    if (error instanceof HTTPException) {
        return context.json<MessageResponse>({ message: error.message }, error.status);
    }

    console.error(error);
    return context.json<MessageResponse>({ message: 'Internal server error.' }, 500);
});

const routes = app
    .get('/health', (context) => {
        return context.json({ ok: true });
    })
    .post('/auth/signup', emailPasswordValidator, async (context) => {
        const { email, password } = context.req.valid('json');
        const config = getCognitoConfig();
        const client = getCognitoClient(config.region);

        try {
            const response = await client.send(
                new SignUpCommand({
                    ClientId: config.clientId,
                    Username: email,
                    Password: password,
                    UserAttributes: [{ Name: 'email', Value: email }],
                })
            );

            return context.json<SignUpResponse>({
                userConfirmed: response.UserConfirmed ?? false,
                message: response.UserConfirmed
                    ? 'Account created. You can sign in now.'
                    : 'Account created. Check your email for a verification code.',
            });
        } catch (error) {
            if (error instanceof UsernameExistsException) {
                throw new HTTPException(409, { message: 'An account with this email already exists.' });
            }

            throw friendlyCognitoError(error) ?? error;
        }
    })
    .post('/auth/confirm-signup', emailCodeValidator, async (context) => {
        const { email, code } = context.req.valid('json');
        const config = getCognitoConfig();
        const client = getCognitoClient(config.region);

        try {
            await client.send(
                new ConfirmSignUpCommand({
                    ClientId: config.clientId,
                    Username: email,
                    ConfirmationCode: code,
                })
            );

            return context.json<MessageResponse>({ message: 'Account verified. You can sign in now.' });
        } catch (error) {
            if (error instanceof UserNotFoundException) {
                throw new HTTPException(404, { message: 'User not found.' });
            }

            throw friendlyCognitoError(error) ?? error;
        }
    })
    .post('/auth/resend-code', emailValidator, async (context) => {
        const { email } = context.req.valid('json');
        const config = getCognitoConfig();
        const client = getCognitoClient(config.region);

        try {
            await client.send(
                new ResendConfirmationCodeCommand({
                    ClientId: config.clientId,
                    Username: email,
                })
            );

            return context.json<MessageResponse>({ message: 'Verification code sent.' });
        } catch (error) {
            if (error instanceof UserNotFoundException) {
                throw new HTTPException(404, { message: 'User not found.' });
            }

            throw friendlyCognitoError(error) ?? error;
        }
    })
    .post('/auth/login', emailPasswordValidator, async (context) => {
        const { email, password } = context.req.valid('json');
        const config = getCognitoConfig();
        const client = getCognitoClient(config.region);

        try {
            const result = await client.send(
                new InitiateAuthCommand({
                    AuthFlow: 'USER_PASSWORD_AUTH',
                    ClientId: config.clientId,
                    AuthParameters: {
                        USERNAME: email,
                        PASSWORD: password,
                    },
                })
            );

            if (result.ChallengeName) {
                throw new HTTPException(400, {
                    message: `Unsupported authentication challenge: ${result.ChallengeName}.`,
                });
            }

            if (!result.AuthenticationResult) {
                throw new HTTPException(500, { message: 'Authentication failed.' });
            }

            const user = await setAuthenticationResultCookies(context, result.AuthenticationResult);

            return context.json<AuthResponse>({ user });
        } catch (error) {
            if (error instanceof HTTPException) throw error;
            if (error instanceof NotAuthorizedException || error instanceof UserNotFoundException) {
                throw new HTTPException(401, { message: 'Invalid email or password.' });
            }
            if (error instanceof UserNotConfirmedException) {
                throw new HTTPException(403, { message: 'Please verify your email before signing in.' });
            }

            throw friendlyCognitoError(error) ?? error;
        }
    })
    .post('/auth/refresh', async (context) => {
        const refreshToken = getCookie(context, cookieNames.refreshToken);

        if (!refreshToken) {
            throw new HTTPException(401, { message: 'Unauthorized' });
        }

        const config = getCognitoConfig();
        const client = getCognitoClient(config.region);

        try {
            const result = await client.send(
                new InitiateAuthCommand({
                    AuthFlow: 'REFRESH_TOKEN_AUTH',
                    ClientId: config.clientId,
                    AuthParameters: {
                        REFRESH_TOKEN: refreshToken,
                    },
                })
            );

            if (!result.AuthenticationResult) {
                throw new HTTPException(500, { message: 'Refresh failed.' });
            }

            const user = await setAuthenticationResultCookies(context, result.AuthenticationResult);

            return context.json<AuthResponse>({ user });
        } catch (error) {
            if (error instanceof HTTPException) throw error;
            if (error instanceof NotAuthorizedException) {
                clearAuthCookies(context);
                throw new HTTPException(401, { message: 'Unauthorized' });
            }

            throw friendlyCognitoError(error) ?? error;
        }
    })
    .post('/auth/forgot-password', emailValidator, async (context) => {
        const { email } = context.req.valid('json');
        const config = getCognitoConfig();
        const client = getCognitoClient(config.region);

        try {
            await client.send(
                new ForgotPasswordCommand({
                    ClientId: config.clientId,
                    Username: email,
                })
            );
        } catch (error) {
            if (!(error instanceof UserNotFoundException)) {
                throw friendlyCognitoError(error) ?? error;
            }
        }

        return context.json<MessageResponse>({ message: 'If the account exists, a password reset code was sent.' });
    })
    .post('/auth/confirm-forgot-password', confirmForgotPasswordValidator, async (context) => {
        const { email, code, password } = context.req.valid('json');
        const config = getCognitoConfig();
        const client = getCognitoClient(config.region);

        try {
            await client.send(
                new ConfirmForgotPasswordCommand({
                    ClientId: config.clientId,
                    Username: email,
                    ConfirmationCode: code,
                    Password: password,
                })
            );

            return context.json<MessageResponse>({ message: 'Password updated. You can sign in now.' });
        } catch (error) {
            if (error instanceof UserNotFoundException) {
                throw new HTTPException(404, { message: 'User not found.' });
            }

            throw friendlyCognitoError(error) ?? error;
        }
    })
    .post('/auth/logout', async (context) => {
        const accessToken = getCookie(context, cookieNames.accessToken);

        if (accessToken) {
            const config = getCognitoConfig();
            const client = getCognitoClient(config.region);

            try {
                await client.send(new GlobalSignOutCommand({ AccessToken: accessToken }));
            } catch {
                // Always clear local cookies even if the token is already expired or revoked.
            }
        }

        clearAuthCookies(context);

        return context.json<MessageResponse>({ message: 'Signed out.' });
    })
    .get('/me', async (context) => {
        const user = await readUserFromCookies(context);

        return context.json<MeResponse>({ user });
    });

export type AuthApp = typeof routes;
export type {
    AuthResponse,
    AuthUser,
    ConfirmForgotPasswordRequest,
    EmailCodeRequest,
    EmailPasswordRequest,
    EmailRequest,
    MeResponse,
    MessageResponse,
    SignUpResponse,
};

export const handler = handle(app);
