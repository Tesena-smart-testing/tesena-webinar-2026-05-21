import { test } from "@playwright/test";
import { SinglePaymentPage } from "@/tests/pages/payments/single/SinglePaymentPage";
import { BatchPaymentPage } from "@/tests/pages/payments/batch/BatchPaymentPage";
import { TestGroup } from "@/helpers/testGroups";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";

test.describe("@paymentsTestsUser 1IB tests", () => {
  // eslint-disable-next-line playwright/expect-expect
  test(`${TestGroup.PAYMENTS} Single payment test`, async ({ page }) => {
    const t = loadDictionary(locale(process.env.LOCALE as Locale));
    const singlePaymentPage = new SinglePaymentPage(page, t);
    await singlePaymentPage.goto();
    await singlePaymentPage.expectLoaded();
  });

  // eslint-disable-next-line playwright/expect-expect
  test(`${TestGroup.PAYMENTS} Batch payment test`, async ({ page }) => {
    const t = loadDictionary(locale(process.env.LOCALE as Locale));
    const batchPaymentPage = new BatchPaymentPage(page, t);
    await batchPaymentPage.goto();
    await batchPaymentPage.expectLoaded();
  });
});
