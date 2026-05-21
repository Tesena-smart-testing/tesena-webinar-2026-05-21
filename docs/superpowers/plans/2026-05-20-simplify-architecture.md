# Simplify Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the page factory, custom fixture extension, and components layer. Keep i18n — page objects still receive `t: Texts`, but tests load the dictionary directly instead of via a fixture.

**Architecture:** `type Texts` moves from the deleted fixture to `i18n/index.ts`. Page Objects keep their `(page, t)` constructor. Tests call `loadDictionary()` once and pass `t` in. Components (`Menu`, `SmsLogin`, `OtpLogin`) are deleted; their callers are updated to work without them.

**Tech Stack:** Playwright, TypeScript (strict, ESNext/bundler), ESLint, Prettier

---

### Task 1: Create branch

**Files:** none

- [ ] Create and switch to the feature branch:

```bash
git checkout main
git checkout -b feat/simplify-architecture
```

- [ ] Verify:

```bash
git branch --show-current
# Expected: feat/simplify-architecture
```

---

### Task 2: Export `Texts` type from i18n

**Files:**

- Modify: `i18n/index.ts`

`type Texts = typeof cs` was defined in `fixtures/test.fixture.ts`. Moving it to `i18n/index.ts` so all page objects can import it from there.

- [ ] Add the `Texts` type export to `i18n/index.ts`:

```typescript
import type { Locale } from "@/config/locale";
import { cs } from "@/i18n/cs";
import { en } from "@/i18n/en";
import type { Schema } from "@/i18n/schema";

export const TEXTS = {
  "cs-CZ": cs,
  "en-US": en,
} satisfies Record<Locale, Schema>;

export function loadDictionary(locale: Locale) {
  return TEXTS[locale];
}

export type Texts = Schema;
```

- [ ] Run typecheck:

```bash
npm run typecheck
# Expected: no output (exit 0)
```

---

### Task 3: Simplify LoginPage

**Files:**

- Modify: `tests/pages/login/LoginPage.ts`

Remove `SmsLogin`/`OtpLogin` imports and their getters. Change the `Texts` import to come from `@/i18n` instead of the fixture.

- [ ] Replace the entire file content:

```typescript
import type { Locator, Page } from "@playwright/test";
import type { Texts } from "@/i18n";

export class LoginPage {
  constructor(
    private readonly page: Page,
    private readonly t: Texts,
  ) {}

  async goto() {
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
  }

  async expectLoaded(): Promise<void> {
    await this.usernameInput.waitFor({ state: "visible", timeout: 60_000 });
  }

  get usernameInput(): Locator {
    return this.page.locator("input#username");
  }

  get passwordInput(): Locator {
    return this.page.locator("input#password");
  }

  get loginButton(): Locator {
    return this.page.locator(
      `//button[contains(text(), '${this.t.loginPage.loginButton.title}')]`,
    );
  }

  get acceptCookiesButton(): Locator {
    return this.page.getByRole("button", {
      name: this.t.loginPage.cookies.accept,
    });
  }
}
```

- [ ] Run typecheck:

```bash
npm run typecheck
# Expected: no output (exit 0)
```

---

### Task 4: Simplify Dashboard

**Files:**

- Modify: `tests/pages/Dashboard.ts`

Remove the `Menu` import and getter. Change the `Texts` import to come from `@/i18n`.

- [ ] Replace the entire file content:

```typescript
import type { Page } from "@playwright/test";
import type { Texts } from "@/i18n";

export class Dashboard {
  constructor(
    private readonly page: Page,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private readonly t: Texts,
  ) {}

  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  async expectLoaded(): Promise<void> {
    await this.page.waitForURL("/");
  }
}
```

- [ ] Run typecheck:

```bash
npm run typecheck
# Expected: no output (exit 0)
```

---

### Task 5: Simplify AccountsPage, SinglePaymentPage, BatchPaymentPage

**Files:**

- Modify: `tests/pages/accounts/AccountsPage.ts`
- Modify: `tests/pages/payments/single/SinglePaymentPage.ts`
- Modify: `tests/pages/payments/batch/BatchPaymentPage.ts`

Change the `Texts` import from `@/fixtures/test.fixture` to `@/i18n`. Remove `@ts-expect-error` comments (the type now resolves cleanly).

- [ ] Replace `tests/pages/accounts/AccountsPage.ts`:

```typescript
import type { Page } from "@playwright/test";
import type { Texts } from "@/i18n";

