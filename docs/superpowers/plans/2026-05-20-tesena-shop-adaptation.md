# Tesena Shop Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adapt the existing Playwright project (originally built for a banking app) to test the Tesena PrestaShop e-commerce store at `http://37.27.17.198:8084`, covering homepage load and login form behaviour.

**Architecture:** Three-layer separation is kept intact (spec → step → page). Banking-specific files are deleted first to unblock TypeScript compilation, then infrastructure (env, schema, i18n) is updated, then pages and specs are adapted or created. The homepage spec is written before its page object (TDD).

**Tech Stack:** Playwright Test, TypeScript (strict), dotenv, i18n dictionary via `loadDictionary()`, path alias `@/`.

---

## File Map

| Status | File                                               | Change                                                                |
| ------ | -------------------------------------------------- | --------------------------------------------------------------------- |
| DELETE | `tests/accounts.spec.ts`                           | broken fixture imports                                                |
| DELETE | `tests/payments.spec.ts`                           | broken fixture imports                                                |
| DELETE | `tests/pages/accounts/AccountsPage.ts`             | broken fixture import                                                 |
| DELETE | `tests/pages/payments/batch/BatchPaymentPage.ts`   | banking domain                                                        |
| DELETE | `tests/pages/payments/single/SinglePaymentPage.ts` | banking domain                                                        |
| MODIFY | `.env`                                             | remove banking vars                                                   |
| MODIFY | `.env.acc`                                         | set `BASE_URL`                                                        |
| MODIFY | `.env.int`                                         | set `BASE_URL`                                                        |
| MODIFY | `i18n/schema.ts`                                   | remove `certification` section                                        |
| MODIFY | `i18n/cs.ts`                                       | remove `certification` section                                        |
| MODIFY | `i18n/en.ts`                                       | remove `certification`, fix login button text                         |
| MODIFY | `tests/testdata/testUsers/schema.ts`               | `email` replaces `loginNumber`/`token`; remove `BankAccount`          |
| MODIFY | `tests/testdata/testUsers/acc.ts`                  | rename key to `shopTestsUser`, use env var for password               |
| MODIFY | `tests/testdata/testUsers/int.ts`                  | same as acc.ts                                                        |
| MODIFY | `tests/pages/login/LoginPage.ts`                   | new locators; `usernameInput` → `emailInput`                          |
| MODIFY | `tests/steps/login.step.ts`                        | `loginByOtp` → `loginByEmail`; remove token param                     |
| MODIFY | `tests/setup/cookies.setup.ts`                     | navigate to `"/"` via `page.goto`; remove LoginPage.expectLoaded call |
| MODIFY | `tests/login.spec.ts`                              | `usernameInput` → `emailInput`                                        |
| MODIFY | `helpers/testGroups.ts`                            | add `HOMEPAGE` group                                                  |
| CREATE | `tests/pages/home/HomePage.ts`                     | homepage page object                                                  |
| CREATE | `tests/homepage.spec.ts`                           | homepage tests                                                        |

---

## Task 1: Delete stale banking files

**Files:**

- Delete: `tests/accounts.spec.ts`
- Delete: `tests/payments.spec.ts`
- Delete: `tests/pages/accounts/AccountsPage.ts`
- Delete: `tests/pages/payments/batch/BatchPaymentPage.ts`
- Delete: `tests/pages/payments/single/SinglePaymentPage.ts`

These files import `@/fixtures/test.fixture` and `@/fixtures/user.fixture` which were removed in a prior refactor, so the project currently fails `typecheck`. Deleting them unblocks compilation.

- [ ] **Step 1: Delete the five files**

```bash
rm tests/accounts.spec.ts tests/payments.spec.ts
rm tests/pages/accounts/AccountsPage.ts
rm tests/pages/payments/batch/BatchPaymentPage.ts
rm tests/pages/payments/single/SinglePaymentPage.ts
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
npm run typecheck
```

