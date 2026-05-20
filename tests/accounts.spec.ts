import { test } from "@playwright/test";
import { AccountsPage } from "@/tests/pages/accounts/AccountsPage";
import { TestGroup } from "@/helpers/testGroups";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";

test.describe("@accountsTestsUser 1IB tests", () => {
  // eslint-disable-next-line playwright/expect-expect
  test(`${TestGroup.ACCOUNTS} Standard account test`, async ({ page }) => {
    const t = loadDictionary(locale(process.env.LOCALE as Locale));
    const accountsPage = new AccountsPage(page, t);
    await accountsPage.goto();
    await accountsPage.expectLoaded();
  });
});