export class AccountsPage {
  constructor(
    private readonly page: Page,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private readonly t: Texts,
  ) {}

  async expectLoaded(): Promise<void> {
    // TODO: add some validations to check page is loaded
  }

  async goto(): Promise<void> {
    await this.page.goto(process.env.ACCOUNTS_PAGE_URL!);
  }
}
```

- [ ] Replace `tests/pages/payments/single/SinglePaymentPage.ts`:

```typescript
import type { Page } from "@playwright/test";
import type { Texts } from "@/i18n";

export class SinglePaymentPage {
  constructor(
    private readonly page: Page,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private readonly t: Texts,
  ) {}

  async expectLoaded(): Promise<void> {
    // TODO: add some validations to check page is loaded
  }

  async goto(): Promise<void> {
    await this.page.goto(process.env.SINGLE_PAYMENT_PAGE_URL!);
  }
}
```

- [ ] Replace `tests/pages/payments/batch/BatchPaymentPage.ts`:

```typescript
import type { Page } from "@playwright/test";
import type { Texts } from "@/i18n";

export class BatchPaymentPage {
  constructor(
    private readonly page: Page,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private readonly t: Texts,
  ) {}

  async expectLoaded(): Promise<void> {
    // TODO: add some validations to check page is loaded
  }

  async goto(): Promise<void> {
    await this.page.goto(process.env.BATCH_PAYMENT_PAGE_URL!);
  }
}
```

- [ ] Run typecheck:

```bash
npm run typecheck
# Expected: no output (exit 0)
```

---

### Task 6: Simplify login.step.ts

**Files:**

- Modify: `tests/steps/login.step.ts`

Remove `SmsLogin`/`OtpLogin` imports. Replace `loginBySms`/`loginByOtp` (which returned component objects) with a single `loginByOtp(username, password, token)`. Change `loginAndSaveStorageState` to self-load `t` instead of receiving it as a parameter. Remove `pageFactory` import; replace with direct Dashboard instantiation.

- [ ] Replace the entire file content:

```typescript
import type { Browser } from "@playwright/test";
import { LoginPage } from "@/tests/pages/login/LoginPage";
import {
  storagePath,
  type TestUserData,
  type TestUserKey,
} from "@/tests/testdata/testUsers";
import { Dashboard } from "@/tests/pages/Dashboard";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";
import * as fs from "node:fs";

export class LoginStep {
  constructor(readonly loginPage: LoginPage) {}

  async loginByOtp(
    username: string,
    password: string,
    _token: string,
  ): Promise<void> {
    await this.fillCredentialsClickLogin(username, password);
    // OTP confirmation stub — implement once real OTP locators are known
  }

  async fillCredentialsClickLogin(
    username: string,
    password: string,
  ): Promise<void> {
    await this.loginPage.usernameInput.fill(username);
    await this.loginPage.passwordInput.fill(password);
    await this.loginPage.loginButton.click();
  }
}

export async function loginAndSaveStorageState(
  testUserKey: TestUserKey,
  testUser: TestUserData,
  browser: Browser,
) {
  const storageStatePath = storagePath(testUserKey);
  if (!fs.existsSync(storageStatePath)) {
    throw new Error(
      `Storage state file does not exist at [${storageStatePath}]`,
    );
  }

  const t = loadDictionary(locale(process.env.LOCALE as Locale));
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    const loginPage = new LoginPage(page, t);
    await loginPage.goto();

    const loginStep = new LoginStep(loginPage);
    await loginStep.loginByOtp(
      testUser.loginNumber,
      testUser.password,
      testUser.token,
    );

    const dashboard = new Dashboard(page, t);
    await dashboard.expectLoaded();

    await page.context().storageState({ path: storagePath(testUserKey) });
  } finally {
    await context.close();
  }
}
```

- [ ] Run typecheck:

```bash
npm run typecheck
# Expected: no output (exit 0)
```

---

### Task 7: Simplify login.spec.ts

**Files:**

- Modify: `tests/login.spec.ts`

Import `test`/`expect` from `@playwright/test`. Load `t` once at the top of the test body and pass to `LoginPage`.

- [ ] Replace the entire file content:

```typescript
import { test, expect } from "@playwright/test";
import { LoginPage } from "@/tests/pages/login/LoginPage";
import { TestGroup } from "@/helpers/testGroups";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";