Expected: no errors (or only the pre-existing errors from acc.ts/int.ts, which we fix in Task 4).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: delete stale banking spec and page files"
```

---

## Task 2: Configure environment URLs

**Files:**

- Modify: `.env`
- Modify: `.env.acc`
- Modify: `.env.int`

`.env` is committed to git — do NOT put `SHOP_PASSWORD` here. The password is stored as a system environment variable (`SHOP_PASSWORD`) set outside of git.

- [ ] **Step 1: Update `.env`**

Replace the entire file with:

```
NODE_TLS_REJECT_UNAUTHORIZED=0
```

- [ ] **Step 2: Update `.env.acc`**

Replace the entire file with:

```
BASE_URL=http://37.27.17.198:8084
```

- [ ] **Step 3: Update `.env.int`**

Replace the entire file with:

```
BASE_URL=http://37.27.17.198:8084
```

- [ ] **Step 4: Verify typecheck still passes**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add .env .env.acc .env.int
git commit -m "config: set BASE_URL to Tesena shop for both environments"
```

---

## Task 3: Update i18n — remove banking-specific certification section

**Files:**

- Modify: `i18n/schema.ts`
- Modify: `i18n/cs.ts`
- Modify: `i18n/en.ts`

The `certification` section (SMS OTP, OTP) was specific to the banking app and has no equivalent in the shop.

- [ ] **Step 1: Update `i18n/schema.ts`**

Replace the entire file:

```typescript
export type Schema = {
  loginPage: {
    cookies: {
      accept: string;
    };
    loginButton: {
      title: string;
    };
  };
};

export type Texts = Schema;
```

- [ ] **Step 2: Update `i18n/cs.ts`**

Replace the entire file:

```typescript
import type { Schema } from "@/i18n/schema";

export const cs: Schema = {
  loginPage: {
    cookies: {
      accept: "Souhlasím",
    },
    loginButton: {
      title: "Přihlásit se",
    },
  },
};
```

- [ ] **Step 3: Update `i18n/en.ts`**

Replace the entire file:

```typescript
import type { Schema } from "@/i18n/schema";

export const en: Schema = {
  loginPage: {
    cookies: {
      accept: "Accept",
    },
    loginButton: {
      title: "Sign in",
    },
  },
};
```

- [ ] **Step 4: Update `i18n/index.ts`** — export `Texts` so page objects can import it from `@/i18n`

`LoginPage`, `Dashboard`, and `HomePage` all do `import type { Texts } from "@/i18n"`. Add this export to `i18n/index.ts`:

```typescript
import type { Locale } from "@/config/locale";
import { cs } from "@/i18n/cs";
import { en } from "@/i18n/en";
import type { Schema } from "@/i18n/schema";

export type { Schema as Texts } from "@/i18n/schema";

export const TEXTS = {
  "cs-CZ": cs,
  "en-US": en,
} satisfies Record<Locale, Schema>;

export function loadDictionary(locale: Locale) {
  return TEXTS[locale];
}
```

- [ ] **Step 5: Verify typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add i18n/schema.ts i18n/cs.ts i18n/en.ts
git commit -m "i18n: remove certification section, align login button text with shop"
```

---

## Task 4: Update user schema and test data

**Files:**

- Modify: `tests/testdata/testUsers/schema.ts`
- Modify: `tests/testdata/testUsers/acc.ts`
- Modify: `tests/testdata/testUsers/int.ts`

The user now authenticates with `email` + `password`. No OTP token. There is one user key: `shopTestsUser`. The password is read from `process.env.SHOP_PASSWORD` (set as a system environment variable by the operator — not committed).

- [ ] **Step 1: Update `tests/testdata/testUsers/schema.ts`**

Replace the entire file:

```typescript
export type TestUser = {
  email: string;
  password: string;
};

export type Users = {
  shopTestsUser: TestUser;
};
```

- [ ] **Step 2: Update `tests/testdata/testUsers/acc.ts`**

Replace the entire file:

```typescript
import type { Users } from "@/tests/testdata/testUsers/schema";

export const users: Users = {
  shopTestsUser: {
    email: "demo@prestashop.com",
    password: process.env.SHOP_PASSWORD ?? "",
  },
};
```

- [ ] **Step 3: Update `tests/testdata/testUsers/int.ts`**

Replace the entire file:

```typescript
import type { Users } from "@/tests/testdata/testUsers/schema";

