# Playwright Testing Standards

Practical standards for writing and maintaining Playwright tests in this PrestaShop automation project.

---

## Test design principles

- **One scenario per test.** Each test verifies one behavior. If you have "add to cart AND verify total AND proceed to checkout" in one test, that is three tests.
- **Independent tests.** Every test must pass in isolation and in any order. Tests that depend on each other fail unpredictably.
- **Focused spec files.** One feature area per spec file. `cart.spec.ts` tests cart behavior; it does not also test login.
- **Failures must be self-diagnosing.** Step names, assertion messages, and traces should tell you immediately what went wrong without reading source code.
- **Test what matters.** This is a PrestaShop instance. The platform handles most business logic. Focus on: integration points, user-facing flows, and areas where configuration or customization could break.

---

## Locator strategy

Priority order — use the first option that works:

| Priority | Method                                 | When                                             |
| -------- | -------------------------------------- | ------------------------------------------------ |
| 1        | `getByRole('button', { name: t.xxx })` | Interactive elements with semantic roles         |
| 2        | `getByLabel(t.xxx)`                    | Form fields with visible labels                  |
| 3        | `getByText(t.xxx, { exact: true })`    | Visible text content                             |
| 4        | `getByTestId('...')`                   | When `data-testid` attribute exists              |
| 5        | `locator('#field-email')`              | Stable PrestaShop framework IDs (acceptable)     |
| 6        | `locator('[name="s"]')`                | Attribute selectors (last resort, add a comment) |
| 7        | XPath                                  | Avoid entirely                                   |

**Always use i18n keys for text-based locators.** Never hardcode Czech or English strings:

```typescript
// Correct
this.page.getByRole("button", { name: this.t.loginPage.cookies.accept });

// Wrong — breaks when locale is switched
this.page.getByRole("button", { name: "Souhlasím" });
```

Locators that change when the URL structure changes (e.g. `a[href*="3-clothes"]`) are fragile. Replace with role-based selectors when possible. If a stable selector does not exist, add a `data-testid` to the application or document why the URL-based selector is the only option.

---

## Assertion strategy

**Use web-first assertions.** They retry automatically until the timeout, making tests resilient to minor timing variations without fake waits.

```typescript
// Correct — retries until visible or timeout
await expect(page.getByRole("heading")).toBeVisible();

// Wrong — snapshot of current state, no retry
expect(await page.getByRole("heading").isVisible()).toBe(true);
```

**Never use `waitForTimeout`.** Replace every occurrence with a web-first assertion that expresses what you are waiting for:

```typescript
// Wrong
await page.waitForTimeout(3000);
await cartStep.verifyItemAdded();

// Correct
await expect(cartPage.successMessage).toBeVisible();
await cartStep.verifyItemAdded();
```

**Write assertion messages** for non-obvious failures:

```typescript
await expect(
  loginPage.loginButton,
  "Login button should be enabled after filling email",
).toBeEnabled();
```

**Default timeouts** (from `playwright.config.ts`):

- Action timeout: 15 seconds
- Navigation timeout: 30 seconds
- Assertion timeout: 15 seconds

These are already configured. Do not override them in individual tests unless there is a documented reason.

---

## Architecture: 3-layer separation

```
tests/*.spec.ts           — orchestration only
tests/steps/*.step.ts     — all expect() calls; business logic
tests/pages/**/*.ts       — locators + atomic UI actions only
```

**Spec files** contain: `test.describe`, `test(...)`, `test.step(...)`, page object instantiation, and step method calls. No `expect()` outside of `test.step`.

**Step files** contain: all `expect()` calls, multi-step business logic, sequences of page actions that belong together. Step classes are instantiated in tests and take page objects as constructor arguments.

**Page objects** contain: `get` property locators, atomic `click`/`fill`/`goto`/`expectLoaded` methods, no assertions. Constructor takes `(page: Page, t: Texts)`.

Breaking this separation makes tests harder to debug. When a spec file has assertions, the failure location is hidden. When a page object has assertions, it is testing at the wrong level.

---

## Fixtures

There are no custom fixtures yet. If the same setup appears in three or more tests, introduce a fixture in `tests/fixtures/`.

The project uses Playwright's built-in fixture system for storage state:

