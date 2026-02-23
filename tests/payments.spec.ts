import { test } from "../fixtures/test.fixture";
import { describeAsUser } from "../fixtures/user.fixture";
import { TestGroup } from "../helpers/testGroups";


describeAsUser('paymentsTestsUser', '1IB tests', async () => {

  test(`${TestGroup.PAYMENTS} Single payment test`, async ({ gotoSinglePaymentPage }) => {
    const singlePaymentPage = await gotoSinglePaymentPage()
  });

  test(`${TestGroup.PAYMENTS} Batch payment test`, async ({ gotoBatchPaymentPage }) => {
    const batchPaymentPage = await gotoBatchPaymentPage()
  });

})

