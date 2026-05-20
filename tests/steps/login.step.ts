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

  async loginByEmail(email: string, password: string): Promise<void> {
    await this.loginPage.emailInput.fill(email);
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
    await loginStep.loginByEmail(testUser.email, testUser.password);

    const dashboard = new Dashboard(page, t);
    await dashboard.expectLoaded();

    await page.context().storageState({ path: storagePath(testUserKey) });
  } finally {
    await context.close();
  }
}
