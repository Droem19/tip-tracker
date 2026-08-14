export type AuthUser = {
    sub: string;
    email: string;
    emailVerified: boolean;
    name?: string;
    givenName?: string;
};

export type AuthResponse = {
    user: AuthUser;
};

export type MeResponse = {
    user: AuthUser;
};

export type MessageResponse = {
    message: string;
};

export type SignUpResponse = MessageResponse & {
    userConfirmed: boolean;
};

export type DailyTipEntry = {
    date: string;
    tipsEarned: number;
    hoursWorked: number;
    totalSales: number;
};

export type SaveDailyTipEntryRequest = {
    tipsEarned: number;
    hoursWorked: number;
    totalSales: number;
};

export type DailyTipEntryResponse = {
    entry: DailyTipEntry;
};

export type DailyTipEntriesResponse = {
    entries: DailyTipEntry[];
};

export type EmailPasswordRequest = {
    email: string;
    password: string;
};

export type EmailCodeRequest = {
    email: string;
    code: string;
};

export type ConfirmForgotPasswordRequest = EmailCodeRequest & {
    password: string;
};

export type EmailRequest = {
    email: string;
};

export type CognitoConfig = {
    userPoolId: string;
    clientId: string;
    region: string;
};
