import { test } from "@playwright/test";
import { HomePage } from "@/tests/pages/home/HomePage";
import { SearchResultsPage } from "@/tests/pages/search/SearchResultsPage";
import { SearchStep } from "@/tests/steps/search.step";
import { TestGroup } from "@/helpers/testGroups";
import { loadDictionary } from "@/i18n";
import { locale, type Locale } from "@/config/locale";

test.describe("Search tests", () => {
  test(`${TestGroup.SEARCH} ${TestGroup.NO_SESSION} Searching for "tshirt" shows relevant results`, async ({
    page,
  }) => {
    const t = loadDictionary(locale(process.env.LOCALE as Locale));
    const homePage = new HomePage(page, t);
    const searchResultsPage = new SearchResultsPage(page, t);
    const searchStep = new SearchStep(homePage, searchResultsPage);

    await homePage.goto();
    await homePage.expectLoaded();

    await test.step('User enters "tshirt" in the search input and submits', async () => {
      await searchStep.searchFor("tshirt");
    });

    await test.step("Search results heading is visible", async () => {
      await searchStep.verifyResultsHeadingVisible();
    });

    await test.step("Total products label is visible", async () => {
      await searchStep.verifyTotalProductsLabelVisible();
    });

    await test.step("At least one product card is visible in the results", async () => {
      await searchStep.verifyResultsVisible();
    });
  });
});
