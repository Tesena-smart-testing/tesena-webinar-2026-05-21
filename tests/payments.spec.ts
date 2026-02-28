import { test } from "../fixtures/test.fixture";
import { describeAsUser } from "../fixtures/user.fixture";
import { TestGroup } from "../helpers/testGroups";

describeAsUser("paymentsTestsUser", "1IB tests", async () => {
  // eslint-disable-next-line playwright/expect-expect
  test(`${TestGroup.PAYMENTS} Single payment test`, async ({
    gotoSinglePaymentPage,
  }) => {
    await gotoSinglePaymentPage();
  });

  // eslint-disable-next-line playwright/expect-expect
  test(`${TestGroup.PAYMENTS} Batch payment test`, async ({
    gotoBatchPaymentPage,
  }) => {
    await gotoBatchPaymentPage();
  });
});