export const users: Users = {
  shopTestsUser: {
    email: "demo@prestashop.com",
    password: process.env.SHOP_PASSWORD ?? "",
  },
};
```

- [ ] **Step 4: Verify `index.ts` still works**

`tests/testdata/testUsers/index.ts` derives `TestUserKey` and `TestUserData` from `getTestUsers()` — it will automatically pick up the renamed key with no changes. Open the file to confirm there's nothing referencing `loginNumber`, `token`, or old user key names.

- [ ] **Step 5: Verify typecheck**

```bash
npm run typecheck
```

Expected: errors in `tests/steps/login.step.ts` (still references `loginNumber` and `loginByOtp`). Those are fixed in Task 6.

- [ ] **Step 6: Commit**

```bash
git add tests/testdata/testUsers/schema.ts tests/testdata/testUsers/acc.ts tests/testdata/testUsers/int.ts
git commit -m "feat: replace banking user schema with email-based shop user"
```

---

## Task 5: Update LoginPage locators

**Files:**

- Modify: `tests/pages/login/LoginPage.ts`

The shop login page (`/cs/přihlásit`) uses `#field-email`, `#field-password`, and `#submit-login`. The `usernameInput` getter is renamed to `emailInput` to reflect the field type.

- [ ] **Step 1: Replace `tests/pages/login/LoginPage.ts`**

```typescript
import type { Locator, Page } from "@playwright/test";
import type { Texts } from "@/i18n";

export class LoginPage {
  constructor(
    private readonly page: Page,
    private readonly t: Texts,
  ) {}

  async goto() {
    await this.page.goto("/cs/p%C5%99ihl%C3%A1sit");
  }

  async expectLoaded(): Promise<void> {
    await this.emailInput.waitFor({ state: "visible", timeout: 60_000 });
  }

  get emailInput(): Locator {
    return this.page.locator("#field-email");
  }

  get passwordInput(): Locator {
    return this.page.locator("#field-password");
  }

  get loginButton(): Locator {
    return this.page.locator("#submit-login");
  }

  get acceptCookiesButton(): Locator {
    return this.page.getByRole("button", {
      name: this.t.loginPage.cookies.accept,
    });
  }
}
```

Note: `goto()` now navigates directly to the login page URL (not `"/"`). The homepage is handled separately by `HomePage`.

- [ ] **Step 2: Verify typecheck — expect errors in login.spec.ts and login.step.ts**

```bash
npm run typecheck
```

Expected: errors about `usernameInput` not existing on `LoginPage`. Fixed in Tasks 6 and 7.

- [ ] **Step 3: Commit**

```bash
git add tests/pages/login/LoginPage.ts
git commit -m "feat: update LoginPage locators for Tesena shop (#field-email, #submit-login)"
```

---

## Task 6: Update login step

**Files:**

- Modify: `tests/steps/login.step.ts`

Replace `loginByOtp` (which took `loginNumber`, `password`, `token`) with `loginByEmail` (which takes `email`, `password`). Update `loginAndSaveStorageState` accordingly.

- [ ] **Step 1: Replace `tests/steps/login.step.ts`**

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

export class LoginStep {
  constructor(readonly loginPage: LoginPage) {}

  async loginByEmail(email: string, password: string): Promise<void> {
    await this.loginPage.emailInput.fill(email);
    await this.loginPage.passwordInput.fill(password);
    await this.loginPage.loginButton.click();
  }
}

