import * as cdk from 'aws-cdk-lib';
import {
    aws_apigatewayv2 as apigatewayv2,
    aws_cognito as cognito,
    aws_dynamodb as dynamodb,
    aws_lambda as lambda,
    aws_lambda_nodejs as lambdaNodejs,
} from 'aws-cdk-lib';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import type { Construct } from 'constructs';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

type APIStackProps = cdk.StackProps & {
    siteDomain: string;
};

export class APIStack extends cdk.Stack {
    public readonly api: apigatewayv2.HttpApi;
    public readonly dailyTipEntriesTable: dynamodb.Table;

    constructor(scope: Construct, id: string, props: APIStackProps) {
        super(scope, id, props);

        const userPool = new cognito.UserPool(this, 'UserPool', {
            userPoolName: 'tip-tracker-user-pool',
            signInAliases: {
                email: true,
                username: false,
            },
            signInCaseSensitive: false,
            selfSignUpEnabled: true,
            autoVerify: {
                email: true,
            },
            standardAttributes: {
                email: {
                    required: true,
                    mutable: false,
                },
                givenName: {
                    required: false,
                    mutable: true,
                },
                familyName: {
                    required: false,
                    mutable: true,
                },
            },
            customAttributes: {
                hourlyWage: new cognito.NumberAttribute({ mutable: true, min: 0 }),
            },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: true,
                tempPasswordValidity: cdk.Duration.days(7),
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
            mfa: cognito.Mfa.OFF,
            mfaSecondFactor: { sms: false, otp: true },
            email: cognito.UserPoolEmail.withCognito(),
            userVerification: {
                emailSubject: 'Verify your tip-tracker account',
                emailBody: [
                    'Your tip-tracker verification code is {####}',
                    'Enter this code in the app to verify your account.',
                ].join('\n\n'),
                emailStyle: cognito.VerificationEmailStyle.CODE,
            },
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            deletionProtection: true,
            standardThreatProtectionMode: cognito.StandardThreatProtectionMode.NO_ENFORCEMENT,
        });

        const userPoolClient = userPool.addClient('WebAppClient', {
            userPoolClientName: 'tip-tracker-web-app',
            generateSecret: false,
            authFlows: {
                userPassword: true,
                userSrp: true,
            },
            accessTokenValidity: cdk.Duration.hours(1),
            idTokenValidity: cdk.Duration.hours(1),
            refreshTokenValidity: cdk.Duration.days(30),
            enableTokenRevocation: true,
            preventUserExistenceErrors: true,
            readAttributes: new cognito.ClientAttributes()
                .withStandardAttributes({
                    email: true,
                    emailVerified: true,
                    givenName: true,
                    familyName: true,
                })
                .withCustomAttributes('hourlyWage'),
            writeAttributes: new cognito.ClientAttributes()
                .withStandardAttributes({
                    email: true,
                    givenName: true,
                    familyName: true,
                })
                .withCustomAttributes('hourlyWage'),
        });

        this.dailyTipEntriesTable = new dynamodb.Table(this, 'DailyTipEntries', {
            partitionKey: {
                name: 'userId',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'date',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            pointInTimeRecoverySpecification: {
                pointInTimeRecoveryEnabled: true,
            },
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });

        const stackSourceDir = path.dirname(fileURLToPath(import.meta.url));
        const authLambdaEntry = path.resolve(stackSourceDir, '../../api/src/lambdas/auth.ts');
        const dailyEntryLambdaEntry = path.resolve(stackSourceDir, '../../api/src/lambdas/daily-entry.ts');

        const authLambda = new lambdaNodejs.NodejsFunction(this, 'AuthLambda', {
            functionName: 'tip-tracker-auth',
            entry: authLambdaEntry,
            handler: 'handler',
            runtime: lambda.Runtime.NODEJS_22_X,
            architecture: lambda.Architecture.ARM_64,
            memorySize: 512,
            timeout: cdk.Duration.seconds(10),
            environment: {
                ALLOWED_ORIGINS: [
                    `https://${props.siteDomain}`,
                    `https://www.${props.siteDomain}`,
                    'http://localhost:5173',
                ].join(','),
                USER_POOL_ID: userPool.userPoolId,
                USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
                USER_POOL_REGION: this.region,
            },
        });

        const dailyEntryLambda = new lambdaNodejs.NodejsFunction(this, 'DailyEntryLambda', {
            functionName: 'tip-tracker-daily-entry',
            entry: dailyEntryLambdaEntry,
            handler: 'handler',
            runtime: lambda.Runtime.NODEJS_22_X,
            architecture: lambda.Architecture.ARM_64,
            memorySize: 512,
            timeout: cdk.Duration.seconds(10),
            environment: {
                ALLOWED_ORIGINS: [
                    `https://${props.siteDomain}`,
                    `https://www.${props.siteDomain}`,
                    'http://localhost:5173',
                ].join(','),
                USER_POOL_ID: userPool.userPoolId,
                USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
                USER_POOL_REGION: this.region,
                DAILY_TIP_ENTRIES_TABLE_NAME: this.dailyTipEntriesTable.tableName,
            },
        });

        this.dailyTipEntriesTable.grantReadWriteData(dailyEntryLambda);

        this.api = new apigatewayv2.HttpApi(this, 'AuthApi', {
            apiName: 'tip-tracker-api',
            corsPreflight: {
                allowHeaders: ['Authorization', 'Content-Type'],
                allowMethods: [
                    apigatewayv2.CorsHttpMethod.DELETE,
                    apigatewayv2.CorsHttpMethod.GET,
                    apigatewayv2.CorsHttpMethod.OPTIONS,
                    apigatewayv2.CorsHttpMethod.POST,
                    apigatewayv2.CorsHttpMethod.PUT,
                ],
                allowOrigins: [
                    `https://${props.siteDomain}`,
                    `https://www.${props.siteDomain}`,
                    'http://localhost:5173',
                ],
                allowCredentials: true,
                maxAge: cdk.Duration.days(1),
            },
        });

        const authLambdaIntegration = new HttpLambdaIntegration('AuthLambdaIntegration', authLambda);
        const dailyEntryLambdaIntegration = new HttpLambdaIntegration('DailyEntryLambdaIntegration', dailyEntryLambda);

        this.api.addRoutes({
            path: '/{proxy+}',
            methods: [apigatewayv2.HttpMethod.ANY],
            integration: authLambdaIntegration,
        });

        this.api.addRoutes({
            path: '/daily-entry/{date}',
            methods: [apigatewayv2.HttpMethod.GET, apigatewayv2.HttpMethod.PUT, apigatewayv2.HttpMethod.DELETE],
            integration: dailyEntryLambdaIntegration,
        });

        this.api.addRoutes({
            path: '/daily-entries',
            methods: [apigatewayv2.HttpMethod.GET],
            integration: dailyEntryLambdaIntegration,
        });

        new cdk.CfnOutput(this, 'AuthApiUrlOutput', {
            value: this.api.apiEndpoint,
            description: 'Auth API URL',
        });

        new cdk.CfnOutput(this, 'UserPoolIdOutput', {
            value: userPool.userPoolId,
            description: 'Cognito user pool ID',
        });

        new cdk.CfnOutput(this, 'UserPoolClientIdOutput', {
            value: userPoolClient.userPoolClientId,
            description: 'Cognito web app client ID',
        });
    }
}
