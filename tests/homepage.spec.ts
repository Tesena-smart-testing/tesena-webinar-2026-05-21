import { test, expect } from "@playwright/test";
import { HomePage } from "@/tests/pages/home/HomePage";
import { TestGroup } from "@/helpers/testGroups";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";

test.describe("Homepage tests", () => {
  test(`${TestGroup.HOMEPAGE} ${TestGroup.NO_SESSION} Homepage loads with key navigation elements`, async ({
    page,
  }) => {
    const t = loadDictionary(locale(process.env.LOCALE as Locale));
    const homePage = new HomePage(page, t);
    await homePage.goto();
    await homePage.expectLoaded();

    await test.step("Logo is visible", async () => {
      await expect(homePage.logo).toBeVisible();
    });

    await test.step("Search input is visible", async () => {
      await expect(homePage.searchInput).toBeVisible();
    });

    await test.step("Login link is visible", async () => {
      await expect(homePage.loginLink).toBeVisible();
    });

    await test.step("Clothes nav link is visible", async () => {
      await expect(homePage.clothesNavLink).toBeVisible();
    });

    await test.step("Accessories nav link is visible", async () => {
      await expect(homePage.accessoriesNavLink).toBeVisible();
    });

    await test.step("Art nav link is visible", async () => {
      await expect(homePage.artNavLink).toBeVisible();
    });
  });
});
