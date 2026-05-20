import { test, expect } from "@playwright/test";
import { getTestUsers, storagePath } from "@/tests/testdata/testUsers";
import { LoginPage } from "@/tests/pages/login/LoginPage";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";

test("Accept cookies", async ({ page }) => {
  const t = loadDictionary(locale(process.env.LOCALE as Locale));
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  const loginPage = new LoginPage(page, t);
  const accept = loginPage.acceptCookiesButton;
  try {
    await accept.waitFor({ state: "visible", timeout: 10_000 });
    await accept.click();
    await expect(accept).toBeHidden({ timeout: 10_000 });
  } catch {
    console.log("Cookies banner not found");
  }

  const testUsers = getTestUsers();
  for (const user of Object.keys(testUsers) as Array<keyof typeof testUsers>) {
    const file = storagePath(user);
    await page.context().storageState({ path: file });
  }
  await page.context().storageState({ path: storagePath("nouser") });
});
