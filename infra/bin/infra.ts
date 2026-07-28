import * as cdk from 'aws-cdk-lib';

import { UIStack } from '../lib/ui-stack.js';

const app = new cdk.App();

const rootDomain = app.node.tryGetContext('rootDomain') ?? process.env.ROOT_DOMAIN ?? 'derek-dev.com';
const siteSubdomain = app.node.tryGetContext('siteSubdomain') ?? process.env.SITE_SUBDOMAIN ?? 'project-template';
const hostedZoneId = String(app.node.tryGetContext('hostedZoneId') ?? process.env.HOSTED_ZONE_ID ?? '').trim();

if (!hostedZoneId) {
    throw new Error('Missing hosted zone configuration. Provide -c hostedZoneId=Z123 or HOSTED_ZONE_ID.');
}

const siteDomain = siteSubdomain.length > 0 ? `${siteSubdomain}.${rootDomain}` : rootDomain;

new UIStack(app, 'UIStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
    },
    rootDomain,
    hostedZoneId,
    siteDomain,
});
