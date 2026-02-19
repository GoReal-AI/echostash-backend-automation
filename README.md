# Echostash Backend Automation

API automation tests for the Echostash backend using **Vitest** and **TypeScript**.

## Project Structure

```
├── .github/workflows/   # CI/CD pipelines (sanity + regression)
├── src/
│   ├── config/          # Environment configuration
│   ├── clients/         # API client wrappers
│   ├── helpers/         # Auth and utility helpers
│   ├── fixtures/        # Test data factories
│   └── utils/           # Shared utilities
├── tests/
│   ├── sanity/          # Quick smoke/sanity tests
│   └── regression/      # Full regression suite
├── vitest.config.ts     # Vitest configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## Prerequisites

- Node.js 20+
- npm

## Local Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your local configuration
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run sanity tests only

```bash
npm run test:sanity
```

### Run regression tests only

```bash
npm run test:regression
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run with specific environment

```bash
ENV=stage npm test
```

## CI/CD

### Sanity Pipeline
- **Triggers:** Manual dispatch, pull requests to `main`
- **Scope:** `tests/sanity/` directory
- **Artifacts:** JSON test results

### Regression Pipeline
- **Triggers:** Manual dispatch, nightly schedule (2:00 AM UTC)
- **Scope:** All tests
- **Artifacts:** JSON test results

## Environment Configuration

Set the `ENV` environment variable to target different environments:

| Value   | API URL                          |
|---------|----------------------------------|
| `local` | http://localhost:8085            |
| `stage` | https://stage-api.echostash.com |
| `prod`  | https://api.echostash.com       |

## API Client Usage

```typescript
import { ApiClient } from "@clients/api-client";
import { getAuthenticatedClient } from "@helpers/auth";

// Unauthenticated
const client = new ApiClient();
const response = await client.get("/api/health");

// Authenticated
const authClient = await getAuthenticatedClient();
const prompts = await authClient.get("/api/prompts");
```
