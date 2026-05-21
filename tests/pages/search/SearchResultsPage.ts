import type { Locator, Page } from "@playwright/test";
import type { Texts } from "@/i18n";

export class SearchResultsPage {
  constructor(
    private readonly page: Page,
    private readonly t: Texts,
  ) {}

  async expectLoaded(): Promise<void> {
    await this.heading.waitFor({ state: "visible", timeout: 30_000 });
  }

  get heading(): Locator {
    return this.page.getByRole("heading", {
      level: 1,
      name: this.t.searchResultsPage.heading,
    });
  }

  get searchInput(): Locator {
    return this.page.getByRole("textbox", {
      name: this.t.searchResultsPage.searchInput,
    });
  }

  get productCards(): Locator {
    return this.page.locator("article.product-miniature");
  }

  get totalProductsLabel(): Locator {
    return this.page.locator(".total-products");
  }
}
