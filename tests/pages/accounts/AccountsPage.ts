import type { Page } from "@playwright/test";
import type { Texts } from "../../../fixtures/test.fixture";

export class AccountsPage {
  constructor(
    private readonly page: Page,
    // @ts-expect-error -- stub: t will be used once locators are implemented
    private readonly t: Texts,
  ) {}

  /**
   * Logika pro ověření, že stránka byla načtena.
   * Například čekání na element, který by měl být na stránce zobrazen
   */
  async expectLoaded(): Promise<void> {
    // TODO: add some validations to check page is loaded
  }

  /**
   * Projde rovnou na cílovou stránku, ze které test začíná
   */
  async goto(): Promise<void> {
    await this.page.goto(process.env.ACCOUNTS_PAGE_URL!);
  }
}
