# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Branch policy:** Never push directly to `main`. All changes go through a feature branch and a pull request. Only the repository owner merges PRs to `main`.

> For the full reference guide see [AGENTS.md](./AGENTS.md).

---

## Commands

```bash
npm test                                         # run all tests
npx playwright test tests/login.spec.ts          # single file
npx playwright test --grep "Login button"        # by title substring
npx playwright test --grep "@payments"           # by tag
npx playwright test --project ACC               # by Playwright project (user)
ENVIRONMENT=int npx playwright test             # specific environment
npx playwright test --headed                    # headed mode
npx playwright test --ui                        # Playwright UI mode

npm run lint       # ESLint
npm run format     # Prettier
npm run typecheck  # tsc --noEmit
```

Pre-commit hooks (Husky + lint-staged) auto-run `prettier --write` then `eslint --cache` on staged `.ts`/`.js` files.

---

## Architecture

Strict **3-layer** separation:

```
tests/*.spec.ts           — test orchestration only; no assertions outside test.step()
tests/steps/*.step.ts     — business logic, multi-step flows, all expect() calls
tests/pages/**/*.ts       — UI map only; locators + atomic click/fill actions
tests/pages/components/   — reusable sub-page components
```

Supporting layers:

```
config/          — environment.ts (env validation), locale.ts
helpers/         — testGroups.ts
i18n/            — schema.ts, cs.ts, en.ts, index.ts (loadDictionary)
tests/setup/     — cookies.setup.ts, storageState.setup.ts (run before user tests)
tests/testdata/  — test user schemas + per-environment data (acc.ts, int.ts)
```

---

## Key Patterns

**Tests** — import `test`/`expect` from `@playwright/test`. Load the i18n dictionary once per test and pass to page objects:

```typescript
import { test, expect } from "@playwright/test";
import { LoginPage } from "@/tests/pages/login/LoginPage";
import { TestGroup } from "@/helpers/testGroups";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";

test.describe("Login tests", () => {
  test(`${TestGroup.LOGIN} ${TestGroup.NO_SESSION} Login button enabling`, async ({
    page,
  }) => {
    const t = loadDictionary(locale(process.env.LOCALE as Locale));
    const loginPage = new LoginPage(page, t);
    await loginPage.goto();
    await loginPage.expectLoaded();

    await test.step("Login button is disabled by default", async () => {
      await expect(loginPage.loginButton).toBeDisabled();
    });
  });
});
```

For authenticated tests use a plain `test.describe` with the `@userKey` tag in the title — the Playwright project matrix routes tests to the right user project by matching that tag.

**Page Objects** take `(page: Page, t: Texts)`. Locators are `get` properties returning `Locator`. Every navigable page implements `goto()` and `expectLoaded()`. Import `Texts` from `@/i18n`.

**Steps** (`tests/steps/*.step.ts`) hold multi-step business logic and `expect()` calls. Instantiate page objects in the constructor.

**i18n** — `loadDictionary(locale)` from `@/i18n` returns the translation dictionary for the current locale. Add new keys to `i18n/schema.ts` first, then implement in `i18n/cs.ts` and `i18n/en.ts`.

**Environments** — set via `ENVIRONMENT` env var (`acc`/`int`). URLs in `.env.acc` / `.env.int`. Use `process.env.PAGE_NAME_URL!` in Page Objects.

---

## TypeScript & Import Conventions

- Strict mode: `strict`, `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`.
- `verbatimModuleSyntax: true` — use `import type` for type-only imports.
- Prefer `as const` objects over enums; derive types with `(typeof X)[keyof typeof X]`.
- Prefer `satisfies` over explicit annotation when you want the widest inferred type.
- Use `@/` path alias for all project imports (exception: `playwright.config.ts` must use relative imports).
- ESM only — `import`/`export`, never `require()`. Node built-ins use `node:` prefix.
- Double quotes, 2-space indent, trailing commas everywhere (matches Prettier config).

---

## Playwright Conventions

### Locator strategy

Prefer in this order:

1. `getByRole` — most robust; matches accessible semantics
2. `getByLabel` — for form fields with visible labels
3. `getByText` — for visible text content; use `exact: true` when needed
4. `getByTestId` — when a `data-testid` attribute exists and nothing else is reliable
5. Stable framework IDs (e.g. `#field-email`, `#field-password` in PrestaShop) — acceptable when the app does not expose semantic roles
6. CSS attribute selectors (`[name="s"]`, `[href*="clothes"]`) — last resort; document why no better option exists
7. XPath — avoid entirely unless there is absolutely no alternative

When a locator uses user-visible text, always pull the string from the i18n dictionary (`t.xxx`) so it stays locale-correct:

```typescript
// Good
this.page.getByRole("button", { name: this.t.loginPage.cookies.accept });

// Bad — hardcoded string breaks on locale switch
this.page.getByRole("button", { name: "Souhlasím" });
```

### Assertion strategy

- Use web-first assertions (`toBeVisible`, `toBeEnabled`, `toHaveText`, `toHaveURL`, etc.) — Playwright retries them automatically until the timeout.
- Never use `waitForTimeout`. Replace with a web-first assertion that expresses what you are actually waiting for.
- Never poll with a loop. Use `expect.poll` if you genuinely need custom polling.
- Keep assertion messages meaningful: `expect(el, "Login button should be disabled before input").toBeDisabled()`.
- One logical thing per `test.step`. Steps appear in traces and reports — name them so a failure is self-diagnosing.

```typescript
// Good
await expect(loginPage.loginButton).toBeDisabled();

// Bad — hides real wait intent, breaks on slow CI
await page.waitForTimeout(2000);
expect(await loginPage.loginButton.isDisabled()).toBe(true);
```

### Test isolation

- Every test must be runnable in isolation and in any order.
- Do not share mutable state between tests via module-level variables.
- Prefer storage state (already set up via `tests/setup/`) over logging in through the UI in every test.
- When a test needs specific server-side state, set it up via API calls before navigating to the UI. Avoid driving long setup flows through the browser.
- Use `test.beforeEach` for page navigation that every test in the describe block needs; avoid duplicating `goto()` calls.

### Anti-patterns to avoid

| Anti-pattern                                             | Use instead                                                             |
| -------------------------------------------------------- | ----------------------------------------------------------------------- |
| `page.waitForTimeout(n)`                                 | Web-first assertion expressing the expected state                       |
| `page.locator(".some-class")` for interactive elements   | `getByRole` / `getByLabel`                                              |
| `expect(await locator.isVisible()).toBe(true)`           | `expect(locator).toBeVisible()`                                         |
| Assertions directly in `*.spec.ts` (outside `test.step`) | Move to `tests/steps/*.step.ts`                                         |
| Locator defined inside a method body                     | `get` property on the page object class                                 |
| Test that depends on another test having run first       | Independent test with its own setup                                     |
| Retrying a flaky step with a loop                        | Fix the root cause; use `retries` in `playwright.config.ts` for CI only |

### Debugging artifacts

The config already captures:

- **Traces** — `trace: "on-first-retry"` (open with `npx playwright show-trace`)
- **Videos** — `video: "retain-on-failure"`
- **Screenshots** — `screenshot: "only-on-failure"`

When a test is flaky, run it with `--trace on` locally:

```bash
npx playwright test tests/login.spec.ts --trace on
npx playwright show-trace test-results/<run>/trace.zip
```

Check the network tab in the trace for unexpected 4xx/5xx responses before assuming the locator is wrong.
