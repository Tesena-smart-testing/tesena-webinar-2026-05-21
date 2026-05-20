# Design: Adapt Project for Tesena Shop (First Slice)

**Date:** 2026-05-20  
**Branch:** feat/adapt-for-tesena-shop  
**Target:** http://37.27.17.198:8084/cs/

---

## Context

The existing project was built for a banking application (payments, accounts, OTP-based login). This spec covers the first adaptation slice to test the **Tesena e-commerce shop**, a PrestaShop instance. The scope is intentionally minimal — get the wiring right, cover the homepage and login, and leave other features for subsequent slices.

---

## Website Analysis

**Platform:** PrestaShop (Czech locale, `/cs/` prefix)  
**Base URL:** `http://37.27.17.198:8084`

### Key pages discovered

| Page              | URL                                                  |
| ----------------- | ---------------------------------------------------- |
| Homepage          | `/cs/`                                               |
| Login             | `/cs/přihlásit` (encoded: `/cs/p%C5%99ihl%C3%A1sit`) |
| Registration      | `/cs/registrace`                                     |
| Cart              | `/cs/kosik`                                          |
| Clothes category  | `/cs/3-clothes`                                      |
| Men subcategory   | `/cs/4-men`                                          |
| Women subcategory | `/cs/5-women`                                        |
| Accessories       | `/cs/6-accessories`                                  |
| Art               | `/cs/9-art`                                          |
| Product example   | `/cs/men/1-1-hummingbird-printed-t-shirt.html`       |

### Login page locators

| Element              | Locator                     |
| -------------------- | --------------------------- |
| Email input          | `#field-email`              |
| Password input       | `#field-password`           |
| Submit button        | `#submit-login`             |
| Show password toggle | `button` with text "Ukázat" |

### Homepage key elements

| Element           | Description                             |
| ----------------- | --------------------------------------- |
| Logo              | Tesena logo linking to `/cs/`           |
| Navigation        | CLOTHES, PŘÍSLUŠENSTVÍ, ART dropdowns   |
| Search input      | `input[name="s"]` — "Hledat v katalogu" |
| Cart icon         | Top-right, shows item count             |
| Login link        | Top-right, text "Přihlásit se"          |
| Language switcher | Čeština / English                       |
| Currency switcher | CZK Kč / EUR € / USD $                  |

### Authentication differences vs. current banking project

|                        | Banking (old)    | Tesena Shop (new)                   |
| ---------------------- | ---------------- | ----------------------------------- |
| Primary identifier     | `loginNumber`    | `email`                             |
| 2nd factor             | `token` (OTP)    | _(none)_                            |
| Login button text      | "Přihlásit"      | "Přihlásit se"                      |
| Email input id         | `input#username` | `#field-email`                      |
| Submit button          | XPath by text    | `#submit-login`                     |
| Post-login destination | `/dashboard` URL | Back to originating page (homepage) |

---

## Scope of This Slice

1. **Config** — set `BASE_URL` for both environments
2. **User schema** — swap `loginNumber`/`token` for `email`; rename user key
3. **LoginPage** — update locators to match the shop
4. **Login step** — remove OTP, use email-based login
5. **HomePage** — new page object for the homepage
6. **Specs** — update `login.spec.ts`, add `homepage.spec.ts`, delete banking specs
7. **i18n** — update login button text key, keep cookies key
8. **Setup files** — update `cookies.setup.ts` to use email login

---

## Detailed Changes

### 1. Config / Environment

**`.env.acc`** and **`.env.int`**:

```
BASE_URL=http://37.27.17.198:8084
```

`config/environment.ts` — no changes needed.

---

### 2. User Schema (`tests/testdata/testUsers/`)

**`schema.ts`** — replace `loginNumber`/`token` with `email`:

```typescript
export type TestUser = {
  email: string;
  password: string;
};

export type Users = {
  shopTestsUser: TestUser;
};
```

**`acc.ts`** and **`int.ts`** — rename key, provide placeholder values:

```typescript
export const users: Users = {
  shopTestsUser: {
    email: "", // fill in per environment
    password: "",
  },
};
```

**`index.ts`** — update `TestUserData` / `TestUserKey` derived types to match new `Users`.

> Note: `BankAccount` type can be removed from `schema.ts` as it's no longer relevant.

---

