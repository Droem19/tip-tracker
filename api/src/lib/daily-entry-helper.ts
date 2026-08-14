import {
    type AttributeValue,
    DeleteItemCommand,
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { HTTPException } from 'hono/http-exception';

import { readEnv } from './api-helpers';
import type { DailyTipEntry, SaveDailyTipEntryRequest } from '../contracts/types';

type DailyTipEntryRecord = DailyTipEntry & {
    userId: string;
};

let dynamoDbClient: DynamoDBClient | null = null;

const getDynamoDbClient = () => {
    dynamoDbClient ??= new DynamoDBClient({});

    return dynamoDbClient;
};

const getDailyTipEntriesTableName = () => {
    const tableName = readEnv('DAILY_TIP_ENTRIES_TABLE_NAME');

    if (!tableName) {
        throw new HTTPException(500, { message: 'Daily tip entries table is not configured.' });
    }

    return tableName;
};

const toPublicEntry = (entry: DailyTipEntryRecord): DailyTipEntry => ({
    date: entry.date,
    tipsEarned: entry.tipsEarned,
    hoursWorked: entry.hoursWorked,
    totalSales: entry.totalSales,
});

const numberAttribute = (value: number) => ({ N: value.toString() });

const readStringAttribute = (item: Record<string, AttributeValue>, fieldName: string) => {
    const value = item[fieldName]?.S;

    if (typeof value !== 'string') {
        throw new Error(`Daily tip entry is missing string field: ${fieldName}`);
    }

    return value;
};

const readNumberAttribute = (item: Record<string, AttributeValue>, fieldName: string) => {
    const value = Number(item[fieldName]?.N);

    if (!Number.isFinite(value)) {
        throw new Error(`Daily tip entry is missing numeric field: ${fieldName}`);
    }

    return value;
};

const fromItem = (item: Record<string, AttributeValue>): DailyTipEntryRecord => ({
    userId: readStringAttribute(item, 'userId'),
    date: readStringAttribute(item, 'date'),
    tipsEarned: readNumberAttribute(item, 'tipsEarned'),
    hoursWorked: readNumberAttribute(item, 'hoursWorked'),
    totalSales: readNumberAttribute(item, 'totalSales'),
});

export const saveDailyTipEntry = async (userId: string, date: string, request: SaveDailyTipEntryRequest) => {
    const entry: DailyTipEntryRecord = { userId, date, ...request };

    await getDynamoDbClient().send(
        new PutItemCommand({
            TableName: getDailyTipEntriesTableName(),
            Item: {
                userId: { S: entry.userId },
                date: { S: entry.date },
                tipsEarned: numberAttribute(entry.tipsEarned),
                hoursWorked: numberAttribute(entry.hoursWorked),
                totalSales: numberAttribute(entry.totalSales),
            },
        })
    );

    return toPublicEntry(entry);
};

export const getDailyTipEntry = async (userId: string, date: string) => {
    const response = await getDynamoDbClient().send(
        new GetItemCommand({
            TableName: getDailyTipEntriesTableName(),
            Key: {
                userId: { S: userId },
                date: { S: date },
            },
        })
    );

    return response.Item ? toPublicEntry(fromItem(response.Item)) : null;
};

export const deleteDailyTipEntry = async (userId: string, date: string) => {
    await getDynamoDbClient().send(
        new DeleteItemCommand({
            TableName: getDailyTipEntriesTableName(),
            Key: {
                userId: { S: userId },
                date: { S: date },
            },
        })
    );
};

export const listDailyTipEntries = async (userId: string, startDate: string, endDate: string) => {
    const response = await getDynamoDbClient().send(
        new QueryCommand({
            TableName: getDailyTipEntriesTableName(),
            KeyConditionExpression: 'userId = :userId AND #date BETWEEN :startDate AND :endDate',
            ExpressionAttributeNames: {
                '#date': 'date',
            },
            ExpressionAttributeValues: {
                ':userId': { S: userId },
                ':startDate': { S: startDate },
                ':endDate': { S: endDate },
            },
        })
    );

    return (response.Items ?? []).map((item) => toPublicEntry(fromItem(item)));
};
