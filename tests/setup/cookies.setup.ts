import { test, expect } from "@playwright/test";
import { getTestUsers, storagePath } from "@/tests/testdata/testUsers";
import { LoginPage } from "@/tests/pages/login/LoginPage";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";

test("Accept cookies", async ({ page }) => {
  const t = loadDictionary(locale(process.env.LOCALE as Locale));
  const loginPage = new LoginPage(page, t);
  await loginPage.goto();
  await loginPage.expectLoaded();

  const accept = loginPage.acceptCookiesButton;
  try {
    await accept.waitFor({ state: "visible", timeout: 30_000 });

    await accept.click();
    await expect(accept).toBeHidden({ timeout: 10_000 });
  } catch {
    console.log("Cookies banner not found");
  }

  const testUsers = getTestUsers();
  // Uložení storage state pro každého z uživatelů projekt
  for (const user of Object.keys(testUsers) as Array<keyof typeof testUsers>) {
    const file = storagePath(user);
    await page.context().storageState({
      path: file,
    });
  }
  // Uložení storage state pro testy bez uživatele
  await page.context().storageState({
    path: storagePath("nouser"),
  });
});
