import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
}

const { app: authApp } = await import('./lambdas/auth.js');
const { app: dailyEntryApp } = await import('./lambdas/daily-entry.js');
const app = new Hono();

app.route('/', dailyEntryApp);
app.route('/', authApp);

const port = Number.parseInt(process.env.PORT ?? '8787', 10);

serve({
    fetch: app.fetch,
    port,
});

console.log(`API listening on http://localhost:${port}`);
