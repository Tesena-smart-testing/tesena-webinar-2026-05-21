import { gotoPage } from "../helpers/pageFactory";
import { loadDictionary } from "../i18n";
import { cs } from "../i18n/cs";
import { Schema } from "../i18n/schema";
import { Dashboard } from "../tests/pages/Dashboard";
import { LoginPage } from "../tests/pages/login/LoginPage";
import { test as base } from "@playwright/test";
import {
  TestUserKey,
  TestUserData,
  getTestUserData,
} from "../tests/testdata/testUsers";
import { locale } from "../playwright.config";
import { BatchPaymentPage } from "../tests/pages/payments/batch/BatchPaymentPage";
import { SinglePaymentPage } from "../tests/pages/payments/single/SinglePaymentPage";
import { AccountsPage } from "../tests/pages/accounts/AccountsPage";
import { loginAndSaveStorageState, LoginStep } from "../tests/steps/login.step";

export type Texts = typeof cs;

type Options = {
  testUserKey: TestUserKey;
  testUser: TestUserData;
  texts: Schema;
  authentication: void;
};

type Fixtures = {
  loginPage: LoginPage;
  gotoDashboard: () => Promise<Dashboard>;
  gotoBatchPaymentPage: () => Promise<BatchPaymentPage>;
  gotoSinglePaymentPage: () => Promise<SinglePaymentPage>;
  gotoAccountsPage: () => Promise<AccountsPage>;
};

// extend Pw test fixture with custom ones
export const test = base.extend<Fixtures, Options>({
  // testing data
  testUserKey: ["" as TestUserKey, { scope: "worker", option: true }],
  testUser: [
    async ({ testUserKey }, use) => {
      await use(getTestUserData(testUserKey));
    },
    { scope: "worker" },
  ],

  // load translations based on Locale
  texts: [
    async ({}, use) => {
      await use(loadDictionary(locale));
    },
    { scope: "worker" },
  ],

  // vytvoření kontextu/page s autentizací
  authentication: [
    async ({ browser, testUserKey, testUser, texts }, use) => {
      await loginAndSaveStorageState(testUserKey, testUser, browser, texts);
      await use();
    },
    { scope: "worker" },
  ],

  loginPage: async ({ page, texts }, use) => {
    const loginPage = await gotoPage(page, texts, LoginPage);
    await use(loginPage);
  },

  gotoDashboard: async ({ authentication, page, texts }, use) => {
    await use(() => gotoPage(page, texts, Dashboard));
  },

  gotoBatchPaymentPage: async ({ authentication, page, texts }, use) => {
    await use(() => gotoPage(page, texts, BatchPaymentPage));
  },

  gotoSinglePaymentPage: async ({ authentication, page, texts }, use) => {
    await use(() => gotoPage(page, texts, SinglePaymentPage));
  },

  gotoAccountsPage: async ({ authentication, page, texts }, use) => {
    await use(() => gotoPage(page, texts, AccountsPage));
  },
});