test.describe("Login tests", () => {
  test(`${TestGroup.LOGIN} ${TestGroup.NO_USER} Login button enabling test`, async ({
    page,
  }) => {
    const t = loadDictionary(locale(process.env.LOCALE as Locale));
    const loginPage = new LoginPage(page, t);
    await loginPage.goto();
    await loginPage.expectLoaded();

    await test.step("Login button is disabled by default", async () => {
      await expect(loginPage.loginButton).toBeDisabled();
    });

    await test.step("Login button is disabled when only username is filled in", async () => {
      await loginPage.usernameInput.fill("username");
      await expect(loginPage.loginButton).toBeDisabled();
    });

    await test.step("Login button is disabled when only password is filled in", async () => {
      await loginPage.usernameInput.clear();
      await loginPage.passwordInput.fill("password");
      await expect(loginPage.loginButton).toBeDisabled();
    });

    await test.step("Login button is enabled when username and password filled in", async () => {
      await loginPage.usernameInput.fill("username");
      await expect(loginPage.loginButton).toBeEnabled();
    });
  });
});
```

- [ ] Run typecheck:

```bash
npm run typecheck
# Expected: no output (exit 0)
```

---

### Task 8: Simplify accounts.spec.ts and payments.spec.ts

**Files:**

- Modify: `tests/accounts.spec.ts`
- Modify: `tests/payments.spec.ts`

Replace `describeAsUser` with a plain `test.describe` using the `@userKey` tag in the title. Load `t` directly and pass to page objects.

- [ ] Replace `tests/accounts.spec.ts`:

```typescript
import { test } from "@playwright/test";
import { AccountsPage } from "@/tests/pages/accounts/AccountsPage";
import { TestGroup } from "@/helpers/testGroups";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";

test.describe("@accountsTestsUser 1IB tests", () => {
  // eslint-disable-next-line playwright/expect-expect
  test(`${TestGroup.ACCOUNTS} Standard account test`, async ({ page }) => {
    const t = loadDictionary(locale(process.env.LOCALE as Locale));
    const accountsPage = new AccountsPage(page, t);
    await accountsPage.goto();
    await accountsPage.expectLoaded();
  });
});
```

- [ ] Replace `tests/payments.spec.ts`:

```typescript
import { test } from "@playwright/test";
import { SinglePaymentPage } from "@/tests/pages/payments/single/SinglePaymentPage";
import { BatchPaymentPage } from "@/tests/pages/payments/batch/BatchPaymentPage";
import { TestGroup } from "@/helpers/testGroups";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";

test.describe("@paymentsTestsUser 1IB tests", () => {
  // eslint-disable-next-line playwright/expect-expect
  test(`${TestGroup.PAYMENTS} Single payment test`, async ({ page }) => {
    const t = loadDictionary(locale(process.env.LOCALE as Locale));
    const singlePaymentPage = new SinglePaymentPage(page, t);
    await singlePaymentPage.goto();
    await singlePaymentPage.expectLoaded();
  });

  // eslint-disable-next-line playwright/expect-expect
  test(`${TestGroup.PAYMENTS} Batch payment test`, async ({ page }) => {
    const t = loadDictionary(locale(process.env.LOCALE as Locale));
    const batchPaymentPage = new BatchPaymentPage(page, t);
    await batchPaymentPage.goto();
    await batchPaymentPage.expectLoaded();
  });
});
```

- [ ] Run typecheck:

```bash
npm run typecheck
# Expected: no output (exit 0)
```

---

### Task 9: Update playwright.config.ts

**Files:**

- Modify: `playwright.config.ts`

`testUserKey` in the project matrix `use` block was a custom fixture option. It must be removed or TypeScript will error once the fixture is gone.

- [ ] Remove `testUserKey: userKey,` so the `use` block inside `projectMatrix` becomes:

```typescript
  use: {
    storageState: storagePath(userKey),
  },
