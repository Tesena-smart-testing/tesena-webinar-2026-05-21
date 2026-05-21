import type { Locator, Page } from "@playwright/test";
import type { Texts } from "@/i18n";

export class RegistrationPage {
  constructor(
    readonly page: Page,
    private readonly t: Texts,
  ) {}

  async goto(): Promise<void> {
    const localeKey = (process.env.LOCALE ?? "cs-CZ")
      .replace("-", "_")
      .toUpperCase();
    await this.page.goto(process.env[`REGISTRATION_PAGE_URL_${localeKey}`]!);
  }

  async expectLoaded(): Promise<void> {
    await this.firstNameInput.waitFor({ state: "visible", timeout: 60_000 });
  }

  get heading(): Locator {
    return this.page.getByRole("heading", {
      level: 1,
      name: this.t.registrationPage.heading,
    });
  }

  get firstNameInput(): Locator {
    return this.page.locator("#field-firstname");
  }

  get lastNameInput(): Locator {
    return this.page.locator("#field-lastname");
  }

  get emailInput(): Locator {
    return this.page.locator("#field-email");
  }

  get passwordInput(): Locator {
    return this.page.locator("#field-password");
  }

  get termsCheckbox(): Locator {
    return this.page.getByRole("checkbox", {
      name: this.t.registrationPage.termsCheckboxLabel,
    });
  }

  get customerPrivacyCheckbox(): Locator {
    return this.page.getByRole("checkbox", {
      name: this.t.registrationPage.customerPrivacyCheckboxLabel,
    });
  }

  get saveButton(): Locator {
    return this.page.getByRole("button", {
      name: this.t.registrationPage.saveButton,
    });
  }

  get errorAlert(): Locator {
    return this.page.locator(".alert.alert-danger");
  }

  async fillForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<void> {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.termsCheckbox.check();
    await this.customerPrivacyCheckbox.check();
  }

  async submit(): Promise<void> {
    await this.saveButton.click();
  }
}