### 3. LoginPage (`tests/pages/login/LoginPage.ts`)

Update locators:

| Property                                  | Old              | New                           |
| ----------------------------------------- | ---------------- | ----------------------------- |
| `usernameInput` → renamed to `emailInput` | `input#username` | `#field-email`                |
| `passwordInput`                           | `input#password` | `#field-password` (unchanged) |
| `loginButton`                             | XPath by text    | `#submit-login`               |

The `goto()` method navigates to `"/"` — unchanged (base URL handles it).

---

### 4. Login Step (`tests/steps/login.step.ts`)

Remove OTP logic; rename to `loginByEmail`:

```typescript
export class LoginStep {
  constructor(readonly loginPage: LoginPage) {}

  async loginByEmail(email: string, password: string): Promise<void> {
    await this.loginPage.emailInput.fill(email);
    await this.loginPage.passwordInput.fill(password);
    await this.loginPage.loginButton.click();
  }
}
```

`loginAndSaveStorageState` uses `testUser.email` instead of `testUser.loginNumber`.

---

### 5. HomePage (`tests/pages/home/HomePage.ts`) — NEW

```typescript
export class HomePage {
  constructor(
    private readonly page: Page,
    private readonly t: Texts,
  ) {}

  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  async expectLoaded(): Promise<void> {
    await this.logo.waitFor({ state: "visible" });
  }

  get logo(): Locator {
    return this.page.locator(".logo");
  }
  get searchInput(): Locator {
    return this.page.locator('input[name="s"]');
  }
  get cartLink(): Locator {
    return this.page.locator(".cart-preview");
  }
  get loginLink(): Locator {
    return this.page.locator(".user-info a");
  }
  get clothesNavLink(): Locator {
    return this.page.locator('a[href*="3-clothes"]');
  }
  get accessoriesNavLink(): Locator {
    return this.page.locator('a[href*="6-accessories"]');
  }
  get artNavLink(): Locator {
    return this.page.locator('a[href*="9-art"]');
  }
}
```

i18n keys for HomePage are not needed in this slice (all assertions use structural locators, not translated text).

---

### 6. Test Specifications

**`tests/login.spec.ts`** — update to use email field:

- Replace `usernameInput` references with `emailInput` (or keep as-is if property renamed)
- Verify button text "Přihlásit se" is present

**`tests/homepage.spec.ts`** — NEW, `@nouser`:

- Homepage loads
- Logo is visible
- Navigation links (Clothes, Příslušenství, Art) are visible
- Search input is visible
- Login link is visible

**Delete:** `tests/accounts.spec.ts`, `tests/payments.spec.ts`

---

### 7. i18n (`i18n/`)

**`schema.ts`** — update `loginButton.title` description only (value already correct):

```typescript
loginButton: {
  title: string;
} // "Přihlásit se"
```

No new keys needed for this slice.

**`cs.ts`** — `loginButton.title` already `"Přihlásit se"` — no change needed.  
**`en.ts`** — update to `"Sign in"` to match the English shop.

The `certification` section (SMS OTP, OTP) can be removed from schema, cs, and en — no longer applicable.

---

### 8. Setup Files

**`tests/setup/cookies.setup.ts`** — use `testUser.email` instead of `testUser.loginNumber` when calling login.

**`tests/setup/storageState.setup.ts`** — call `loginByEmail(testUser.email, testUser.password)` instead of `loginByOtp(...)`.

---

## What is NOT in scope

- Category pages (CategoryPage, product listing)
- Product detail page (ProductPage)
- Cart page (CartPage, CartModal)
- Checkout (CheckoutPage, OrderConfirmationPage)
- Registration (RegistrationPage)
- Authenticated account page (AccountPage)
- Multi-user project matrix (single `shopTestsUser` is sufficient for this slice)

---

## Open Questions

1. **Test credentials** — `shopTestsUser.email` and `password` need to be provided for each environment. The acc/int files will have empty strings as placeholders.
2. **Cookie banner** — The homepage cookie banner uses "Souhlasím" which matches the existing i18n key. `cookies.setup.ts` already handles it gracefully (try/catch).
3. **Post-login redirect** — After login, PrestaShop redirects back to the originating page (not a fixed `/dashboard`). `Dashboard.expectLoaded()` currently waits for `page.waitForURL("/")` — this will work as long as login is triggered from the homepage.
