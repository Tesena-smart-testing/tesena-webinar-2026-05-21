# Write Playwright Test

Use this command when you need to write a new Playwright test or add test cases to an existing spec file.

**Agent:** `playwright-test-writer`

---

## When to use

- You have a feature, user story, or bug report and need a corresponding automated test
- You have a coverage proposal from `/design-playwright-coverage` and want to implement it
- You want to add more scenarios to an existing spec file

## Expected input

Provide one or more of:

- A description of the feature or user flow to test
- A user story or acceptance criteria
- A bug report describing what should be verified
- A specific scenario: "Test that logged-in users see their order history on the account page"
- An existing coverage proposal from playwright-test-architect

## What Claude will do

1. Read the relevant existing spec, step, and page object files
2. Read `helpers/testGroups.ts` for tag conventions
3. Read `i18n/schema.ts` to identify available text keys
4. Apply the `playwright-test-writer` agent rules
5. Produce the minimal set of files needed

## Expected output

- A new or updated `tests/*.spec.ts` file
- Any new `tests/pages/**/*.ts` page objects required
- Any additions to `tests/steps/*.step.ts`
- Any new i18n keys (`i18n/schema.ts`, `i18n/cs.ts`, `i18n/en.ts`)
- Flags for any missing `TestGroup` constants or environment variables

## Constraints

- Do not write assertions inside `*.spec.ts` — all `expect()` calls go in step files
- Do not use `waitForTimeout`
- Do not hardcode Czech or English strings — use `t.xxx` from the i18n dictionary
- Prefer `getByRole` / `getByLabel` / `getByText` over CSS selectors
- Every test must include at least one `TestGroup` tag
- Tag authenticated tests with the relevant user key (e.g. `@shopTestsUser`)

## Validation

After writing, run:

```bash
npm run typecheck
npm run lint
npx playwright test <new-spec-file> --headed
```
