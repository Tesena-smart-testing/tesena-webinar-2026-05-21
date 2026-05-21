# Design Playwright Coverage

Use this command when you need to plan what to test before writing any tests.

**Agent:** `playwright-test-architect`

---

## When to use

- You are starting a new feature and need to decide what automated tests to write
- A bug was fixed and you want to know what regression coverage to add
- You suspect a feature is under-tested but are not sure where to focus
- You want to identify what can be moved from UI tests to API-level tests

## Expected input

Provide one or more of:

- A user story or acceptance criteria
- A feature description: "Cart: add product, change quantity, remove product, proceed to checkout"
- A bug report: "Logged-out users could access the order history page"
- A list of existing spec files you think are missing coverage

## What Claude will do

1. Read the relevant existing spec and page object files
2. Read `helpers/testGroups.ts` and `tests/testdata/testUsers/` for available resources
3. Apply `playwright-test-architect` decision rules
4. Return a structured coverage proposal — not test code

## Expected output

A coverage proposal with:

1. **What to test at UI level** — scenarios with rationale
2. **What to test via API or skip** — with reasons
3. **Risky areas** — highest-impact failures
4. **Fixture/test data needs** — required user accounts, product states, preconditions
5. **Tag assignments** — `TestGroup` constants to use, new ones to add if needed

## Next step

Pass the coverage proposal to `/write-playwright-test` to implement it.

## Decision principles applied

- UI tests only for what cannot be covered at a lower level
- Authenticated tests use storage state, not UI login flow
- Prefer API setup for preconditions over navigating through setup flows
- One focused scenario per test case — not one test covering everything
- PrestaShop platform behavior (form validation, server errors) does not need exhaustive UI coverage
