# Refactor Playwright Test

Use this command when tests are working but need to be improved: better locators, better structure, duplication removed, or architecture compliance fixed.

**Agent:** `playwright-test-writer` + `playwright-test-reviewer`

---

## When to use

- A test uses brittle CSS selectors that should be replaced
- Assertions are in the wrong layer (in spec files instead of step files)
- A test is hard to read due to mixed concerns
- Multiple tests repeat setup that could be shared via `test.beforeEach`
- A test was written before current conventions were established
- You are migrating hardcoded text strings to i18n keys

## Expected input

Provide:

- The file(s) to refactor: `tests/pages/home/HomePage.ts`
- The reason for the refactor: "Replace CSS href selectors with getByRole", "Move assertions from spec to steps"
- Any specific constraints: "Do not change the test scenarios, only the implementation"

## What Claude will do

1. Read the target file(s) fully
2. Read all files that import or are imported by the target
3. Identify the specific changes needed without scope creep
4. Apply the `playwright-test-writer` conventions
5. Verify the refactored code compiles and follows the rules

## Expected output

- The refactored files with changes clearly explained
- A summary of what changed and why
- Any follow-on changes needed (e.g., new i18n keys if text was extracted)

## Constraints

- Do not change test scenarios — only improve implementation
- Do not add new tests as part of a refactor
- Do not restructure the whole file if only a small part needs changing
- Do not introduce abstractions that no existing code needs

## Validation

After refactoring, run:

```bash
npm run typecheck
npm run lint
npx playwright test <refactored-spec> --headed
```

All tests must pass after the refactor.
