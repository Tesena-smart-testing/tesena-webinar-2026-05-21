# Debug Flaky Test

Use this command when a test is failing, timing out, or passing inconsistently.

**Agent:** `playwright-flaky-debugger`

---

## When to use

- A test that previously passed is now failing
- A test passes locally but fails in CI
- A test is intermittently passing/failing without obvious cause
- A test is timing out

## Expected input

Provide as much of the following as available:

1. **Error message and stack trace** — paste from terminal output
2. **Test file path** — e.g. `tests/login.spec.ts`
3. **Trace file** — run `npx playwright show-trace test-results/<run>/trace.zip` and describe what you see, or share the trace path
4. **Environment** — TEST or PROD, locale (cs-CZ / en-US), local or CI
5. **When it started failing** — after a code change? after a dependency update? randomly?

To capture a trace locally:

```bash
npx playwright test tests/your.spec.ts --trace on
npx playwright show-trace test-results/<folder>/trace.zip
```

## What Claude will do

1. Read the failing test file, its step files, and its page objects
2. Analyze the error message and any provided context
3. Follow the `playwright-flaky-debugger` diagnosis process
4. Distinguish product bug from test bug from environment issue
5. Propose a minimal fix — no `waitForTimeout`, no retries to mask the problem

## Expected output

A structured diagnosis:

1. **Root cause** — one sentence
2. **Evidence** — what supports the conclusion
3. **Fix** — before/after code
4. **How to verify** — exact command
5. **Classification** — Product bug / Test bug / Environment issue / Timing issue

## What will not be suggested

- `waitForTimeout` as a fix
- Increasing `retries` to hide the problem
- Loosening assertions to make failures disappear
- `{ force: true }` on interactions without explanation
