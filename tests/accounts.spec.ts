import { test } from "../fixtures/test.fixture";
import { describeAsUser } from "../fixtures/user.fixture";
import { TestGroup } from "../helpers/testGroups";

describeAsUser("accountsTestsUser", "1IB tests", async () => {
  test(`${TestGroup.ACCOUNTS} Standard account test`, async ({
    gotoAccountsPage,
  }) => {
    const accountsPage = await gotoAccountsPage();
  });
});
