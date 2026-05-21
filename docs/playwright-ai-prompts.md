# Playwright AI Prompts

Copy-paste prompts for common test automation tasks in this project.

All prompts assume Claude Code with the agents in `.claude/agents/` available.

---

## Generate a test from a user story

```
/write-playwright-test

User story:
As a registered customer, I want to log in with my email and password so that I can access my account.

Acceptance criteria:
- Navigating to /en/login shows the login form
- Entering valid credentials and clicking Sign in redirects to the account page
- An invalid password shows an error message
- The error message text is pulled from the i18n dictionary

Existing files to check first:
- tests/login.spec.ts
- tests/pages/login/LoginPage.ts
- tests/steps/login.step.ts
```

---

## Generate a test for an unauthenticated flow

```
/write-playwright-test

I need a test for the homepage navigation menu.
The test should be unauthenticated (@nouser).

What to verify:
- The Clothes, Accessories, and Art navigation links are visible
- Clicking Clothes navigates to the clothes category page
- The page title after navigation contains "Clothes"

Check tests/pages/home/HomePage.ts first to see what locators already exist.
Reuse existing locators where possible. If new locators are needed, use getByRole or getByText.
```

---

## Generate a test for an authenticated flow

```
/write-playwright-test

I need a test for the account order history page.
The test requires a logged-in user — tag it @shopTestsUser.

What to verify:
- After login, navigating to /en/order-history shows the order history page
- The page heading "Order history" is visible
- If no orders exist, an empty state message is shown

Check tests/testdata/testUsers/acc.ts to confirm the user key is "shopTestsUser".
Use storage state for authentication — do not drive through the login UI in the test.
```

---

## Review an existing test

```
/review-playwright-test

Please review tests/homepage.spec.ts.

Focus on:
- Are the locators in tests/pages/home/HomePage.ts using stable selectors?
- Are there any missing @nouser or other tags?
- Is expectLoaded() being called before interactions?
- Are there any flaky patterns?

Also read tests/pages/home/HomePage.ts as part of the review.
```

---

## Review a page object for locator quality

```
/review-playwright-test

Please review the locator quality in tests/pages/home/HomePage.ts.

The following locators look brittle:
- .logo (CSS class)
- input[name="s"] (attribute selector)
- a[href*="3-clothes"] (URL fragment)
- .user-info a (CSS chain)

For each one: explain whether it is acceptable given PrestaShop's structure,
and if not, suggest a specific replacement using getByRole, getByLabel, or getByText.
```

---

## Debug a failing test

```
/debug-flaky-test

Test: tests/login.spec.ts — "Login form elements"
Error: Timeout 15000ms exceeded waiting for expect(locator).toBeEnabled()
Expected: enabled
Received: disabled

Environment: TEST, locale cs-CZ, running locally with --headed

The test was passing yesterday. I changed nothing in the test code.
The PrestaShop app may have been updated.

Steps I've tried:
- Ran with --headed — the login button appears but looks grey
- Opened the page manually — the button is enabled in the browser

Please check tests/login.spec.ts and tests/pages/login/LoginPage.ts
and identify whether this is a product change or a locator issue.
```

---

## Debug a CI-only failure

```
/debug-flaky-test

Test: tests/homepage.spec.ts — "Homepage loads with key navigation elements"
Environment: TEST, cs-CZ, CI (GitHub Actions — not set up yet, running via npm test)
Error: Timeout 30000ms exceeded waiting for locator('.logo')

The test passes every time locally. It fails on first run but passes on retry.
retries: 2 is configured in playwright.config.ts.

Please check:
- tests/pages/home/HomePage.ts expectLoaded() implementation
- Whether .logo is a reliable indicator of page readiness
- Whether headless vs headed mode could explain the difference
```

---

## Refactor CSS selectors to role-based locators

```
/refactor-playwright-test

Refactor tests/pages/home/HomePage.ts to replace CSS selectors with getByRole / getByText where possible.

Current selectors to replace:
- .logo → find a role-based alternative or document why CSS is necessary
- input[name="s"] → getByRole('searchbox') or getByLabel if there's a label
- .user-info a → getByRole('link') with the correct name from t.xxx
- a[href*="3-clothes"] → getByRole('link', { name: t.navigation.clothes }) — add i18n key if needed
- a[href*="6-accessories"] → same approach
- a[href*="9-art"] → same approach

After refactoring:
- Add any new i18n keys to i18n/schema.ts, i18n/cs.ts, and i18n/en.ts
- Run npm run typecheck and npm run lint to verify
- Run npx playwright test tests/homepage.spec.ts --headed to confirm tests still pass
```

---

## Refactor assertions into step files

```
/refactor-playwright-test

Refactor tests/login.spec.ts to move all expect() calls into a step file.

Currently the spec file calls expect() directly. Per the project architecture,
all assertions must live in tests/steps/*.step.ts.

Steps:
1. Create or extend tests/steps/login.step.ts with a LoginFormStep class
2. Move each expect() from the spec into a method on LoginFormStep
3. Update the spec to call those step methods instead
4. Do not change the test scenarios — only move the assertions

Constraints:
- Keep the test.step() blocks in the spec — they drive the Playwright report structure
- The step method names should describe what is being verified
```

---

## Improve test fixtures

```
/improve-playwright-framework

I want to add a Playwright fixture that provides a pre-authenticated page for tests
that need a logged-in shopTestsUser, instead of each spec relying on implicit storage state.

Current setup:
- Storage state is loaded via playwright.config.ts projectMatrix (storageState per project)
- Tests are routed to the right project by matching @shopTestsUser in the test name

Desired change:
- Add a custom `authenticatedPage` fixture or verify the current approach is already correct
- If a fixture is the right solution, create tests/fixtures/index.ts
- The fixture should fail loudly if storageState is missing or expired

Check playwright.config.ts and tests/setup/ before proposing changes.
Do not require rewriting existing tests.
```

---

## Design coverage for a new feature

```
/design-playwright-coverage

Feature: Product search

User story:
As a visitor, I want to search for products by keyword so that I can find items I'm looking for.

Flows to consider:
- Searching from the homepage search box
- Search results page shows matching products
- No results found state
- Searching with special characters
- Navigating to a product from search results

Questions:
- Which of these need UI-level tests?
- Which can be covered at API level or skipped for a PrestaShop default?
- What test data do we need (specific product names that definitely exist)?
- What TestGroup tag should search tests use?

Check helpers/testGroups.ts for existing tags.
Propose a new tag if needed.
```

---

## Add API setup before UI verification

```
/write-playwright-test

I want to test that a product added to the cart appears in the cart summary.

Instead of navigating through the product listing to add the item via UI,
use the PrestaShop cart API to add the product before navigating to the cart page.

PrestaShop add-to-cart endpoint: POST /en/cart?ajax=1&action=update
Required payload: { qty: 1, add: 1, id_product: 1, token: <csrf_token> }

Steps:
1. Make an API request to add product ID 1 to the cart (use page.request)
2. Navigate to /en/cart?action=show
3. Verify the product appears in the cart

Check tests/pages/ for an existing CartPage. If none exists, create one.
Tag the test @nouser (cart works without login in PrestaShop by default).
```
