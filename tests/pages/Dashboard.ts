import type { Locator, Page } from "@playwright/test";
import type { Texts } from "@/i18n";

export class Dashboard {
  constructor(
    private readonly page: Page,
    _t: Texts, // reserved for future locator use
  ) {}

  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  async expectLoaded(): Promise<void> {
    await this.logo.waitFor({ state: "visible", timeout: 30_000 });
  }

  get logo(): Locator {
    return this.page.locator(".logo");
  }
}