- Setup project `setup:cookies` runs before user tests
- `storageState.setup.ts` (globalSetup) creates empty `.auth/` files
- User-specific projects inherit `storageState` from `.auth/ENV/userKey.json`

If you add a fixture:

- Put it in `tests/fixtures/index.ts`
- Export an extended `test` fixture
- Import it via `@/tests/fixtures` in spec files

---

## Test data

Test users are environment-specific:

```
tests/testdata/testUsers/
  acc.ts    — TEST environment users (http://37.27.17.198:8084)
  int.ts    — PROD environment users
  schema.ts — TestUser type (email + password)
  index.ts  — getTestUsers(), getTestUserData(), storagePath()
```

Rules:

- When adding a test user, add to both `acc.ts` and `int.ts`.
- Passwords are read from environment variables (`process.env.SHOP_PASSWORD`), not hardcoded.
- User keys (e.g. `shopTestsUser`) match the `@userKey` tag in test names.

For tests that need specific product states or order data, prefer API setup over UI setup. If the PrestaShop API supports creating the required state, do not drive through the admin UI in every test run.

---

## API-assisted setup

Setting up preconditions through the UI is slow and fragile. When possible:

1. Use the PrestaShop API to create the required state before the test navigates
2. Verify the state through the UI
3. Clean up via API in `test.afterEach` if the state is shared between tests

For simple cases where the UI is the only option (e.g., cookie acceptance), use the existing cookie setup project pattern.

---

## Page object guidance

Keep page objects thin:

- One class per page (or per significant component)
- Locators as `get` properties returning `Locator`
- Atomic actions only: `fill`, `click`, `goto`, `expectLoaded`
- No business logic — that belongs in step files
- No assertions — those belong in step files

`expectLoaded()` should wait for the most stable indicator that the page is ready. Use `waitFor({ state: 'visible', timeout: 30_000 })` on a reliable element, not `waitForLoadState`.

```typescript
// Good
async expectLoaded(): Promise<void> {
  await this.emailInput.waitFor({ state: "visible", timeout: 60_000 });
}

// Risky — DOMContentLoaded fires before React/Vue renders in SPAs
async expectLoaded(): Promise<void> {
  await this.page.waitForLoadState("domcontentloaded");
}
```

---

## Debugging flaky tests

When a test fails:

1. Run with `--trace on` to capture full timeline:

   ```bash
   npx playwright test tests/your.spec.ts --trace on
   npx playwright show-trace test-results/<folder>/trace.zip
   ```

2. Check the network tab in the trace for failed requests (4xx/5xx) before the failing action.

3. Check the timeline for unexpected navigation or redirects.

4. Run `--headed` locally to observe the browser behavior visually:

   ```bash
   npx playwright test tests/your.spec.ts --headed
   ```

5. Distinguish product bug (wrong application behavior) from test bug (wrong locator, wrong assertion, race condition).

**Do not add `waitForTimeout` to fix a flaky test.** It masks the symptom and makes the suite slower. Find what the test should wait for and use a web-first assertion.

---

## CI expectations

There is no CI pipeline yet. When one is added:

- `forbidOnly: true` — tests with `.only` will fail the build
- `retries: 2` in CI (already configured) — for genuine transient failures only
- `workers: 1` in CI (already configured) — avoids resource contention
- `headless: true` in CI (already configured)
- Artifacts (video, screenshot, trace) will be collected on failure

Before adding CI, ensure:

- `.env.test` and `.env` values are available as CI secrets
- `SHOP_PASSWORD` and other sensitive values are injected from secrets, not committed

---

## Code review checklist

Before approving a test:

- [ ] No `waitForTimeout` anywhere
- [ ] No `expect(await locator.isXxx()).toBe(true)` — use web-first assertions
- [ ] No assertions in `*.spec.ts` outside of `test.step`
- [ ] No assertions in page object files
- [ ] Locators prefer `getByRole` / `getByLabel` / `getByText` where applicable
- [ ] Text strings pulled from `t.xxx` (i18n dictionary), not hardcoded
- [ ] Every test has at least one `TestGroup` tag
- [ ] Authenticated tests use `@shopTestsUser` (or the relevant user key)
- [ ] `expectLoaded()` called before any page interaction
- [ ] Test runs independently (no dependency on another test having run first)
- [ ] `import type` used for type-only imports
- [ ] `@/` path alias used for all project imports
