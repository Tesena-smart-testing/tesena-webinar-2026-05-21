import { test } from "@playwright/test";
import { RegistrationPage } from "@/tests/pages/registration/RegistrationPage";
import { RegistrationStep } from "@/tests/steps/registration.step";
import { TestGroup } from "@/helpers/testGroups";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";

test.describe("Registration tests", () => {
  test(`${TestGroup.REGISTRATION} ${TestGroup.NO_SESSION} Registration fails with already-registered email`, async ({
    page,
  }) => {
    const t = loadDictionary(locale(process.env.LOCALE as Locale));
    const registrationPage = new RegistrationPage(page, t);
    const registrationStep = new RegistrationStep(registrationPage);

    await registrationPage.goto();
    await registrationPage.expectLoaded();

    await test.step("User submits the form with an email address that is already registered", async () => {
      await registrationStep.registerWithValidData({
        firstName: "Test",
        lastName: "User",
        email: "demo@prestashop.com",
        password: "TestPass123!",
      });
    });

    await test.step("An error alert is displayed indicating the email is already in use", async () => {
      await registrationStep.verifyDuplicateEmailError(t);
    });
  });
});
