# Playwright automation project — Tesena Shop

End-to-end tests for a [PrestaShop](http://37.27.17.198:8084) instance, built with Playwright and TypeScript.

## Table of contents

- [Installation](#installation)
- [Running tests](#running-tests)
- [Code quality](#code-quality)
  - [Linting](#linting)
  - [Formatting](#formatting)
  - [Pre-commit hook](#pre-commit-hook)
  - [Type checking](#type-checking)
- [Import aliases](#import-aliases)
- [Project structure](#project-structure)
- [Architecture](#architecture)
  - [Spec files](#spec-files)
  - [Steps](#steps)
  - [Pages](#pages)
  - [Components](#components)
- [Test data](#test-data)
- [i18n (translation dictionary)](#i18n-translation-dictionary)
- [Test groups and tags](#test-groups-and-tags)
- [Playwright configuration](#playwright-configuration)
  - [Environments](#environments)
  - [Project matrix](#project-matrix)
  - [Storage state](#storage-state)

---

## Installation

```shell
npm install
npx playwright install
```

Create a `.env.local` file (git-ignored) and set the test user password:

```shell
SHOP_PASSWORD=your_password_here
```

---

## Running tests

```shell
npm test                                          # run all tests
npx playwright test tests/login.spec.ts           # single file
npx playwright test --grep "@login"               # by tag
npx playwright test --grep "@nosession"           # no-auth tests only
npx playwright test --project shopTestsUser       # by Playwright project
npx playwright test --headed                      # headed mode
npx playwright test --ui                          # Playwright UI mode
```

---

## Code quality

### Linting

```shell
npm run lint
```

ESLint is configured in `eslint.config.mjs` and includes the `eslint-plugin-playwright` rules. Variables and parameters prefixed with `_` (e.g. `_config`) are intentionally excluded from unused-variable warnings — use this prefix when a value is required by a signature but not read (e.g. Playwright setup callbacks).

### Formatting

```shell
npm run format
```

Prettier is configured in `prettier.config.mjs`. The project enforces double quotes, 2-space indentation, and trailing commas everywhere.

### Pre-commit hook

Husky runs lint-staged before every commit: `prettier --write` followed by `eslint --cache` on all staged `.ts`/`.js` files, and `prettier --write` on `.json`/`.css`/`.md` files.

### Type checking

```shell
npm run typecheck
```

TypeScript strict mode is on (`strict`, `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`). Playwright handles its own compilation at runtime; `tsconfig.json` exists solely for IDE type checking and the `@/` path alias.

---

## Import aliases

The `@/` alias maps to the project root:

```typescript
// instead of
import { LoginPage } from "../../../tests/pages/login/LoginPage";

// use
import { LoginPage } from "@/tests/pages/login/LoginPage";
```

Configured in `tsconfig.json` via `paths`. Playwright 1.40+ resolves this natively.

---

## Project structure

```
config/                   — environment and locale validation
errors/                   — custom error classes
helpers/                  — shared utilities (TestGroup constants)
i18n/                     — translation schema + cs/en dictionaries
tests/
  pages/                  — page objects (UI map only)
    components/           — reusable page sub-components
  setup/                  — global setup (storage state init)
  steps/                  — business logic and assertions
  testdata/
    testUsers/            — user schema and per-environment data
eslint.config.mjs
playwright.config.ts
prettier.config.mjs
tsconfig.json
```

---

## Architecture

Strict 3-layer separation:

```
tests/*.spec.ts           — orchestration only; no assertions outside test.step()
tests/steps/*.step.ts     — business logic, multi-step flows, all expect() calls
tests/pages/**/*.ts       — UI map only; locators + atomic actions
```

### Spec files

Import `test` from `@playwright/test`. Instantiate page objects and steps directly in the test body. Load the i18n dictionary once and pass it where needed:

```typescript
test(`${TestGroup.LOGIN} ${TestGroup.NO_SESSION} Successful login`, async ({
  page,
}) => {
  const t = loadDictionary(locale(process.env.LOCALE as Locale));
  const loginPage = new LoginPage(page);
  const dashboard = new Dashboard(page, t);
  const loginStep = new LoginStep(loginPage);
  const user = getTestUserData("shopTestsUser");

  await loginPage.goto();
  await loginPage.expectLoaded();

  await test.step("User fills in valid credentials and submits the form", async () => {
    await loginStep.loginByEmail(user.email, user.password);
  });

  await test.step("User is redirected to the dashboard", async () => {
    await loginStep.verifyLoginSuccess(dashboard);
  });
});
```

### Steps

`tests/steps/*.step.ts` — contain all business logic and `expect()` assertions. Steps take page objects as constructor arguments and expose meaningful action methods. Example:

```typescript
export class LoginStep {
  constructor(readonly loginPage: LoginPage) {}

  async loginByEmail(email: string, password: string): Promise<void> {
    await this.loginPage.emailInput.fill(email);
    await this.loginPage.passwordInput.fill(password);
    await this.loginPage.loginButton.click();
  }

  async verifyLoginFailure(t: Texts): Promise<void> {
    await expect(this.loginPage.errorAlert).toBeVisible();
    await expect(this.loginPage.errorAlert).toContainText(
      t.loginPage.authErrorAlert,
    );
  }
}
```

### Pages

Page objects expose locators as `get` properties and implement `goto()` + `expectLoaded()`. They contain no business logic or assertions (except `expectLoaded()`).

```typescript
export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() { ... }
  async expectLoaded(): Promise<void> {
    await this.emailInput.waitFor({ state: "visible" });
  }

  get emailInput(): Locator { return this.page.locator("#field-email"); }
  get loginButton(): Locator { return this.page.locator("#submit-login"); }
}
```

Locator strategy (prefer in this order):

1. `getByRole` — semantic, most robust
2. `getByLabel` — for labelled form fields
3. `getByText` — visible text; use `exact: true` when needed
4. `getByTestId` — when `data-testid` exists
5. Stable framework IDs (`#field-email`, `#field-password`) — acceptable for PrestaShop
6. CSS attribute selectors — last resort; document why

When a locator uses visible text, always pull the string from the i18n dictionary so it stays locale-correct.

### Components

Components represent reusable parts of the UI shared across pages (e.g. cookie banner, navigation menu). Same constructor pattern as pages — `page` + optional `t`. Components must not contain navigation logic or business flow; those belong in steps.

---

## Test data

Test users are defined in `tests/testdata/testUsers/schema.ts` and implemented per environment in `acc.ts` (loaded automatically based on `ENVIRONMENT`). TypeScript enforces that each user file contains all required fields.

```typescript
// schema.ts
export type TestUser = { email: string; password: string };
export type Users = { shopTestsUser: TestUser };
```

```typescript
// acc.ts
export const users: Users = {
  shopTestsUser: {
    email: "demo@prestashop.com",
    password: process.env.SHOP_PASSWORD ?? "",
  },
};
```

Passwords are never committed — load them from `.env.local` or CI secrets.

Access user data in tests:

```typescript
const user = getTestUserData("shopTestsUser");
```

---

## i18n (translation dictionary)

All visible strings used in locators or assertions come from the translation dictionary — never hardcoded. This allows tests to run against Czech and English locales without code changes.

```typescript
const t = loadDictionary(locale(process.env.LOCALE as Locale));
```

Add new keys to `i18n/schema.ts` first, then implement in `i18n/cs.ts` and `i18n/en.ts`. The TypeScript schema enforces that both dictionaries stay in sync.

Run tests in a specific locale:

```shell
LOCALE=en-US npx playwright test
LOCALE=cs-CZ npx playwright test
```

---

## Test groups and tags

Tags in test names allow targeted test runs via `--grep`:

```typescript
export const TestGroup = {
  LOGIN: "@login",
  HOMEPAGE: "@homepage",
  REGISTRATION: "@registration",
  ACCOUNTS: "@accounts",
  PAYMENTS: "@payments",
  NO_SESSION: "@nosession",
} as const;
```

```shell
npx playwright test --grep "@login"        # login tests only
npx playwright test --grep "@nosession"    # unauthenticated tests only
npx playwright test --grep "@registration" # registration tests only
```

`@nosession` marks tests that run without stored authentication state (the "No user tests" project).

---

## Playwright configuration

### Environments

The project has a single environment, `TEST`. Environment variables are loaded from two files:

| File        | Contents                                                         |
| ----------- | ---------------------------------------------------------------- |
| `.env`      | Shared variables (e.g. `NODE_TLS_REJECT_UNAUTHORIZED`)           |
| `.env.test` | Environment-specific URLs (`BASE_URL`, `LOGIN_PAGE_URL_*`, etc.) |

Set the environment explicitly (defaults to `TEST`):

```shell
ENVIRONMENT=TEST npx playwright test
```

### Project matrix

One Playwright project is generated per test user, plus a dedicated `No user tests` project for `@nosession` tests. Each user project gets a single worker so tests for the same user always run serially.

```typescript
const projectMatrix = Object.keys(testUsers).map((userKey) => ({
  name: userKey,
  workers: 1,
  grep: RegExp(`@${userKey}`),
  use: { storageState: storagePath(userKey) },
}));
```

### Storage state

Authentication happens once at the start of the test run via `globalSetup` (`tests/setup/storageState.setup.ts`), which creates empty storage state files in `.auth/TEST/`. Tests that need an authenticated user tag themselves with `@shopTestsUser` (or whichever user key). The `loginAndSaveStorageState` helper in `tests/steps/login.step.ts` can be used to persist a real login session.

Debugging artifacts captured automatically:

| Artifact   | Setting             |
| ---------- | ------------------- |
| Trace      | `on-first-retry`    |
| Video      | `retain-on-failure` |
| Screenshot | `only-on-failure`   |

```shell
# View a trace locally
npx playwright show-trace test-results/<run>/trace.zip
```
