# Echostash Backend Automation

API automation tests for the Echostash backend using **Vitest**, **TypeScript**, and **Axios**.

## Project Structure

```
├── .github/workflows/   # CI/CD pipelines (sanity + regression)
├── src/
│   ├── clients/         # Domain-specific API clients (auth, prompts, eval, etc.)
│   ├── config/          # Environment configuration + feature flags
│   ├── fixtures/        # Test data factories + builder pattern
│   ├── helpers/         # Auth, assertions, lifecycle, polling utilities
│   ├── sdk-dogfood/     # SDK client placeholder for dogfood testing
│   ├── types/           # Shared TypeScript interfaces for all API resources
│   └── utils/           # General utilities (sleep, retry, uniqueId, etc.)
├── tests/
│   ├── sanity/          # Quick smoke tests (health, auth, projects, prompts, SDK)
│   └── regression/      # Full regression suite (CRUD, versioning, eval, billing, etc.)
├── vitest.config.ts     # Vitest configuration with path aliases
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## Prerequisites

- Node.js 20+
- npm

## Installation

```bash
npm ci
```

## How to Run Tests

### Run all tests

```bash
npm test
```

### Run sanity tests

```bash
npm run test:sanity
```

### Run regression tests

```bash
npm run test:regression
```

### Run tests by area

```bash
npm run test:auth       # Auth flows (guest, refresh, error handling)
npm run test:prompts    # Prompts CRUD, versioning, search, publish
npm run test:sdk        # SDK fetch, render, batch render
npm run test:eval       # Eval datasets, suites, tests, runs, gates
npm run test:keys       # API key creation, usage, revocation
npm run test:billing    # Billing profile, quotas, spending
npm run test:plp        # PLP discovery, prompt listing
npm run test:admin      # Admin short links, tags
npm run test:public     # Public prompts, packs, plans
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run with a specific environment

```bash
ENV=local npm test       # Against local backend (http://localhost:8085)
ENV=stage npm test       # Against staging
ENV=prod npm test        # Against production
```

### Type-check without running tests

```bash
npm run typecheck
```

## Test Reports

### Allure Reports

Allure results are generated automatically in the `allure-results/` directory.

To view the interactive Allure report locally:

```bash
npx allure serve allure-results
```

This opens a browser with detailed test results including timelines, categories, and history.

### JSON Reports

JSON results are written to `test-results/results.json` when running in CI.

## Environment Configuration

Set the `ENV` environment variable to target different environments:

| Value   | API URL                          |
|---------|----------------------------------|
| `local` | http://localhost:8085            |
| `stage` | https://stage-api.echostash.com |
| `prod`  | https://api.echostash.com       |

Additional environment variables (set in `.env` or CI secrets):

| Variable              | Purpose                                  |
|-----------------------|------------------------------------------|
| `TEST_USER_EMAIL`     | Email for authenticated user tests       |
| `TEST_USER_PASSWORD`  | Password for authenticated user tests    |
| `TEST_API_KEY`        | Pre-existing API key for SDK tests       |
| `GOOGLE_TEST_TOKEN`   | Google OAuth token for exchange tests    |
| `FEATURE_EVAL`        | Enable/disable eval tests (`true`/`false`) |
| `FEATURE_BILLING`     | Enable/disable billing tests             |
| `FEATURE_PLP`         | Enable/disable PLP tests                 |
| `FEATURE_ANALYTICS`   | Enable/disable analytics tests           |
| `FEATURE_CONTEXT_STORE` | Enable/disable context store tests     |

## CI/CD (GitHub Actions)

### Sanity Pipeline (`sanity.yml`)

- **Triggers:** Manual dispatch via `workflow_dispatch`, pull requests to `main`
- **Scope:** `tests/sanity/` directory only
- **Environment:** Select `local`, `stage`, or `prod` from the dispatch dropdown (defaults to `stage`)
- **Artifacts:** JSON test results + Allure results
- **Timeout:** 15 minutes

### Regression Pipeline (`regression.yml`)

- **Triggers:** Manual dispatch via `workflow_dispatch`, nightly schedule at 2:00 AM UTC
- **Scope:** All tests in `tests/`
- **Environment:** Select from dispatch dropdown (defaults to `stage`)
- **Artifacts:** JSON test results + Allure results
- **Timeout:** 30 minutes

To trigger manually: Go to **Actions** tab > select workflow > **Run workflow** > choose environment.

## API Client Usage

```typescript
import { ApiClient } from "@clients/api-client";
import { PromptsClient } from "@clients/prompts-client";
import { getGuestClient } from "@helpers/auth";

// Unauthenticated
const api = new ApiClient();
const health = await api.get("/actuator/health");

// Authenticated (guest)
const authedApi = await getGuestClient();
const prompts = new PromptsClient(authedApi);
const list = await prompts.list("project-id");

// Authenticated (API key)
const keyApi = new ApiClient({ apiKey: "your-api-key" });
```
