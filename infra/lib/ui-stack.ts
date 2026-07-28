import * as cdk from 'aws-cdk-lib';
import {
    aws_certificatemanager as acm,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_route53 as route53,
    aws_route53_targets as route53Targets,
    aws_s3 as s3,
    aws_s3_deployment as s3deploy,
} from 'aws-cdk-lib';
import type { Construct } from 'constructs';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

type UIStackProps = cdk.StackProps & {
    rootDomain: string;
    hostedZoneId: string;
    siteDomain: string;
};

export class UIStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: UIStackProps) {
        super(scope, id, props);

        if (!cdk.Token.isUnresolved(this.region) && this.region !== 'us-east-1') {
            throw new Error(
                'CloudFront certificates must live in us-east-1. Deploy this stack with CDK_DEFAULT_REGION=us-east-1.'
            );
        }

        const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
            hostedZoneId: props.hostedZoneId,
            zoneName: props.rootDomain,
        });

        const siteBucket = new s3.Bucket(this, 'SiteBucket', {
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            publicReadAccess: false,
            enforceSSL: true,
            versioned: false,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            autoDeleteObjects: false,
        });

        const certificate = new acm.Certificate(this, 'SiteCertificate', {
            domainName: props.siteDomain,
            validation: acm.CertificateValidation.fromDns(hostedZone),
        });

        const distribution = new cloudfront.Distribution(this, 'Distribution', {
            defaultBehavior: {
                origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
            },
            domainNames: [props.siteDomain],
            certificate,
            defaultRootObject: 'index.html',
            errorResponses: [
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: cdk.Duration.minutes(5),
                },
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: cdk.Duration.minutes(5),
                },
            ],
            minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
            enableLogging: true,
        });

        const recordName = props.siteDomain.replace(`.${props.rootDomain}`, '');

        new route53.ARecord(this, 'SiteARecord', {
            zone: hostedZone,
            recordName,
            target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(distribution)),
        });

        new route53.AaaaRecord(this, 'SiteAaaaRecord', {
            zone: hostedZone,
            recordName,
            target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(distribution)),
        });

        const stackSourceDir = path.dirname(fileURLToPath(import.meta.url));
        const uiDistPath = path.resolve(stackSourceDir, '../../ui/dist');

        new s3deploy.BucketDeployment(this, 'DeployWebsite', {
            destinationBucket: siteBucket,
            sources: [s3deploy.Source.asset(uiDistPath)],
            distribution,
            distributionPaths: ['/*'],
            prune: true,
            retainOnDelete: false,
        });

        new cdk.CfnOutput(this, 'SiteDomainOutput', {
            value: `https://${props.siteDomain}`,
            description: 'Static app URL',
        });

        new cdk.CfnOutput(this, 'DistributionIdOutput', {
            value: distribution.distributionId,
            description: 'CloudFront distribution ID',
        });
    }
}
