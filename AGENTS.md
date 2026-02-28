# AGENTS.md — Playwright Template Advanced

Guidelines for agentic coding assistants working in this repository.

---

## Project Overview

A Playwright end-to-end test framework using TypeScript, structured around the Page Object Model (POM) with a strict 3-layer architecture: **Tests → Steps → Page Objects**. Multi-environment, multi-user, with i18n support.

---

## Build / Lint / Test Commands

```bash
# Run all tests
npm test
# Alias: npx playwright test

# Run a single test file
npx playwright test tests/login.spec.ts

# Run a single test by title (substring match)
npx playwright test --grep "Login button enabling test"

# Run tests by tag/group
npx playwright test --grep "@payments"
npx playwright test --grep "@accounts"
npx playwright test --grep "@login"

# Run tests for a specific user project
npx playwright test --project ACC

# Run with a specific environment
ENVIRONMENT=int npx playwright test

# Run in headed mode (see the browser)
npx playwright test --headed

# Run with Playwright UI mode
npx playwright test --ui

# Lint (ESLint)
npm run lint

# Format (Prettier)
npm run format

# Type-check only (no emit)
npm run typecheck
```

Pre-commit hooks via Husky + lint-staged automatically run `prettier --write` then `eslint --cache` on staged `*.ts` and `*.js` files.

---

## Architecture: 3-Layer Separation

```
tests/*.spec.ts        — test orchestration only; no assertions outside test.step()
tests/steps/*.step.ts  — business logic, multi-step flows, assertions
tests/pages/**/*.ts    — UI maps only; locators + atomic click/fill/select actions
tests/pages/components — reusable sub-page components
```

**Rules:**

- Page Objects must never contain assertions or business logic.
- Steps coordinate Page Objects and contain `expect()` calls.
- Spec files use `test.step()` blocks for granular Playwright reporting.

---

## File & Directory Naming

| Element        | Convention          | Example                           |
| -------------- | ------------------- | --------------------------------- |
| Spec files     | `<domain>.spec.ts`  | `payments.spec.ts`                |
| Page Objects   | `PascalCase.ts`     | `LoginPage.ts`, `Dashboard.ts`    |
| Components     | `PascalCase.ts`     | `SmsLogin.ts`, `Menu.ts`          |
| Step files     | `<name>.step.ts`    | `login.step.ts`                   |
| Setup files    | `<name>.setup.ts`   | `cookies.setup.ts`                |
| Fixture files  | `<name>.fixture.ts` | `test.fixture.ts`                 |
| Config/helpers | `camelCase.ts`      | `environment.ts`, `testGroups.ts` |
| i18n files     | `<locale>.ts`       | `cs.ts`, `en.ts`                  |

---

## Naming Conventions

| Element                | Convention                    | Example                                    |
| ---------------------- | ----------------------------- | ------------------------------------------ |
| Classes                | `PascalCase`                  | `LoginPage`, `LoginStep`                   |
| Functions              | `camelCase`                   | `describeAsUser()`, `loadDictionary()`     |
| Constant objects       | `PascalCase`                  | `TestGroup`                                |
| Constant tuple/arrays  | `SCREAMING_SNAKE_CASE`        | `ENVIRONMENTS`, `LANGUAGES`                |
| Variables / params     | `camelCase`                   | `testUserKey`, `storageStatePath`          |
| Type aliases           | `PascalCase`                  | `TestUser`, `Locale`, `Environment`        |
| PO locator getters     | `camelCase` getter            | `get loginButton()`, `get usernameInput()` |
| Fixture navigation fns | `goto<Page>` / `expect<Page>` | `gotoAccountsPage`, `expectDashboard`      |
| Test group tags        | `@kebab-case` string          | `@accounts`, `@no-user`                    |

---

## TypeScript Style

- **Strict mode** is enabled: `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`.
- **`verbatimModuleSyntax: true`** — use `import type` for type-only imports.
- **`isolatedModules: true`** — avoid const enums and ambient module augmentation.
- Prefer `as const` over enums:
  ```typescript
  export const TestGroup = {
    ACCOUNTS: "@accounts",
    PAYMENTS: "@payments",
  } as const;
  export type TestGroup = (typeof TestGroup)[keyof typeof TestGroup];
  ```
- Prefer `satisfies` over explicit type annotation when you want the widest inferred type:
  ```typescript
  export const TEXTS = { "cs-CZ": cs, "en-US": en } satisfies Record<
    Locale,
    Schema
  >;
  ```
- Derive types from runtime values to keep them in sync:
  ```typescript
  export type TestUserKey = keyof typeof TEST_USERS;
  ```
- Use generic constraints to enforce interface contracts on page classes (see `helpers/pageFactory.ts`).

