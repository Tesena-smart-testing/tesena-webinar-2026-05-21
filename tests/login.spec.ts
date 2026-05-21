import { test } from "@playwright/test";
import { LoginPage } from "@/tests/pages/login/LoginPage";
import { Dashboard } from "@/tests/pages/Dashboard";
import { LoginStep } from "@/tests/steps/login.step";
import { TestGroup } from "@/helpers/testGroups";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";
import { getTestUserData } from "@/tests/testdata/testUsers";

test.describe("Login tests", () => {
  test(`${TestGroup.LOGIN} ${TestGroup.NO_SESSION} Successful login with valid credentials`, async ({
    page,
  }) => {
    const t = loadDictionary(locale(process.env.LOCALE as Locale));
    const loginPage = new LoginPage(page);
    const dashboard = new Dashboard(page, t);
    const loginStep = new LoginStep(loginPage);
    const user = getTestUserData("shopTestsUser");

    await loginPage.goto();
    await loginPage.expectLoaded();

    await test.step("User fills in valid credentials and submits the login form", async () => {
      await loginStep.loginByEmail(user.email, user.password);
    });

    await test.step("User is redirected to the homepage after successful login", async () => {
      await loginStep.verifyLoginSuccess(dashboard);
    });
  });

  test(`${TestGroup.LOGIN} ${TestGroup.NO_SESSION} Login fails with wrong password`, async ({
    page,
  }) => {
    const t = loadDictionary(locale(process.env.LOCALE as Locale));
    const loginPage = new LoginPage(page);
    const loginStep = new LoginStep(loginPage);
    const user = getTestUserData("shopTestsUser");

    await loginPage.goto();
    await loginPage.expectLoaded();

    await test.step("User submits valid email with an incorrect password", async () => {
      await loginStep.loginByEmail(user.email, "WrongPassword123!");
    });

    await test.step("Authentication error alert is displayed", async () => {
      await loginStep.verifyLoginFailure(t);
    });
  });

  test(`${TestGroup.LOGIN} ${TestGroup.NO_SESSION} Login fails with non-existent email`, async ({
    page,
  }) => {
    const t = loadDictionary(locale(process.env.LOCALE as Locale));
    const loginPage = new LoginPage(page);
    const loginStep = new LoginStep(loginPage);

    await loginPage.goto();
    await loginPage.expectLoaded();

    await test.step("User submits an email address that is not registered", async () => {
      await loginStep.loginByEmail("nonexistent@example.com", "AnyPassword1!");
    });

    await test.step("Authentication error alert is displayed", async () => {
      await loginStep.verifyLoginFailure(t);
    });
  });
});