export async function loginAndSaveStorageState(
  testUserKey: TestUserKey,
  testUser: TestUserData,
  browser: Browser,
) {
  const t = loadDictionary(locale(process.env.LOCALE as Locale));
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    const loginPage = new LoginPage(page, t);
    await loginPage.goto();

    const loginStep = new LoginStep(loginPage);
    await loginStep.loginByEmail(testUser.email, testUser.password);

    const dashboard = new Dashboard(page, t);
    await dashboard.expectLoaded();

    await page.context().storageState({ path: storagePath(testUserKey) });
  } finally {
    await context.close();
  }
}
```

- [ ] **Step 2: Verify typecheck**

```bash
npm run typecheck
```

Expected: one remaining error in `tests/login.spec.ts` about `usernameInput`. Fixed in Task 7.

- [ ] **Step 3: Commit**

```bash
git add tests/steps/login.step.ts
git commit -m "feat: replace loginByOtp with loginByEmail in login step"
```

---

## Task 7: Update login spec

**Files:**

- Modify: `tests/login.spec.ts`

Replace `usernameInput` with `emailInput` to match the renamed getter. Update the test description to reflect email-based login.

- [ ] **Step 1: Replace `tests/login.spec.ts`**

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

    await test.step("Login button is disabled when only email is filled in", async () => {
      await loginPage.emailInput.fill("test@example.com");
      await expect(loginPage.loginButton).toBeDisabled();
    });

    await test.step("Login button is disabled when only password is filled in", async () => {
      await loginPage.emailInput.clear();
      await loginPage.passwordInput.fill("password");
      await expect(loginPage.loginButton).toBeDisabled();
    });

    await test.step("Login button is enabled when email and password filled in", async () => {
      await loginPage.emailInput.fill("test@example.com");
      await expect(loginPage.loginButton).toBeEnabled();
    });
  });
});
```

- [ ] **Step 2: Verify typecheck passes cleanly**

```bash
npm run typecheck
```

Expected: **zero errors**.

- [ ] **Step 3: Commit**

```bash
git add tests/login.spec.ts
git commit -m "test: update login spec to use emailInput and shop locators"
```

---

## Task 8: Update cookies setup

**Files:**

- Modify: `tests/setup/cookies.setup.ts`

The current setup navigates to `"/"` via `LoginPage.goto()` then calls `loginPage.expectLoaded()` — which waits for `#field-email`, a locator that only exists on the login page, not the homepage. In the shop, `"/"` is the homepage. Update cookies setup to navigate to `"/"` directly (no page object needed for this step), and only use `LoginPage` for the cookie button locator.

- [ ] **Step 1: Replace `tests/setup/cookies.setup.ts`**

```typescript
import { test, expect } from "@playwright/test";
import { getTestUsers, storagePath } from "@/tests/testdata/testUsers";
import { LoginPage } from "@/tests/pages/login/LoginPage";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";

test("Accept cookies", async ({ page }) => {
  const t = loadDictionary(locale(process.env.LOCALE as Locale));
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  const loginPage = new LoginPage(page, t);
  const accept = loginPage.acceptCookiesButton;
  try {
    await accept.waitFor({ state: "visible", timeout: 10_000 });
    await accept.click();
    await expect(accept).toBeHidden({ timeout: 10_000 });
  } catch {
    console.log("Cookies banner not found");
  }

  const testUsers = getTestUsers();
  for (const user of Object.keys(testUsers) as Array<keyof typeof testUsers>) {
    const file = storagePath(user);
    await page.context().storageState({ path: file });
  }
  await page.context().storageState({ path: storagePath("nouser") });
});
```

- [ ] **Step 2: Verify typecheck**

```bash
npm run typecheck
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add tests/setup/cookies.setup.ts
git commit -m "fix: cookies setup navigates to homepage directly, not via login page"
```

---

## Task 9: Add HOMEPAGE to TestGroup

**Files:**

- Modify: `helpers/testGroups.ts`

- [ ] **Step 1: Update `helpers/testGroups.ts`**

```typescript
export const TestGroup = {
  ACCOUNTS: "@accounts",
  PAYMENTS: "@payments",
  LOGIN: "@login",
  NO_USER: "@nouser",
  HOMEPAGE: "@homepage",
} as const;
```

- [ ] **Step 2: Verify typecheck**

```bash
npm run typecheck
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add helpers/testGroups.ts
git commit -m "chore: add HOMEPAGE test group"
```

---

## Task 10: Create HomePage and homepage spec (TDD)

**Files:**

- Create: `tests/homepage.spec.ts`
- Create: `tests/pages/home/HomePage.ts`

Write the failing spec first, then create the page object to make it pass.

### Step A: Write the failing spec

- [ ] **Step 1: Create `tests/homepage.spec.ts`**

