import type { Locator, Page } from "@playwright/test";
import type { Texts } from "@/i18n";

export class HomePage {
  constructor(
    private readonly page: Page,
    _t: Texts,
  ) {}

  async goto(): Promise<void> {
    const localeKey = (process.env.LOCALE ?? "cs-CZ")
      .replace("-", "_")
      .toUpperCase();
    const url = process.env[`HOME_PAGE_URL_${localeKey}`] ?? "/";
    await this.page.goto(url);
  }

  async expectLoaded(): Promise<void> {
    await this.logo.waitFor({ state: "visible", timeout: 30_000 });
  }

  get logo(): Locator {
    return this.page.locator(".logo");
  }

  get searchInput(): Locator {
    return this.page.locator('input[name="s"]');
  }

  get loginLink(): Locator {
    return this.page.locator(".user-info a").first();
  }

  get clothesNavLink(): Locator {
    return this.page.locator('a[href*="3-clothes"]').first();
  }

  get accessoriesNavLink(): Locator {
    return this.page.locator('a[href*="6-accessories"]').first();
  }

  get artNavLink(): Locator {
    return this.page.locator('a[href*="9-art"]').first();
  }
}
