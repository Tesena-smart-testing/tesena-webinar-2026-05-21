import { expect, Locator, Page } from "@playwright/test";
import { Texts } from "../../../fixtures/test.fixture";

export class Menu {
  constructor(
    private readonly page: Page,
    private readonly t: Texts,
  ) {}

  async expectLoaded(): Promise<Menu> {
    await this.menu.waitFor({ state: "visible" });
    return this;
  }

  get menu() {
    return this.page.locator("ul[role='menu']");
  }
}
