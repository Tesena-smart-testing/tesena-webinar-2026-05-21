import type { Page } from "@playwright/test";
import type { Texts } from "@/i18n";

export class AccountsPage {
  constructor(
    private readonly page: Page,
    _t: Texts, // reserved for future locator use
  ) {}

  async expectLoaded(): Promise<void> {
    // TODO: add some validations to check page is loaded
  }

  async goto(): Promise<void> {
    await this.page.goto(process.env.ACCOUNTS_PAGE_URL!);
  }
}
