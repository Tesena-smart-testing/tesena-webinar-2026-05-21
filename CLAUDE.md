# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
  test(`${TestGroup.LOGIN} ${TestGroup.NO_USER} Login button enabling`, async ({
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
