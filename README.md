# Project Template

Barebones starter for a static React site deployed to AWS with CDK. The UI intentionally starts minimal: a Vite React app with Tailwind CSS and a basic not-found route.

## Tech Stack
- TypeScript
- React
- React Router
- Vite
- Tailwind CSS
- AWS CDK
- Biome

## Structure
- `ui` - Vite React app
- `infra` - CDK stack for S3, CloudFront, ACM, Route53, and static asset deployment

## Prerequisites
- Node.js: `24.12.0`
- pnpm: `10.28.2`
- AWS CLI configured for the target account
- CDK bootstrap completed in `us-east-1`

## Getting Started
Install dependencies from the repo root:

```bash
pnpm install
```

Run the local UI:

```bash
pnpm run local-ui
```

## Common Commands
```bash
pnpm run check        # format, lint, and organize imports
pnpm run check:ci     # verify formatting/linting without writing changes
pnpm run typecheck    # typecheck all workspace packages
pnpm run build        # build all workspace packages that define a build script
```

## Copying for a New Project
After copying the template, update:

- Root `package.json` name and `@project-template/*` package filters
- `ui/package.json` and `infra/package.json` package names
- `infra/cdk.json` `siteSubdomain`
- `infra/bin/infra.ts` fallback `siteSubdomain`
- `ui/index.html` page title
- `ui/src/pages/home.tsx` starter page copy

## Deploy
The CDK stack deploys the built UI from `ui/dist` to `project-template.derek-dev.com` by default.

Sign in with AWS SSO:

```bash
pnpm sso
```

Review the synthesized stack:

```bash
pnpm run synth
```

Review infrastructure changes:

```bash
pnpm run diff
```

Deploy:

```bash
pnpm run deploy
```

The deploy scripts build the UI before running CDK so `ui/dist` exists for the bucket deployment asset.

## GitHub Actions Deploy
The workflow at `.github/workflows/deploy.yml` deploys on pushes to `main` and can also be run manually.

The workflow installs dependencies with `pnpm install --frozen-lockfile`, then runs `pnpm run github-action-deploy`. Commit `pnpm-lock.yaml` after dependency changes so CI can install reproducibly.