```typescript
import { test, expect } from "@playwright/test";
import { HomePage } from "@/tests/pages/home/HomePage";
import { TestGroup } from "@/helpers/testGroups";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";

test.describe("Homepage tests", () => {
  test(`${TestGroup.HOMEPAGE} ${TestGroup.NO_USER} Homepage loads with key navigation elements`, async ({
    page,
  }) => {
    const t = loadDictionary(locale(process.env.LOCALE as Locale));
    const homePage = new HomePage(page, t);
    await homePage.goto();
    await homePage.expectLoaded();

    await test.step("Logo is visible", async () => {
      await expect(homePage.logo).toBeVisible();
    });

    await test.step("Search input is visible", async () => {
      await expect(homePage.searchInput).toBeVisible();
    });

    await test.step("Login link is visible", async () => {
      await expect(homePage.loginLink).toBeVisible();
    });

    await test.step("Clothes nav link is visible", async () => {
      await expect(homePage.clothesNavLink).toBeVisible();
    });

    await test.step("Accessories nav link is visible", async () => {
      await expect(homePage.accessoriesNavLink).toBeVisible();
    });

    await test.step("Art nav link is visible", async () => {
      await expect(homePage.artNavLink).toBeVisible();
    });
  });
});
```

- [ ] **Step 2: Verify typecheck fails on missing import**

```bash
npm run typecheck
```

Expected: error — `Cannot find module '@/tests/pages/home/HomePage'`.

### Step B: Create the page object

- [ ] **Step 3: Create `tests/pages/home/HomePage.ts`**

```typescript
import type { Locator, Page } from "@playwright/test";
import type { Texts } from "@/i18n";

export class HomePage {
  constructor(
    private readonly page: Page,
    private readonly _t: Texts,
  ) {}

  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  async expectLoaded(): Promise<void> {
    await this.logo.waitFor({ state: "visible", timeout: 30_000 });
  }

  get logo(): Locator {
    return this.page.locator(".logo");
  }

  get searchInput(): Locator {
    return this.page.locator('input[name="s"]');
  }

  get loginLink(): Locator {
    return this.page.locator(".user-info a").first();
  }

  get clothesNavLink(): Locator {
    return this.page.locator('a[href*="3-clothes"]').first();
  }

  get accessoriesNavLink(): Locator {
    return this.page.locator('a[href*="6-accessories"]').first();
  }

  get artNavLink(): Locator {
    return this.page.locator('a[href*="9-art"]').first();
  }
}
```

- [ ] **Step 4: Verify typecheck passes**

```bash
npm run typecheck
```

Expected: zero errors.

- [ ] **Step 5: Run the homepage spec against the live site**

```bash
npx playwright test tests/homepage.spec.ts --headed
```

Expected: all steps pass. If a locator fails, inspect the element in the browser and update the selector.

- [ ] **Step 6: Commit**

```bash
git add tests/pages/home/HomePage.ts tests/homepage.spec.ts
git commit -m "feat: add HomePage page object and homepage spec"
```

---

## Task 11: Run the login spec and full suite

- [ ] **Step 1: Run login spec**

```bash
npx playwright test tests/login.spec.ts --headed
```

Expected: 4 steps pass — button disabled by default, disabled with email only, disabled with password only, enabled when both filled.

- [ ] **Step 2: Run full test suite**

```bash
npm test
```

Expected: `homepage.spec.ts` and `login.spec.ts` pass. No compilation errors.

- [ ] **Step 3: Run lint and format check**

```bash
npm run lint
npm run format
```

Expected: no errors, no diffs.

- [ ] **Step 4: Final commit if any lint/format fixes were applied**

```bash
git add -A
git commit -m "chore: apply lint and format fixes"
```

---

## Post-Implementation Notes

- `SHOP_PASSWORD` must be set as a system environment variable before running any authenticated test. The operator has already done this.
- `loginAndSaveStorageState` in `login.step.ts` exists for future authenticated tests (e.g. checkout, account page). It is not called during this slice.
- The `@shopTestsUser` Playwright project is now in the matrix (generated automatically from the user key). Authenticated tests should use this tag.
- Future slices: add `CategoryPage`, `ProductPage`, `CartPage` following the same 3-layer pattern.
