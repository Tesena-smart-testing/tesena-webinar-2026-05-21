import { test } from "../fixtures/test.fixture";
import { describeAsUser } from "../fixtures/user.fixture";
import { TestGroup } from "../helpers/testGroups";

describeAsUser("accountsTestsUser", "1IB tests", async () => {
  // eslint-disable-next-line playwright/expect-expect
  test(`${TestGroup.ACCOUNTS} Standard account test`, async ({
    gotoAccountsPage,
  }) => {
    const _accountsPage = await gotoAccountsPage();
  });
});