---

## Import Style

- ESM (`"type": "module"` in package.json); use `import`/`export`, never `require()`.
- Double quotes for strings, matching Prettier config.
- Node.js built-ins use the `node:` protocol prefix: `import fs from "node:fs"`.
- Relative paths only — no path aliases (`@/`) are configured.
- Group imports: Playwright built-ins → project config/helpers → local types/classes.

```typescript
import { Page, Locator } from "@playwright/test";
import { test as base } from "@playwright/test";

import { env } from "../../config/environment";
import { gotoPage } from "../../helpers/pageFactory";

import type { Texts } from "../../fixtures/test.fixture";
import { LoginPage } from "../pages/login/LoginPage";
```

---

## Formatting (Prettier)

```js
// prettier.config.mjs
{
  trailingComma: "all",  // trailing commas in function params too
  tabWidth: 2,
  semi: true,
  singleQuote: false,    // double quotes
}
```

Run `npm run format` before committing, or rely on the pre-commit hook.

---

## Writing Tests

Always import `test` from the custom fixture, not directly from `@playwright/test`:

```typescript
import { expect } from "@playwright/test";
import { test } from "../fixtures/test.fixture";
import { TestGroup } from "../helpers/testGroups";

test.describe("Login tests", () => {
  test(`${TestGroup.LOGIN} ${TestGroup.NO_USER} Login button enabling`, async ({
    loginPage,
  }) => {
    await test.step("Login button is disabled by default", async () => {
      await expect(loginPage.loginButton).toBeDisabled();
    });
  });
});
```

For tests that need an authenticated user, use `describeAsUser()`:

```typescript
import { describeAsUser } from "../fixtures/user.fixture";

describeAsUser("paymentsTestsUser", "Payments suite", async () => {
  test(`${TestGroup.PAYMENTS} Single payment`, async ({
    gotoSinglePaymentPage,
  }) => {
    const page = await gotoSinglePaymentPage();
    // ...
  });
});
```

**Test name format:** `${TestGroup.TAG} ${TestGroup.TAG2} Human-readable description`

---

## Page Object Pattern

```typescript
import type { Page, Locator } from "@playwright/test";
import type { Texts } from "../../fixtures/test.fixture";

export class AccountsPage {
  private readonly page: Page;
  private readonly t: Texts;

  constructor(page: Page, t: Texts) {
    this.page = page;
    this.t = t;
  }

  get newAccountButton(): Locator {
    return this.page.getByRole("button", { name: this.t.accounts.newAccount });
  }

  async goto(): Promise<void> {
    await this.page.goto(process.env.ACCOUNTS_PAGE_URL!);
  }

  async expectLoaded(): Promise<void> {
    await this.page.waitForURL(/accounts/);
  }
}
```

Every navigable Page Object must implement `goto()` and `expectLoaded()` for use with `gotoPage()` / `expectPage()` from `helpers/pageFactory.ts`.

---

## Error Handling Patterns

**Fail-fast config validation** (IIFE + throw):

```typescript
export const env: Environment = (() => {
  if (!ENVIRONMENTS.includes(rawEnv as Environment))
    throw new Error(`Invalid environment: [${rawEnv}]`);
  return rawEnv as Environment;
})();
```

**Custom error classes** for domain-specific errors:

```typescript
export class MissingTestUserKeyError extends Error {
  constructor() {
    super("Missing 'testUserKey' definition.");
    this.name = "MissingTestUserKeyError";
  }
}
```

**try/finally** for browser context lifecycle (always close contexts):

```typescript
const context = await browser.newContext();
try {
  // ...
} finally {
  await context.close();
}
```

**try/catch** for optional UI elements (e.g., cookie banners that may not appear):

```typescript
try {
  await banner.waitFor({ state: "visible", timeout: 30_000 });
  await banner.click();
} catch {
  console.log("Banner not found, skipping");
}
```

---

## Environment & Configuration

- Environment is set via `ENVIRONMENT` env var (e.g., `acc`, `int`).
- `.env`, `.env.acc`, `.env.int` files hold `BASE_URL` and page URLs.
- Never hardcode URLs — use `process.env.PAGE_NAME_URL!` in Page Objects.
- Auth storage state lives in `.auth/<env>/<user>.json` (gitignored, generated at runtime).
- The Playwright project matrix is generated dynamically per user in `playwright.config.ts`.

---

## i18n

- All user-facing strings in page locators must come from the `t: Texts` fixture, never hardcoded.
- Add new strings to `i18n/schema.ts` (type) first, then to `i18n/cs.ts` and `i18n/en.ts`.
- Load translations via `loadDictionary(locale)` from `i18n/index.ts`.
