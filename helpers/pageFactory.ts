import type { Page } from "@playwright/test";
import type { Texts } from "../fixtures/test.fixture";

export type LoadablePage<T> = {
  new (page: Page, t: Texts): T;
};

/**
 * Synchronizace mezi testem a aplikací. Metoda inicializuje page typu 'LoadablePage' - class, která musí mít deklarovanou metodu 'expectLoaded()'.
 * Po inicializaci se provolá 'expectLoaded()' a tím se ověří, že stránka se úspěšně načetla.
 *
 * V rámci implementace metody 'expectLoaded()' se většinou použije Playwright 'waitFor()' funkce atp.
 *
 * @param page instance page (okno prohlížeče) z Playwright
 * @param t překladový slovník
 * @param Ctor konstruktor (typ objektu)
 * @returns novou instanci vytvořené page
 */
export async function expectPage<T extends { expectLoaded(): Promise<void> }>(
  page: Page,
  t: Texts,
  Ctor: LoadablePage<T>,
): Promise<T> {
  const po = new Ctor(page, t);
  await po.expectLoaded();
  return po;
}

/**
 * Metoda inicializuje page typu 'LoadablePage' - class, která musí mít deklarovanou metody 'expectLoaded()' a 'goto()'.
 * Po inicializaci se provolá 'goto()' pro připojení na cílovou stránku aplikace a následně 'expectLoaded()' - tím se ověří, že stránka se úspěšně načetla.
 *
 * @param page instance page (okno prohlížeče) z Playwright
 * @param t překladový slovník
 * @param Ctor konstruktor (typ objektu)
 * @returns novou instanci vytvořené page
 */
export async function gotoPage<
  T extends { expectLoaded(): Promise<void>; goto(): Promise<void> },
>(page: Page, t: Texts, Ctor: LoadablePage<T>): Promise<T> {
  const po = new Ctor(page, t);
  await po.goto();
  await po.expectLoaded();
  return po;
}
