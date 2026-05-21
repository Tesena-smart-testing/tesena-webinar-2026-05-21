import { expect } from "@playwright/test";
import type { Texts } from "@/i18n";
import { RegistrationPage } from "@/tests/pages/registration/RegistrationPage";

export class RegistrationStep {
  constructor(readonly registrationPage: RegistrationPage) {}

  async registerWithValidData(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<void> {
    await this.registrationPage.fillForm(data);
    await this.registrationPage.submit();
  }

  async verifyDuplicateEmailError(t: Texts): Promise<void> {
    await expect(
      this.registrationPage.errorAlert,
      "Duplicate email error alert should be visible after submitting a registered email",
    ).toBeVisible();
    await expect(this.registrationPage.errorAlert).toContainText(
      t.registrationPage.duplicateEmailError,
    );
  }
}
