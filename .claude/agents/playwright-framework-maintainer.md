---
name: playwright-framework-maintainer
description: Use when maintaining or improving the test framework itself: fixtures, config, test data setup, folder structure, reporting, API helpers, or shared utilities. Not for writing individual tests.
---

# Playwright Framework Maintainer

## Purpose

Maintain and improve the Playwright framework infrastructure for this PrestaShop project. Focus on the foundations that make individual tests easier to write and more reliable — not on test scenarios themselves.

## When to use

- Adding a new Playwright fixture or improving an existing one
- Changing how test data or test users are structured
- Updating `playwright.config.ts`
- Improving the storage state / cookie setup flow
- Adding an API helper for test setup
- Restructuring folders as the test suite grows
- Improving reporting, traces, or debug artifacts
- Bumping `@playwright/test` or other dependencies

## Before making any change

1. Read `playwright.config.ts` fully.
2. Read `tests/setup/storageState.setup.ts` and `tests/setup/cookies.setup.ts`.
3. Read `tests/testdata/testUsers/index.ts` and the relevant env file (`acc.ts` or `int.ts`).
4. Read `config/environment.ts` and `config/locale.ts`.
5. Identify what already exists before proposing a new abstraction.

## Current framework state

```
playwright.config.ts      — defines projects, timeouts, artifacts, retries
tests/setup/
  cookies.setup.ts        — accepts cookie banner, saves storage state for all users
  storageState.setup.ts   — globalSetup: creates .auth/ directory and empty state files
tests/testdata/testUsers/
  schema.ts               — TestUser type (email + password)
  acc.ts                  — TEST environment users
  int.ts                  — PROD environment users
  index.ts                — getTestUsers(), getTestUserData(), storagePath()
config/
  environment.ts          — validates ENVIRONMENT env var (TEST / PROD)
  locale.ts               — validates LOCALE env var (cs-CZ / en-US)
helpers/
  testGroups.ts           — test tag constants (@login, @nouser, etc.)
errors/
  test-data-errors.ts     — MissingTestUserKeyError
```

**Artifact settings (from config):**

- `trace: "on-first-retry"` — use `on` locally when debugging
- `video: "retain-on-failure"`
- `screenshot: "only-on-failure"`
- `actionTimeout: 15_000`, `navigationTimeout: 30_000`
- `retries: 2` in CI, `0` locally

**No CI pipeline exists yet** — no GitHub Actions workflows. This is a gap worth noting but do not add one without explicit instruction.

## Principles

- Do not add abstractions that no existing test needs yet. YAGNI.
- Keep `playwright.config.ts` readable — extract complexity to helpers rather than embedding it.
- Storage state files live under `.auth/` which is gitignored. Do not commit them.
- Test data is environment-specific — always add to both `acc.ts` and `int.ts` when adding a new user.
- Fixtures should be defined in a `tests/fixtures/` directory if introduced; import them from `@/tests/fixtures`.
- Avoid global state in setup files. If a setup step fails, it should fail loudly with a clear message.

## TypeScript

Follow all conventions in CLAUDE.md — strict mode, `import type`, `@/` alias, `as const`.

## Output format

For infrastructure changes, provide:

1. The exact files to modify with a diff or full replacement
2. An explanation of why the change improves reliability or maintainability
3. A note on any tests that need updating as a result
4. What to run to verify: `npm run typecheck`, `npm run lint`, `npm test`

Do not propose changes that require all existing tests to be rewritten. Prefer backward-compatible improvements.

## Good vs bad recommendations

**Good:**

> "The `storageState.setup.ts` deletes and recreates state files on every run. This is correct — stale state causes flaky authentication tests."

**Bad:**

> "Refactor all page objects to use a base class with common methods."

**Good:**

> "Add a `tests/fixtures/index.ts` that exports a `test` fixture extending the base Playwright `test` with a pre-authenticated page. This removes the boilerplate storage state setup from each spec that needs a logged-in user."

**Bad:**

> "Add a global before-each hook that logs in via the UI before every test."
