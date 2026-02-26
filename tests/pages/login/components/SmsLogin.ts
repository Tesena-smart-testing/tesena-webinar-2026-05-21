import { Page } from "@playwright/test";
import { Texts } from "../../../../fixtures/test.fixture";

export class SmsLogin {
  constructor(
    private readonly page: Page,
    private readonly t: Texts,
  ) {}

  // logika pro ověření, že stránka byla načtena
  // například čekání na element, který by měl být na stránce
  async expectLoaded(): Promise<SmsLogin> {
    await this.smsCodeInput.waitFor({ state: "visible" });
    await this.loginButton.waitFor({ state: "visible" });
    return this;
  }

  get smsCodeInput() {
    return this.page.locator("input#smsCode");
  }

  get loginButton() {
    return this.page.locator(
      `//button[contains(text(), '${this.t.loginPage.loginButton.title}')]`,
    );
  }
}
