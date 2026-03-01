import { expect } from "@playwright/test";
import { test } from "@/fixtures/test.fixture";
import { TestGroup } from "@/helpers/testGroups";

test.describe("Login tests", () => {
  test(`${TestGroup.LOGIN} ${TestGroup.NO_USER} Login button enabling test`, async ({
    loginPage,
  }) => {
    await test.step("Login button is disabled by default", async () => {
      await expect(loginPage.loginButton).toBeDisabled();
    });

    await test.step("Login button is disabled when only username is filled in", async () => {
      await loginPage.usernameInput.fill("username");
      await expect(loginPage.loginButton).toBeDisabled();
    });

    await test.step("Login button is disabled when only password is filled in", async () => {
      await loginPage.usernameInput.clear();
      await loginPage.passwordInput.fill("password");
      await expect(loginPage.loginButton).toBeDisabled();
    });

    await test.step("Login button is en abled when username and password filled in", async () => {
      await loginPage.usernameInput.fill("username");
      await expect(loginPage.loginButton).toBeEnabled();
    });
  });
});
