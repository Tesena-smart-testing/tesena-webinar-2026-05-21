# Review Playwright Test

Use this command when you want a code review of a Playwright test, page object, or step file before merging.

**Agent:** `playwright-test-reviewer`

---

## When to use

- Before merging a new test or updating an existing one
- When you want to check if a test will be flaky before it gets the chance to fail in CI
- When a test has been failing and you want a second opinion on the fix
- When reviewing a PR that touches `tests/` files

## Expected input

Provide one or more of:

- A file path: `tests/login.spec.ts`
- A file path with line range: `tests/steps/cart.step.ts:45-90`
- A paste of the test code
- A PR description of what changed

## What Claude will do

1. Read the provided test file fully
2. Read any page objects and step files the test imports
3. Check `playwright.config.ts` for timeout and retry configuration
4. Apply all `playwright-test-reviewer` checks
5. Return a structured review

## Expected output

A review with:

1. **Summary** — pass / pass with minor issues / needs changes
2. **Blockers** — must-fix issues with file:line references and corrected code
3. **Suggestions** — improvements that are not blockers
4. **Approved patterns** — things done well

## Review checklist applied

- Locator quality (role-based vs brittle CSS)
- i18n key usage (no hardcoded text strings)
- Web-first assertions (no `waitForTimeout`, no `isVisible()` boolean checks)
- Architecture compliance (assertions in steps, not specs)
- Test isolation (no inter-test dependencies)
- Tag coverage (`@nouser`, `@shopTestsUser`, etc.)
- TypeScript conventions (`import type`, `@/` alias)
- Flaky patterns (implicit timing assumptions, missing `expectLoaded()`)
