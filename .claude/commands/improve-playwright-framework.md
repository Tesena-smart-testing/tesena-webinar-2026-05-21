# Improve Playwright Framework

Use this command when the test infrastructure itself needs work: fixtures, config, test data, helpers, reporting, or project structure.

**Agent:** `playwright-framework-maintainer`

---

## When to use

- You want to add a Playwright fixture to reduce test setup boilerplate
- `playwright.config.ts` needs updating (new project, timeout change, artifact config)
- You need to add a new test user or environment
- The `.auth/` storage state setup is causing problems
- You want to add an API helper for test data setup
- You want to improve how traces, videos, or screenshots are captured
- You are upgrading `@playwright/test` or other dependencies

## Expected input

Provide:

- A description of the problem or improvement: "Every authenticated test repeats the same storage state setup — I want a fixture for it"
- The files involved if known: `playwright.config.ts`, `tests/setup/storageState.setup.ts`
- Any constraints: "Must stay backward compatible with existing tests"

## What Claude will do

1. Read `playwright.config.ts` fully
2. Read the relevant setup, testdata, config, and helper files
3. Identify what already exists before proposing anything new
4. Apply `playwright-framework-maintainer` principles (YAGNI, backward compatible)
5. Produce minimal, targeted changes

## Expected output

- The exact files to change with before/after diffs
- An explanation of why the change helps
- A note on any tests that need updating as a result
- Validation commands to run

## Constraints

- Do not add abstractions no current test needs
- Do not require rewriting all existing tests as part of an infrastructure change
- Do not commit `.auth/` files (they are gitignored)
- When adding a test user, add to both `acc.ts` (TEST) and `int.ts` (PROD)
- New fixtures go in `tests/fixtures/` and are imported via `@/tests/fixtures`

## Validation

After any framework change:

```bash
npm run typecheck
npm run lint
npm test
```

All existing tests must still pass.
