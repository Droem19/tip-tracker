# Project Template

Bare bones starter for a static React site deployed to AWS with CDK. The UI intentionally starts minimal: a Vite React app with Tailwind CSS and a basic not-found fallback.

## Tech Stack

- TypeScript
- React
- Vite
- Tailwind
- AWS CDK
- Biome

## Repo Structure

- `ui` - Vite React app
- `ui/src/pages` - Route-level pages for home, projects, and not found states
- `infra` - CDK app and stack for static website hosting
- `.github/workflows/deploy.yml` - Production deploy workflow for pushes to `main` and manual dispatches

## Getting Started (Local Development)

- Node.js: `24.12.0`
- pnpm: `10.28.2`
- AWS CLI configured for deployments
- AWS SSO access for the `DRoemhildt19` profile

## Local Development

Install dependencies from the repo root:

```bash
pnpm install
```

Run the local UI dev server:

```bash
pnpm run local-ui
```

## Infrastructure

The CDK app lives in `infra` and defines the `project-template-ui` stack. It deploys the built UI from `ui/dist` to `project-template.derek-dev.com` by default.

The stack creates:

- Private S3 bucket for static site assets
- CloudFront distribution with Origin Access Control
- ACM certificate for the primary domain and `www` domain
- Route53 A and AAAA alias records for both domains
- SPA fallback responses that serve `index.html` for CloudFront 403 and 404 responses
- Bucket deployment with CloudFront invalidation

## Deploying the app

Log in with AWS SSO:

```bash
pnpm run sso
```

Preview the stack:

```bash
pnpm run diff
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
- Assumes the AWS role from Github's `AWS_DEPLOY_ROLE_ARN` secret
- Runs `pnpm run github-action-deploy`
- Deploys to `us-east-1`

## Copying for a New Project
After copying the template, update:

- Root `package.json` name
- `siteSubdomain` name in `infra/cdk.json`
- `infra/bin/infra.ts` stack ID and stack name
- `ui/index.html` page title
- `ui/src/pages/home.tsx` starter page copy
- GitHub repository secret `AWS_DEPLOY_ROLE_ARN`
- AWS IAM GitHub Actions deploy role trust policy for the new repo

### GitHub OIDC Setup
Each copied repo needs access to the AWS deploy role used by GitHub Actions.

1. Add a repository secret in GitHub:

	- Name: `AWS_DEPLOY_ROLE_ARN`
	- Value: the ARN of the IAM role GitHub Actions should assume

2. Update that IAM role's trust policy to allow the new repo on `main`:

	```json
	"token.actions.githubusercontent.com:sub": [
		"repo:Droem19/derek-dev-website:ref:refs/heads/main",
		"repo:Droem19/project-template:ref:refs/heads/main"
	]
	```

	Replace `Droem19/project-template` with the copied repo name.