```

The full updated `projectMatrix` block:

```typescript
const projectMatrix = (
  Object.keys(testUsers) as Array<keyof typeof testUsers>
).map((userKey) => ({
  name: `${userKey}`,
  workers: 1,
  grep: RegExp(`@${userKey}`),
  dependencies: ["setup:cookies"],
  use: {
    storageState: storagePath(userKey),
  },
}));
```

- [ ] Run typecheck:

```bash
npm run typecheck
# Expected: no output (exit 0)
```

---

### Task 10: Delete removed files

**Files deleted:**

- `helpers/pageFactory.ts`
- `fixtures/test.fixture.ts`
- `fixtures/user.fixture.ts`
- `tests/pages/components/Menu.ts`
- `tests/pages/login/components/SmsLogin.ts`
- `tests/pages/login/components/OtpLogin.ts`

- [ ] Delete all files:

```bash
git rm helpers/pageFactory.ts \
       fixtures/test.fixture.ts \
       fixtures/user.fixture.ts \
       tests/pages/components/Menu.ts \
       tests/pages/login/components/SmsLogin.ts \
       tests/pages/login/components/OtpLogin.ts
```

- [ ] Run typecheck to confirm no imports of deleted files remain:

```bash
npm run typecheck
# Expected: no output (exit 0)
```

- [ ] Run lint:

```bash
npm run lint
# Expected: no output (exit 0)
```

---

### Task 11: Update CLAUDE.md

**Files:**

- Modify: `CLAUDE.md`

- [ ] Replace the **Key Patterns** section with:

````markdown
## Key Patterns

**Tests** — import `test`/`expect` from `@playwright/test`. Load the i18n dictionary once per test and pass to page objects:

\```typescript
import { test, expect } from "@playwright/test";
import { LoginPage } from "@/tests/pages/login/LoginPage";
import { TestGroup } from "@/helpers/testGroups";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";

test.describe("Login tests", () => {
test(`${TestGroup.LOGIN} ${TestGroup.NO_USER} Login button enabling`, async ({ page }) => {
const t = loadDictionary(locale(process.env.LOCALE as Locale));
const loginPage = new LoginPage(page, t);
await loginPage.goto();
await loginPage.expectLoaded();

    await test.step("Login button is disabled by default", async () => {
      await expect(loginPage.loginButton).toBeDisabled();
    });

});
});
\```

For authenticated tests use a plain `test.describe` with the `@userKey` tag in the title — the Playwright project matrix routes tests to the right user project by matching that tag.

**Page Objects** take `(page: Page, t: Texts)`. Locators are `get` properties returning `Locator`. Every navigable page implements `goto()` and `expectLoaded()`. Import `Texts` from `@/i18n`.

**Steps** (`tests/steps/*.step.ts`) hold multi-step business logic and `expect()` calls. Instantiate page objects in the constructor.

**i18n** — `loadDictionary(locale)` from `@/i18n` returns the translation dictionary for the current locale. Add new keys to `i18n/schema.ts` first, then implement in `i18n/cs.ts` and `i18n/en.ts`.

**Environments** — set via `ENVIRONMENT` env var (`acc`/`int`). URLs in `.env.acc` / `.env.int`. Use `process.env.PAGE_NAME_URL!` in Page Objects.
````

- [ ] Remove the old Architecture section's references to `fixtures/` and `helpers/pageFactory` — those directories/files no longer exist.

- [ ] Run typecheck and lint:

```bash
npm run typecheck && npm run lint
# Expected: no output from either (exit 0)
```

---

### Task 12: Commit and push

- [ ] Stage all changes:

```bash
git add -A
```

- [ ] Commit:

```bash
git commit -m "refactor: remove page factory, fixtures, and components; keep i18n"
```

- [ ] Push the branch:

```bash
git push -u origin feat/simplify-architecture
```
