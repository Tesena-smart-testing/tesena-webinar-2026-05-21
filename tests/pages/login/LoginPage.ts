import type { Locator, Page } from "@playwright/test";
import type { Texts } from "@/i18n";

export class LoginPage {
  constructor(
    private readonly page: Page,
    private readonly t: Texts,
  ) {}

  async goto() {
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
  }

  async expectLoaded(): Promise<void> {
    await this.usernameInput.waitFor({ state: "visible", timeout: 60_000 });
  }

  get usernameInput(): Locator {
    return this.page.locator("input#username");
  }

  get passwordInput(): Locator {
    return this.page.locator("input#password");
  }

  get loginButton(): Locator {
    return this.page.locator(
      `//button[contains(text(), '${this.t.loginPage.loginButton.title}')]`,
    );
  }

  get acceptCookiesButton(): Locator {
    return this.page.getByRole("button", {
      name: this.t.loginPage.cookies.accept,
    });
  }
}
