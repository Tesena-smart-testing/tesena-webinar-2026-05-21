import { expect } from "@playwright/test";
import type { HomePage } from "@/tests/pages/home/HomePage";
import type { SearchResultsPage } from "@/tests/pages/search/SearchResultsPage";

export class SearchStep {
  constructor(
    private readonly homePage: HomePage,
    private readonly searchResultsPage: SearchResultsPage,
  ) {}

  async searchFor(query: string): Promise<void> {
    await this.homePage.searchInput.fill(query);
    await this.homePage.searchInput.press("Enter");
    await this.searchResultsPage.expectLoaded();
  }

  async verifyResultsVisible(): Promise<void> {
    await expect(
      this.searchResultsPage.productCards.first(),
      "At least one product card should be visible in search results",
    ).toBeVisible();
  }

  async verifyResultsHeadingVisible(): Promise<void> {
    await expect(
      this.searchResultsPage.heading,
      "Search results heading should be visible",
    ).toBeVisible();
  }

  async verifyTotalProductsLabelVisible(): Promise<void> {
    await expect(
      this.searchResultsPage.totalProductsLabel,
      "Total products label should be visible on search results page",
    ).toBeVisible();
  }
}
