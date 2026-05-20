import { gotoPage } from "@/helpers/pageFactory";
import { loadDictionary } from "@/i18n";
import { cs } from "@/i18n/cs";
import type { Schema } from "@/i18n/schema";
import { Dashboard } from "@/tests/pages/Dashboard";
import { LoginPage } from "@/tests/pages/login/LoginPage";
import { test as base } from "@playwright/test";
import {
  type TestUserKey,
  type TestUserData,
  getTestUserData,
} from "@/tests/testdata/testUsers";
import { locale, type Locale } from "@/config/locale";
import { loginAndSaveStorageState } from "@/tests/steps/login.step";

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
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await use(loadDictionary(locale(process.env.LOCALE as Locale)));
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

  gotoDashboard: async (
    { authentication: _authentication, page, texts },
    use,
  ) => {
    await use(() => gotoPage(page, texts, Dashboard));
  },
});
