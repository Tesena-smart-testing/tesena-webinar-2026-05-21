# Design: Simplify Framework Architecture

**Date:** 2026-05-20  
**Branch:** `feat/simplify-architecture`  
**Goal:** Remove the page factory, custom test extension, components layer, and i18n system to produce a clear, self-contained starting point for the webinar.

---

## Motivation

The current framework has several layers of indirection (fixture extension, generic factory, i18n dictionary threading, sub-components) that obscure the core Playwright patterns. Removing them produces tests that read top-to-bottom without requiring knowledge of the fixture system or the factory pattern.

---

## Files Deleted

| File                                       | Reason                                                |
| ------------------------------------------ | ----------------------------------------------------- |
| `helpers/pageFactory.ts`                   | The factory abstraction itself                        |
| `fixtures/test.fixture.ts`                 | Custom `test` extension with all worker/test fixtures |
| `fixtures/user.fixture.ts`                 | `describeAsUser` wrapper depending on custom fixture  |
| `i18n/schema.ts`                           | i18n type schema                                      |
| `i18n/cs.ts`                               | Czech translations                                    |
| `i18n/en.ts`                               | English translations                                  |
| `i18n/index.ts`                            | `loadDictionary` function                             |
| `tests/pages/components/Menu.ts`           | Unused stub component                                 |
| `tests/pages/login/components/SmsLogin.ts` | Login sub-component                                   |
| `tests/pages/login/components/OtpLogin.ts` | Login sub-component                                   |

---

## Page Objects

All five page objects (`LoginPage`, `Dashboard`, `AccountsPage`, `BatchPaymentPage`, `SinglePaymentPage`) are simplified:

- Constructor changes from `(page: Page, t: Texts)` → `(page: Page)`
- `this.t.*` selector strings replaced with hardcoded literals or Playwright `getByRole`/`getByLabel` locators
- `Dashboard` loses its `Menu` component getter (component deleted)

---

## Steps

**`LoginStep`** (`tests/steps/login.step.ts`):

- `loginBySms()` and `loginByOtp()` are removed (they returned now-deleted component objects)
- Replaced by a single `loginByOtp(username, password, token)` that interacts with OTP fields inline
- `fillCredentialsClickLogin()` stays unchanged

**`loginAndSaveStorageState`**:

- Loses the `texts: Texts` parameter
- OTP interaction is inlined directly instead of delegating to the deleted `OtpLogin` component
- `expectPage` factory call removed; replaced with direct `Dashboard` instantiation + `expectLoaded()`

---

## Spec Files

**`login.spec.ts`**:

- Import changes: `@/fixtures/test.fixture` → `@playwright/test`
- `loginPage` fixture replaced with manual setup:
  ```typescript
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.expectLoaded();
  ```

**`accounts.spec.ts`** / **`payments.spec.ts`**:

- `describeAsUser()` replaced with a plain `test.describe` block containing the `@userKey` tag
- `gotoAccountsPage()` / `gotoSinglePaymentPage()` / `gotoBatchPaymentPage()` fixture calls replaced with direct instantiation + `goto()` + `expectLoaded()`
- Auth storage state continues to flow automatically from `playwright.config.ts` (no changes to config)

---

## What Does Not Change

- `playwright.config.ts` — project matrix, storage state paths, setup dependencies
- `tests/setup/cookies.setup.ts` — cookie acceptance setup
- `tests/setup/storageState.setup.ts` — reads from env, instantiates pages directly (already simple)
- `tests/testdata/` — test user schemas and per-environment data
- `config/environment.ts`, `config/locale.ts` — env/locale validation
- `helpers/testGroups.ts` — test group tag constants
- `errors/` — custom error classes
- `tsconfig.json`, `eslint.config.mjs`, `prettier.config.mjs` — tooling config
- The `@/` path alias (still valid, still used)

---

## CLAUDE.md

Updated to reflect the simplified architecture: remove references to the fixture system, page factory, i18n threading, and components. Update the patterns section to show direct Page Object instantiation.

---

## Success Criteria

- `npm run typecheck` passes with zero errors
- `npm run lint` passes with zero errors
- Spec files import `test`/`expect` from `@playwright/test` only
- No file imports from `@/fixtures/*` or `@/helpers/pageFactory`
- No file imports from `@/i18n/*`
- Page Object constructors all take `(page: Page)` only
