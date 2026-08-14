import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { HTTPException } from 'hono/http-exception';

import type { DailyTipEntriesResponse, DailyTipEntryResponse, MessageResponse } from '../contracts/types';
import { saveDailyTipEntryValidator } from '../contracts/validators';
import { corsMiddleware, errorHandler, readDatePathParam, readDateRangeQuery } from '../lib/api-helpers';
import { readUserFromCookies } from '../lib/cognito';
import {
    deleteDailyTipEntry,
    getDailyTipEntry,
    listDailyTipEntries,
    saveDailyTipEntry,
} from '../lib/daily-entry-helper';

export const app = new Hono();

app.use('*', corsMiddleware);
app.onError(errorHandler);

const routes = app
    .get('/daily-entries', async (context) => {
        const user = await readUserFromCookies(context);
        const { startDate, endDate } = readDateRangeQuery(context.req.query('startDate'), context.req.query('endDate'));
        const entries = await listDailyTipEntries(user.sub, startDate, endDate);

        return context.json<DailyTipEntriesResponse>({ entries });
    })
    .get('/daily-entry/:date', async (context) => {
        const user = await readUserFromCookies(context);
        const date = readDatePathParam(context.req.param('date'));
        const entry = await getDailyTipEntry(user.sub, date);

        if (!entry) {
            throw new HTTPException(404, { message: 'Daily tip entry not found.' });
        }

        return context.json<DailyTipEntryResponse>({ entry });
    })
    .put('/daily-entry/:date', saveDailyTipEntryValidator, async (context) => {
        const user = await readUserFromCookies(context);
        const date = readDatePathParam(context.req.param('date'));
        const request = context.req.valid('json');
        const entry = await saveDailyTipEntry(user.sub, date, request);

        return context.json<DailyTipEntryResponse>({ entry });
    })
    .delete('/daily-entry/:date', async (context) => {
        const user = await readUserFromCookies(context);
        const date = readDatePathParam(context.req.param('date'));

        await deleteDailyTipEntry(user.sub, date);

        return context.json<MessageResponse>({ message: 'Daily tip entry deleted.' });
    });

export type DailyEntryApp = typeof routes;

export const handler = handle(app);
