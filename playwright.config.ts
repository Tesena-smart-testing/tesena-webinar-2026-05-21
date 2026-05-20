import * as dotenv from "dotenv";
import { env } from "@/config/environment";
import { defineConfig } from "@playwright/test";
import * as path from "node:path";
import { getTestUsers, storagePath } from "@/tests/testdata/testUsers";
import { locale, type Locale } from "@/config/locale";

dotenv.config({ path: path.resolve(process.cwd(), ".env"), override: true });
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });

const rawLocale = (process.env.LOCALE || "cs-CZ") as Locale;
const verifiedLocale = locale(rawLocale);
process.env.LOCALE = verifiedLocale;

process.env.ENVIRONMENT = env;

const testUsers = getTestUsers();

// One project per user, one worker each — tests for the same user run serially.
// Filter by @userKey tag in test names.
const projectMatrix = (
  Object.keys(testUsers) as Array<keyof typeof testUsers>
).map((userKey) => ({
  name: `${userKey}`,
  workers: 1,
  grep: RegExp(`@${userKey}`),
  dependencies: ["setup:cookies"],
  use: {
    storageState: storagePath(userKey),
  },
}));

const setupProject = {
  name: "setup:cookies",
  testMatch: "**/*cookies.setup.ts",
};

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: "html",
  globalSetup: "tests/setup/storageState.setup.ts",
  use: {
    baseURL: process.env.BASE_URL,
    launchOptions: {
      args: ["--disable-features=LocalNetworkAccessChecks"],
    },
    trace: "on-first-retry",
    headless: !!process.env.CI,
    locale: verifiedLocale,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  expect: {
    timeout: 15_000,
  },
  projects: [
    setupProject,
    {
      name: `No user tests`,
      grep: RegExp(`@nouser`),
      dependencies: ["setup:cookies"],
      use: {
        storageState: storagePath("nouser"),
      },
    },
    ...projectMatrix,
  ],
});
