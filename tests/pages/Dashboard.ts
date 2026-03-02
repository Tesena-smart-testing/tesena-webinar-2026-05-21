import type { Page } from "@playwright/test";
import type { Texts } from "@/fixtures/test.fixture";
import { Menu } from "@/tests/pages/components/Menu";

export class Dashboard {
  constructor(
    private readonly page: Page,
    private readonly t: Texts,
  ) {}

  /**
   * Logika pro ověření, že stránka byla načtena.
   * Například čekání na element, který by měl být na stránce zobrazen
   */
  async expectLoaded(): Promise<void> {
    await this.menu.expectLoaded();
  }

  /**
   * Projde rovnou na cílovou stránku, ze které test začíná
   */
  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  get menu() {
    return new Menu(this.page, this.t);
  }
}
