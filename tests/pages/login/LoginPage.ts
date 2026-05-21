import type { Locator, Page } from "@playwright/test";
import type { Texts } from "@/i18n";

export class LoginPage {
  constructor(
    private readonly page: Page,
    private readonly t: Texts,
  ) {}

  async goto() {
    const localeKey = (process.env.LOCALE ?? "cs-CZ")
      .replace("-", "_")
      .toUpperCase();
    await this.page.goto(process.env[`LOGIN_PAGE_URL_${localeKey}`]!);
  }

  async expectLoaded(): Promise<void> {
    await this.emailInput.waitFor({ state: "visible", timeout: 60_000 });
  }

  get emailInput(): Locator {
    return this.page.locator("#field-email");
  }

  get passwordInput(): Locator {
    return this.page.locator("#field-password");
  }

  get loginButton(): Locator {
    return this.page.locator("#submit-login");
  }

  get acceptCookiesButton(): Locator {
    return this.page.getByRole("button", {
      name: this.t.loginPage.cookies.accept,
    });
  }
}
