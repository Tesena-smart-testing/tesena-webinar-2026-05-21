import type { Page } from "@playwright/test";
import type { Texts } from "../../../fixtures/test.fixture";

export class Menu {
  constructor(
    private readonly page: Page,
    // @ts-expect-error -- stub: t will be used once locators are implemented
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
