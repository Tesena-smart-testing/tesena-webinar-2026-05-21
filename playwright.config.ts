import * as dotenv from "dotenv";
import { env } from "@/config/environment";
import { defineConfig } from "@playwright/test";
import * as path from "path";
import { getTestUsers, storagePath } from "@/tests/testdata/testUsers";
import { locale, type Locale } from "@/config/locale";

/**
 * Konfigurace pro načítání env. properties
 */
dotenv.config({ path: path.resolve(process.cwd(), ".env"), override: true });
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });

const rawLocale = (process.env.LOCALE || "cs-CZ") as Locale;
const verifiedLocale = locale(rawLocale);
process.env.LOCALE = verifiedLocale;

/**
 * Nastavení prostředí pro @playwright-helper (autentizace, reporting atp.)
 */
process.env.ENVIRONMENT = env;

/**
 * Načtení uživatelů podle zvoleného testovacího prostředí
 */
const testUsers = getTestUsers();

/**
 * Nastavení projektu. Pro každého uživatele se vytvoří samostatný projekt, kterému je přiřazen 1 worker (vlákno).
 * Toto nastavení má za následek, že ačkoliv testy spustíme paralelně, testy pro jednoho uživatele se pouští sériově.
 *
 * Pokud tedy máme 10 uživatelů, až 10 testů může jet paralelně (1 worker per uživatel).
 * Toto nastavení se hodí, pokud aplikace neumožňuje paralelní testy jedním uživatelem - problém může nastat například při ceritifikacích.
 *
 * Pokud není nutné u projektu toto řešit, generování prijektové matice lze smazat a použít klasické Playwright nastavení projektů
 */
const projectMatrix = (
  Object.keys(testUsers) as Array<keyof typeof testUsers>
).map((userKey) => ({
  name: `${userKey}`,
  workers: 1,
  // Playwright automaticky seskupí testy pro jednotlivé uživatele přes RegExp. Tedy podle výskytu uživatelského jména v názvu testu
  grep: RegExp(`@${userKey}`),
  // před samotnými testy spouštíme tkz. setup testy. Ty nám připraví testovací prostředí - v tomto případě odsouhlasí cookies
  dependencies: ["setup:cookies"],
  // každý uživatel má svůj storage state kontext, do kterého je uloženo přihlášení a další cookies
  // díky tomu se uživatel nemusí pokaždé přihlašovat ani cookies potvrzovat
  use: {
    testUserKey: userKey,
    // nastavení cesty ke storage
    storageState: storagePath(userKey),
  },
}));

/**
 * Setup pro potvrzení cookies a uložení do Storage state pro každého uživatele.
 */
const setupProject = {
  name: "setup:cookies",
  testMatch: "**/*cookies.setup.ts",
};
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  ...(process.env.CI ? { workers: 1 } : {}),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  globalSetup: "tests/setup/storageState.setup.ts",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `${process.env.BASE_URL}`,

    launchOptions: {
      args: ["--disable-features=LocalNetworkAccessChecks"],
    },

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    headless: false,
    locale: verifiedLocale,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  expect: {
    timeout: 15_000,
  },

  /* Konfigurace projektů */
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

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
