import { Page } from "@playwright/test"
import { Texts } from "../../../../fixtures/test.fixture"

export class BatchPaymentPage {

    constructor(private readonly page: Page, private readonly t: Texts) { }

    /**
     * Logika pro ověření, že stránka byla načtena.
     * Například čekání na element, který by měl být na stránce zobrazen
     */
    async expectLoaded(): Promise<void> {
        // TODO: add some validations to check page is loaded
    }

    /**
     * Projde rovnou na cílovou stránku, ze které test začíná
     */
    async goto(): Promise<void> {
        await this.page.goto(process.env.BATCH_PAYMENT_PAGE_URL!)
    }
}