import type { Browser } from "@playwright/test";
import { LoginPage } from "@/tests/pages/login/LoginPage";
import {
  storagePath,
  type TestUserData,
  type TestUserKey,
} from "@/tests/testdata/testUsers";
import { Dashboard } from "@/tests/pages/Dashboard";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";
export class LoginStep {
  constructor(readonly loginPage: LoginPage) {}

  async loginByOtp(
    username: string,
    password: string,
    _token: string,
  ): Promise<void> {
    await this.fillCredentialsClickLogin(username, password);
    // OTP confirmation stub — implement once real OTP locators are known
  }

  async fillCredentialsClickLogin(
    username: string,
    password: string,
  ): Promise<void> {
    await this.loginPage.usernameInput.fill(username);
    await this.loginPage.passwordInput.fill(password);
    await this.loginPage.loginButton.click();
  }
}

export async function loginAndSaveStorageState(
  testUserKey: TestUserKey,
  testUser: TestUserData,
  browser: Browser,
) {
  const t = loadDictionary(locale(process.env.LOCALE as Locale));
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    const loginPage = new LoginPage(page, t);
    await loginPage.goto();

    const loginStep = new LoginStep(loginPage);
    await loginStep.loginByOtp(
      testUser.loginNumber,
      testUser.password,
      testUser.token,
    );

    const dashboard = new Dashboard(page, t);
    await dashboard.expectLoaded();

    await page.context().storageState({ path: storagePath(testUserKey) });
  } finally {
    await context.close();
  }
}
