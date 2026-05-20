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
fixtures/        — test.fixture.ts (custom test extension), user.fixture.ts
helpers/         — pageFactory.ts (gotoPage/expectPage), testGroups.ts
i18n/            — schema.ts, cs.ts, en.ts, index.ts (loadDictionary)
tests/setup/     — cookies.setup.ts, storageState.setup.ts (run before user tests)
tests/testdata/  — test user schemas + per-environment data (acc.ts, int.ts)
```

---

## Key Patterns

**Tests** — always import `test` from the custom fixture:

```typescript
import { test } from "@/fixtures/test.fixture";
import { TestGroup } from "@/helpers/testGroups";

test(`${TestGroup.LOGIN} ${TestGroup.NO_USER} Login button enabling`, async ({
  loginPage,
}) => {
  await test.step("Login button is disabled by default", async () => {
    await expect(loginPage.loginButton).toBeDisabled();
  });
});
```

For authenticated tests use `describeAsUser()` from `@/fixtures/user.fixture`.

**Page Objects** must implement `goto()` and `expectLoaded()` (required by `gotoPage()` factory). Locators are `get` properties returning `Locator`. No assertions, no business logic, no hardcoded text.

**i18n** — all UI strings come from the `t: Texts` fixture. Add to `i18n/schema.ts` first, then implement in `cs.ts` and `en.ts`.

**Environments** — set via `ENVIRONMENT` env var (`acc`/`int`). URLs live in `.env.acc` / `.env.int`. Never hardcode URLs; use `process.env.PAGE_NAME_URL!`.

---

## TypeScript & Import Conventions

- Strict mode: `strict`, `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`.
- `verbatimModuleSyntax: true` — use `import type` for type-only imports.
- Prefer `as const` objects over enums; derive types with `(typeof X)[keyof typeof X]`.
- Prefer `satisfies` over explicit annotation when you want the widest inferred type.
- Use `@/` path alias for all project imports (exception: `playwright.config.ts` must use relative imports).
- ESM only — `import`/`export`, never `require()`. Node built-ins use `node:` prefix.
- Double quotes, 2-space indent, trailing commas everywhere (matches Prettier config).
