import type { Page } from "@playwright/test";
import type { Texts } from "@/fixtures/test.fixture";

export class OtpLogin {
  constructor(
    private readonly page: Page,
    // @ts-expect-error -- stub: t will be used once locators are implemented
    private readonly t: Texts,
  ) {}

  // logika pro ověření, že stránka byla načtena
  // například čekání na element, který by měl být na stránce
  async expectLoaded(): Promise<OtpLogin> {
    await this.tokenAuthorizationForm.waitFor({ state: "visible" });
    return this;
  }

  async confirmLogin(_token: string) {
    // Authorization
  }

  get tokenAuthorizationForm() {
    return this.page.locator("locator");
  }
}
