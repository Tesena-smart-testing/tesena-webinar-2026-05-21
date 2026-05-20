import { test, expect } from "@playwright/test";
import { LoginPage } from "@/tests/pages/login/LoginPage";
import { TestGroup } from "@/helpers/testGroups";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";

test.describe("Login tests", () => {
  test(`${TestGroup.LOGIN} ${TestGroup.NO_USER} Login button enabling test`, async ({
    page,
  }) => {
    const t = loadDictionary(locale(process.env.LOCALE as Locale));
    const loginPage = new LoginPage(page, t);
    await loginPage.goto();
    await loginPage.expectLoaded();

    await test.step("Login button is disabled by default", async () => {
      await expect(loginPage.loginButton).toBeDisabled();
    });

    await test.step("Login button is disabled when only username is filled in", async () => {
      await loginPage.usernameInput.fill("username");
      await expect(loginPage.loginButton).toBeDisabled();
    });

    await test.step("Login button is disabled when only password is filled in", async () => {
      await loginPage.usernameInput.clear();
      await loginPage.passwordInput.fill("password");
      await expect(loginPage.loginButton).toBeDisabled();
    });

    await test.step("Login button is enabled when username and password filled in", async () => {
      await loginPage.usernameInput.fill("username");
      await expect(loginPage.loginButton).toBeEnabled();
    });
  });
});
