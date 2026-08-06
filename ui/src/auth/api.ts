import type { AuthApp, AuthResponse, AuthSession, MessageResponse } from 'api';
import { hc } from 'hono/client';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8787';

export const client = hc<AuthApp>(apiUrl);

const throwApiError = async (response: Response) => {
    const fallbackMessage = response.statusText || 'The request failed.';

    try {
        const data = (await response.json()) as Partial<MessageResponse>;

        throw new Error(typeof data.message === 'string' ? data.message : fallbackMessage);
    } catch (error) {
        if (error instanceof Error) throw error;

        throw new Error(fallbackMessage);
    }
};

const parseResponse = async <ResponseBody>(response: Response) => {
    if (!response.ok) {
        await throwApiError(response);
    }

    return response.json() as Promise<ResponseBody>;
};

export const authApi = {
    login: async (email: string, password: string) => {
        const response = await client.auth.login.$post({ json: { email, password } });
        return parseResponse<AuthResponse>(response);
    },
    signUp: async (email: string, password: string) => {
        const response = await client.auth.signup.$post({ json: { email, password } });
        return parseResponse<AuthResponse>(response);
    },
    forgotPassword: async (email: string) => {
        const response = await client.auth['forgot-password'].$post({ json: { email } });
        return parseResponse<MessageResponse>(response);
    },
    logout: async () => {
        const response = await client.auth.logout.$post();
        return parseResponse<MessageResponse>(response);
    },
};

export type { AuthSession };
