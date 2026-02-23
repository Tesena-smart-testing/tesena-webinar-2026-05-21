import { Browser } from "@playwright/test"
import { Texts } from "../../fixtures/test.fixture"
import { LoginPage } from "../pages/login/LoginPage"
import { storagePath, TestUserData, TestUserKey } from "../testdata/testUsers"
import { expectPage } from "../../helpers/pageFactory"
import { Dashboard } from "../pages/Dashboard"
import fs from 'node:fs'
import { SmsLogin } from "../pages/login/components/SmsLogin"
import { OtpLogin } from "../pages/login/components/OtpLogin"

export class LoginStep {

    constructor(readonly loginPage: LoginPage) {}

    async loginBySms(username: string, password: string): Promise<SmsLogin> {
        await this.fillCredentialsClickLogin(username, password)
        return await this.loginPage.smsLoginComponent.expectLoaded()
    }

    async loginByOtp(username: string, password: string): Promise<OtpLogin> {
        await this.fillCredentialsClickLogin(username, password)
        return await this.loginPage.otpLoginComponent.expectLoaded()
    }

    async fillCredentialsClickLogin(username: string, password: string) {
        await this.loginPage.usernameInput.fill(username)
        await this.loginPage.passwordInput.fill(password)
        await this.loginPage.loginButton.click()
    }
}

/**
* Funkce pro přihlášení do aplikace a uložení stavu do storage state. Protože je autentizace 'worker scoped', vytváří vlastní page kontext z Browser.
* 
* @param testUserKey uživatel pro přihlášení
* @param testUser uživatelská data (jméno, heslo, ...)
* @param browser instance prohlížeče pro daný worker
* @param texts překladový slovník (textace)
*/
export async function loginAndSaveStorageState(testUserKey: TestUserKey, testUser: TestUserData, browser: Browser, texts: Texts) {
    const storageStatePath = storagePath(testUserKey)
    if (!fs.existsSync(storageStatePath)) {
        throw new Error(`Storage state file does not exist at [${storageStatePath}]`)
    }

    const context = await browser.newContext()
    const page = await context.newPage()
    try {
        const loginPage = new LoginPage(page, texts)
        await loginPage.goto();

        const loginStep = new LoginStep(loginPage)
        const otpLogin = await loginStep.loginByOtp(testUser.loginNumber, testUser.password);
        await otpLogin.confirmLogin(testUser.token)

        await expectPage(page, texts, Dashboard)
        await page.context().storageState({
            path: storagePath(testUserKey)
        })

    } finally {
        await context.close()
    }
}