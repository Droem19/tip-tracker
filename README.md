# Tip Tracker

Tip Tracker is a React app for tracking tip income, with Cognito-backed login, persisted daily income entries, a typed Hono API, and AWS infrastructure managed with CDK. The API owns auth and stores Cognito tokens in HTTP-only cookies, while the UI uses `/me` to protect authenticated app routes.

## Tech Stack

- TypeScript
- React
- Vite
- Tailwind
- Hono
- AWS CDK
- Biome

## Repo Structure

- `ui` - Vite React app
- `ui/src/pages` - Route-level pages for login, sign-up, forgot password, app, reporting, and not found states
- `ui/src/components` - Shared app shell components, including the authenticated navbar, footer, modals, and summary cards
- `ui/src/auth` - Client-side auth provider and typed API helpers
- `api` - Hono serverless API
- `api/src/lambdas` - Lambda entry points and route wiring
- `api/src/contracts` - API request/response types and validators
- `api/src/lib` - Reusable API helpers, Cognito utilities, and DynamoDB data helpers
- `infra` - CDK app and stacks for hosting the UI, Cognito, HTTP API, and Lambda
- `.github/workflows/deploy.yml` - Production deploy workflow for pushes to `main` and manual dispatches

## Getting Started (Local Development)

- Node.js: `24.12.0`
- pnpm: `10.28.2`
- AWS CLI configured for deployments
- AWS SSO access for the `DRoemhildt19` profile used by the current deploy scripts

## Local Development

Install dependencies from the repo root:

```bash
pnpm install
```

Run the local UI dev server:

```bash
pnpm run local-ui
```

Run the local API dev server:

```bash
pnpm run local-api
```

Run the UI and API together:

```bash
pnpm run local
```

Local defaults:

- UI: `http://localhost:5173`
- API: `http://localhost:8787`
- The UI uses `VITE_API_URL` when set, otherwise it calls the local API URL.

For local development, point the API at a real Cognito user pool before running `pnpm run local-api`. The local API automatically loads `api/.env` when it exists:

```powershell
Copy-Item api/.env.example api/.env
```

Then fill in `USER_POOL_ID`, `USER_POOL_CLIENT_ID`, and `USER_POOL_REGION` in `api/.env`. You can get those values from the CDK outputs after deploying the API stack.

Daily-entry CRUD also needs `DAILY_TIP_ENTRIES_TABLE_NAME` and AWS credentials that can read and write the table. The deployed Lambda receives the table name and IAM permissions from CDK automatically; local development must provide them through your environment.

Running locally still utilizes the deployed DynamoDB table, so you need to be authenticated with:

```powershell
pnpm run sso
```

The API sets HTTP-only cookies for Cognito access, ID, and refresh tokens. The UI does not store auth tokens in `localStorage`.

## Quality Checks

Run all package typechecks:

```bash
pnpm run typecheck
```

Apply Biome fixes:

```bash
pnpm run format
```

Build every package with a build script:

```bash
pnpm run build
```

## API

The auth Hono app lives in `api/src/lambdas/auth.ts` and exposes:

- `GET /health`
- `POST /auth/signup`
- `POST /auth/confirm-signup`
- `POST /auth/resend-code`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/confirm-forgot-password`
- `POST /auth/logout`
- `GET /me`
- `PUT /me`

The daily-entry Hono app lives in `api/src/lambdas/daily-entry.ts` and exposes:

- `GET /daily-entries?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `GET /daily-entry/{date}`
- `PUT /daily-entry/{date}`
- `DELETE /daily-entry/{date}`

Daily entries are keyed by authenticated Cognito user and date. The frontend never sends `userId`; the API derives it from the signed-in user's HTTP-only Cognito cookies. The request body for `PUT /daily-entry/{date}` contains only `tipsEarned`, `hoursWorked`, and `totalSales`.

The UI uses Hono's typed client from `hono/client` for auth calls and shared API response/request types from the `api` workspace package. Authenticated API requests send cookies with each request and retry once through `/auth/refresh` when an authenticated request returns `401`.

The `/app` and `/reporting` UI routes are protected by the auth provider. If `/me` cannot resolve a signed-in user, the user is routed back to `/`.

Authenticated pages use a shared app layout with the navbar, main content area, footer, a Cognito-backed Profile modal, and a placeholder Preferences modal. Persistence for preferences, theme, calendar view, and reminders still needs to be wired up.

This template uses self-signup with a user-chosen password and email verification. It does not use Cognito admin invitations, temporary passwords, or `NEW_PASSWORD_REQUIRED` challenge handling.

## Infrastructure

The CDK app lives in `infra` and defines two stacks:

- `tip-tracker-ui`
- `tip-tracker-api`

CDK context in `infra/cdk.json` controls the hosted domain:

- `rootDomain` - Route53 hosted zone domain
- `hostedZoneId` - Route53 hosted zone ID
- `siteSubdomain` - Subdomain deployed by this template; leave empty to deploy at the root domain

The UI stack deploys the built UI from `ui/dist` to `tip-tracker.derek-dev.com` by default.

The UI stack creates:

- Private S3 bucket for static site assets
- CloudFront distribution with Origin Access Control
- CloudFront proxy behaviors for `/auth/*`, `/daily-entry/*`, `/daily-entries`, `/me`, and `/health` so the deployed UI calls the API through the same site origin
- CloudFront Function SPA routing for extensionless UI paths like `/verify`, without rewriting API error responses
- ACM certificate for the primary domain and `www` domain
- Route53 A and AAAA alias records for both domains
- Bucket deployment with CloudFront invalidation

The API stack creates:

- Cognito user pool
- Cognito user pool client
- HTTP API Gateway
- `tip-tracker-auth` Lambda backed by the Hono API
- `tip-tracker-daily-entry` Lambda backed by the daily-entry Hono API
- DynamoDB table for daily tip entries with `userId` as the partition key and `date` as the sort key
- API Gateway route integrations for auth and daily-entry routes

## Deploying the app

Log in with AWS SSO:

```bash
pnpm run sso
```

Preview the stack:

```bash
pnpm run diff
```

Synthesize the stacks:

```bash
pnpm run synth
```

Deploy the stack:

```bash
pnpm run deploy
```

## GitHub Actions Deploy

The deploy workflow runs on pushes to the `main` branch and can also be started manually from GitHub Actions.

The workflow:

- Installs pnpm and Node.js
- Installs dependencies with `pnpm install --frozen-lockfile`
- Assumes the AWS role from GitHub's `AWS_DEPLOY_ROLE_ARN` secret
- Runs `pnpm run github-action-deploy`
- Deploys to `us-east-1`
