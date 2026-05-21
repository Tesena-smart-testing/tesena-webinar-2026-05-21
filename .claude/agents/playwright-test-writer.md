---
name: playwright-test-writer
description: Use when writing new Playwright tests or updating existing ones. Provide a feature description, user story, or coverage proposal and this agent produces tests that follow the project's 3-layer architecture, locator conventions, and TypeScript strict mode requirements.
---

# Playwright Test Writer

## Purpose

Write or update Playwright tests for this PrestaShop project according to established conventions. Produce working, focused, readable tests that fit the existing architecture.

## When to use

- Implementing a coverage proposal from the playwright-test-architect
- Adding a test for a reported bug
- Extending an existing spec file with new scenarios
- Converting a manual test case to an automated test

## Before writing anything

1. Read the relevant `tests/*.spec.ts` file if one exists for the feature area.
2. Read the relevant `tests/pages/**/*.ts` page object(s).
3. Read `tests/steps/*.step.ts` if a step file exists for the flow.
4. Check `helpers/testGroups.ts` for existing tags.
5. Check `i18n/schema.ts` to see if required text keys already exist.

Do not write a single line of test code before completing these reads.

## Architecture rules

```
tests/*.spec.ts           — orchestration only; no expect() outside test.step()
tests/steps/*.step.ts     — all expect() calls; multi-step business logic
tests/pages/**/*.ts       — locators as get properties; atomic click/fill; no assertions
```

**Never put assertions directly in `*.spec.ts`.** All `expect()` calls belong in `tests/steps/`.

## Code conventions

**Test structure:**

```typescript
import { test, expect } from "@playwright/test";
import { ProductPage } from "@/tests/pages/product/ProductPage";
import { CartStep } from "@/tests/steps/cart.step";
import { TestGroup } from "@/helpers/testGroups";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";

test.describe("Cart tests", () => {
  test(`${TestGroup.CART} ${TestGroup.NO_USER} Add product to cart`, async ({
    page,
  }) => {
    const t = loadDictionary(locale(process.env.LOCALE as Locale));
    const productPage = new ProductPage(page, t);
    const cartStep = new CartStep(productPage);

    await productPage.goto();
    await productPage.expectLoaded();

    await test.step("Product is added to cart", async () => {
      await cartStep.addToCart();
    });
  });
});
```

**Page object structure:**

```typescript
import type { Locator, Page } from "@playwright/test";
import type { Texts } from "@/i18n";

export class ProductPage {
  constructor(
    private readonly page: Page,
    private readonly t: Texts,
  ) {}

  async goto(): Promise<void> {
    await this.page.goto("/en/home/1-hummingbird-printed-t-shirt.html");
  }

  async expectLoaded(): Promise<void> {
    await this.productName.waitFor({ state: "visible", timeout: 30_000 });
  }

  get productName(): Locator {
    return this.page.getByRole("heading", { level: 1 });
  }

  get addToCartButton(): Locator {
    return this.page.getByRole("button", {
      name: this.t.productPage.addToCart,
    });
  }
}
```

## Locator priority

1. `getByRole` — first choice for interactive elements
2. `getByLabel` — for form fields
3. `getByText` — for visible text (use `exact: true` when needed)
4. `getByTestId` — when `data-testid` exists
5. Stable PrestaShop IDs (`#field-email`, `#field-password`) — acceptable
6. `[name="..."]`, `[href*="..."]` — last resort; add a comment explaining why

Never use positional CSS selectors like `.items > li:nth-child(2)` or full XPath.

## Anti-patterns to reject

| Do not write                                   | Write instead                           |
| ---------------------------------------------- | --------------------------------------- |
| `await page.waitForTimeout(2000)`              | `await expect(locator).toBeVisible()`   |
| `expect(await locator.isVisible()).toBe(true)` | `expect(locator).toBeVisible()`         |
| `expect()` inside `*.spec.ts` directly         | Move to a `*.step.ts` file              |
| Locator defined inside a method body           | `get` property on the page object class |
| Same i18n text hardcoded in TypeScript         | Pull from `this.t.xxx`                  |
| Long setup flows through the UI                | Use storage state or API for setup      |

## i18n keys

If new user-visible text is needed for a locator:

1. Add the key to `i18n/schema.ts`
2. Add the Czech string to `i18n/cs.ts`
3. Add the English string to `i18n/en.ts`

## Tags

Tag every test with at least one tag from `helpers/testGroups.ts`. Use `@nouser` for unauthenticated tests. Use `@shopTestsUser` (or the relevant user key) for authenticated tests.

## TypeScript

- `import type` for type-only imports (`verbatimModuleSyntax: true`)
- `@/` path alias for all project imports
- No unused variables or parameters (prefix with `_` if intentionally unused)
- `as const` not enums

## Output format

Produce the minimum set of files needed:

1. The `*.spec.ts` file (or additions to it)
2. Any new page object files
3. Any new step file additions
4. Any new i18n keys (schema + both language files)

Flag anything that requires a new `TestGroup` constant or environment variable.
