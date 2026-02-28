# Playwright automation project - template

- [Instalace](#instalace)
  - [Stažení prohlížečů](#stažení-prohlížečů)
- [Kontrola a formátování kódu](#kontrola-a-formátování-kódu)
  - [Lintování](#lintování)
  - [Formátování](#formátování)
  - [pre-commit hook](#pre-commit-hook)
- [Struktura projektu](#struktura-projektu)
  - [Playwright configurace](#playwright-configurace)
- [Worker scope vs. test scope](#worker-scope-vs-test-scope)
  - [Test scope](#test-scope)
  - [Worker scope](#worker-scope)
- [Aktuální nastavení a chování projektu](#aktuální-nastavení-a-chování-projektu)
  - [Testovací data](#testovací-data)
  - [Překladový slovník (i18n)](#překladový-slovník-i18n)
  - [Helpers](#helpers)
    - [Test groups](#test-groups)
    - [Page factory](#page-factory)
- [Fixtures](#fixtures)
  - [Options](#options)
  - [Fixtures](#fixtures-1)
- [Tests](#tests)
  - [Pages](#pages)
  - [Components](#components)
  - [Test Steps](#test-steps)

## Instalace

```shell
npm install
```

### Stažení prohlížečů

Pro Playwright je potřeba stáhnout jednotlivé prohlížeče. Ty se stahují příkazem:

```shell
npx playwright install
```

## Kontrola a formátování kódu

Pro zajištění kvality kódu a jednotného stylu používáme ESLint pro lintování a Prettier pro formátování. Pro automatickou kontrolu před každým commitem je nastaven pre-commit hook pomocí Husky.

### Lintování

Lintování může být prováděno:

- automaticky, dle nastavení IDE. Je třeba mít nainstalován ESlint plugin v IDE a nastaveno automatické lintování při ukládání souboru.

- manuálně přes příkaz:

```shell
npm run lint
```

- automaticky před každým commitem díky Husky pre-commit hooku.

### Formátování

Formátování kódu může být prováděno:

- automaticky, dle nastavení IDE. Je třeba mít nainstalován Prettier plugin v IDE a nastaveno automatické formátování při ukládání souboru.

- manuálně přes příkaz:

```shell
npm run format
```

- automaticky před každým commitem díky Husky pre-commit hooku.

### Typechecking

Aby mohl projekt využívat všechny výhody TypeScriptu, je důležité mít zapnutý typechecking. Ten nám zajišťuje kontrolu datových typů, struktury objektů a dalších aspektů kódu, které nám pomáhají předcházet chybám a psát kvalitnější kód.

K tomu je třeba mít nastaven `tsconfig.json` v kořenovém adresáři projektu, který definuje konfiguraci pro TypeScript. V tomto souboru jsou nastaveny základní možnosti pro kompilaci TypeScriptu, včetně cesty k testům a dalším zdrojovým souborům.

V rámci Playwright projektu není Typescript konfigurace potřeba pro kompilaci, protože Playwright kompilaci provádí sám dle své vnitřní TS konfigurace.

V Playwright projektu je tedy `tsconfig.json` třeba pouze pro zajištění funkčnosti typecheckingu.

Typechecking může být prováděn:

- manuálně přes příkaz:

```shell
npm run typecheck
```

- silně doporučeno nastavit typechecking v IDE (např. ve VSCode, pokud má projekt instalovaný Typescript jako závislost,
  by měl být typechecking automaticky zapnutý).

- v CI/CD pipelině.

## Struktura projektu

```
├── config/             # Definice základní konfigurace. V tomto případě jsou zde definovány konstanty pro testovací prostředí a locale (jazyk)
├── errors/             # Implementace vlastních vyjímek
├── fixtures/           # Sdílený testovací kontext - setup a teardown logika na úrovni testu nebo workera. Příprava testovacího prostředí a dat, inicializace objektů a jejich předávání do test kontextu
├── helpers/            # Sdílené pomocné funkce (neobsahují logiku ani assertions testů). Používané napříč testy, zjednodušují opakující se operace (parsování textu, waity, inicializace objektů atp.)
├── i18n/               # Internalization: schéma a definice jazykových souborů určených pro textové překlady - text nikdy nepíšeme "na tvrdo" do pages nebo components, ale načítáme v konfiguraci a dále pak do pages a components předáváme
├── tests
|   ├── pages/              # Definice objektů představující stránky testované aplikace. Obsahuje také components - objekty představující jednotlivé části aplikace (tlačítka, formuláře atp.)
|   ├── setup/              # Testy a skripty pro úvodní nastavení před samotnou exukucí testů
|   ├── testdata/           # Schéma a definice pro testovací data - v tomto případě uživatele per prostředí. Schéma definuje vlastnosti uživatelů a zajišťuje integritu dat mezi prostředími
|   ├── steps/              # Implementace testovacích kroků, které se na stránkách, komponentách a v testech opakují. Jedná se většinou o složitější metody typu vyplňování celých formulářů atp.
|   ├── accounts.spec.ts    # Příklady testů pro účty v rámci 1IB
|   └── payments.spec.ts    # Příklady testů pro platby v rámci 1IB
|
├── .env					    # Nastavení proměnných sdílených napříč prostředími
├── .env.acc                    # Proměnné prostředí pro ACC
├── .env.int                    # Proměnné prostředí pro INT
├── package.json                # Nastavení projektu a jeho závislostí
├── playwright.config.ts        # Playwright konfigurace
└── .gitignore                  # Základní nastavení pro push do GITu
```

### Playwright configurace

Pro celkovou konfiguraci uprav soubor `playwright.config.ts`. Zde dochází k načítání základního nastavení (proměnné prostředí), k definici projektů a jejich testů a také ke konfiguraci chování celého Playwright při exekuci testů.
V souboru najdeš všechna nastavení okomentována. Jedná o základní template, který můžeš jakkoliv upravit podle svých potřeb.

## Worker scope vs. test scope

V rámci Playwright rozlišujeme 2 životní cykly (scopes) a to `worker` a `test`. Definují životnost objektu, který v daném scope vytvoříme. `worker` scope sdílí své objekty napříč testy, zatímco `test` scope platí pouze pro konkrétní test a na jeho konci se zničí. V rámci [Fixtures](#fixtures) to tedy znamená, kdy se daná Fixture vytvoří, kdy se zničí a zda bude sdílena mezi testy nebo ne.

### Test scope

Platí pouze pro konkrétní test a zničí se po testu. Každý test má svoji instanci.

- `page`
- `context`
- testovací data (pokud má každý test jiná)

V tomto případě dostane každý test na vstupu svoji instanci okna prohlížeče - `page`

```typescript
test(`Test`, async ({ page }) => {});
```

Stejným způsobem pak budou fungovat všechny Fixtures, které se vytvoří se scope = test (by default)

### Worker scope

Sdílené mezi testy běžícími na stejném workeru. Worker je samostatný proces (můžeme chápat jako vlákno) s vlastní pamětí. Cokoliv co se vytvoří v rámci worker scope je vytvořeno pro daný worker pouze jednou a sdíleno napříč testy. Počet workerů = paralelní běh.

- `browser`
- `storageState` (například přihlášený stav - token)
- seed databáze

# Aktuální nastavení a chování projektu

## Testovací data

V tomto template definujeme testovací data jako uživatele pro jetnotlivá prostředí. Seznam uživatelů je definován ve schématu `tests/examples/testdata/testUsers/schema.ts`. Jsou zde jako příklad vydefinováni 2 testovací uživatelé.

```typescript
export type Users = {
  paymentsTestsUser: TestUser;
  accountsTestsUser: TestUser;
};
```

V rámci tohoto scématu je také definováno, jaká data (props) každý uživatel má (povinná i nepovinná). V našem případě se jedná o povinná properties `loginNumber`, `password` a `oli`.

```typescript
export type TestUser = {
  loginNumber: string;
  password: string;
  oli: string;

  bankAccounts?: BankAccount[];
};
```

Samotná data jsou dle schémat definována v souborech `acc.ts` a `int.ts`. Protože využíváme schéma, TypeScript za nás kontroluje, že každý uživatel bude mít deklarována všechna povinná pole, bude mít odpovídající název klíče a také, že oba soubory se nebudou lišit.
V případě, že nechceme mít hesla uložena v .gitu (v tomto případě se nejedná o nic tajného), dá se řešení upravit načítáním hesel z .env souboru, který bude v projektu pouze lokálně.

```typescript
export const users: Users = {
  paymentsTestsUser: {
    loginNumber: "uneccb",
    password: "Heslo0001",
  },
  accountsTestsUser: {
    loginNumber: "accautopsda",
    password: "Heslo0001",
  },
};
```

Definice uživatele pro určité testy se provádí funkcí `describeAsUser`. Tato funkce očekává na vstupu klíč existujícího uživstele ze schématu `tests/examples/testdata/testUsers/schema.ts`. TypeScript toto kontroluje a proto není možné zadat nevalidní hodnotu (neexistujícího uživatele z testovacích dat). Klíč (název uživatele) je vložen do názvu testu a díky tomu je Playwright schopen přes RegExp tyto testy seskupit.

```typescript
export function describeAsUser(
  userKey: TestUserKey,
  title: string,
  fn: () => void,
) {
  test.describe(`@${userKey} ${title}`, () => {
    fn();
  });
}
```

Použití uživatele v testech je jednoduché. `accountsTestsUser` je klíč uživatele z testovacích dat, definovaný ve schématu (viz výše). Použijeme ho tedy jako parametr funkce `describeAsUser`.

```typescript
describeAsUser("accountsTestsUser", "1IB tests", async () => {
  test(`${TestGroup.ACCOUNTS} Standard account test`, async ({
    gotoAccountsPage,
  }) => {
    const accountsPage = await gotoAccountsPage();
  });
});
```

V souboru `playwright.config.ts` je automaticky generována matice projektů pro všechny uživatele definované v testovacích datech. Vytvoří se tedy projekt per každý uživatel a testy se tímto způsobem seskupí.
Každá tato skupina má přiřazeného 1 workera (vlákno), tak aby testy na stejných uživatelích neběžely paralelně. Paralelizace běží napříč projekty, tedy mezi různými uživateli.

> ℹ️ **Info**
> Pokud nepotřebujeme řešit problém s paralelními testy na stejném uživateli, můžeme toto generování nahradit klasickým nastavením projektů a rozdělit je například podle zaměření (testy plateb, účtů, karet) nebo typu (smoke, e2e, atp.)

```typescript
const projectMatrix = (
  Object.keys(testUsers) as Array<keyof typeof testUsers>
).map((userKey) => ({
  name: `${userKey}`,
  workers: 1,
  grep: RegExp(`@${userKey}`),
  use: {
    testUserKey: userKey,
    storageState: `./.auth/${env}/${userKey}.json`,
  },
}));
```

**Proč nenačítáme testovací data z .env souborů?**

- Ztrácíme typovost (v .env souborech nelze řešit datové typy)
- Nemáme kontrolu nad tím, že data obsahují všechna povinná pole
- Není možné automaticky kontrolovat, že data pro jednotlivá prostředí se neliší (že jsme nezapomněli pro některé prostředí data vytvořit atp.)

## Překladový slovník (i18n)

Při programování testů bychom se měli vyhnout tomu, aby textace byly přímou součástí jednotlivý Pages nebo testů. Tímto způsobem si totiž uzavíráme možnost aplikaci testovat ve více jazycích. V tomto projektu tedy definujeme slovníky a to pro jednotlivé jazyky (cs, en). Slovníky mají opět své schéma, které musí být dodrženo a díky tomu máme automatickou kontrolu nad tím, že slovníky se co do klíčů mezi sebou neliší. Schéma naleznete v souboru `tests/examples/i18n/schema.ts`.

Funkce `loadDictionary` v souboru `tests/examples/i18n/index.ts` pak načítá textace podle zvoleného jazyka (locale). Soubory `tests/examples/i18n/cs.ts` a `tests/examples/i18n/en.ts` jsou pak samotné slovníky.

## Helpers

### Test groups

V této složce naleznete definici testovacích skupin (test groups), do kterých můžeme rozdělovat naše testy. Tím, že testy rozdělíme do skupin (payments, accounts, e2e, smoke apod.), máme poté možnost pouštět pouze testy z nějaké skupiny a ne vždy celý test scope.
Spuštění testů určité skupiny se provádí přes `--grep`. Aby to fungovalo, musí mít daný testy v názvu dané slovo, podle kterého "grepujeme".

Soubor `tests/examples/helpers/testGroups.ts` obsahuje konstantu `TestGroup`, ve které definujeme skupinu `PAYMENTS` s hodnotou "@payments" - toto je název skupiny.

```typescript
test(`${TestGroup.PAYMENTS} Standard account test`, async ({
  gotoAccountsPage,
}) => {
  const accountsPage = await gotoAccountsPage();
});
```

Tímto způsobem spustíme pouze testy spadající do skupiny "@payments"

```shell
npx playwright test --grep "@payments"
```

### Page factory

Abychom nemuseli inicializaci Pages dělat v každém testu a navíc měli automaticky zajištěno, že při této inicializaci se provolají další metody - například pro synchronizaci testu s aplikací a ověření správného načtení stránky - používáme pro inicializaci vlastní factory. Ta obsahuje 2 metody pro inicializaci Pages - `expectPage()` a `gotoPage()`. Obě metody vytváří novou instanci objektu, který jim předáme a navíc definují, že daný objekt musí implementovat metody `expectLoaded()` a `goto()`

#### `expectLoaded()`

Kontrola načtení stránky. Většinou bude obsahovat metody jako `waitFor()` na lokátory elementů definované pro danou Page. Provoláním této metody zajistíme synchronizaci mezi testem a aplikací - počkáme, než se stránka načte

```typescript
async expectLoaded(): Promise<void> {
    await this.username.waitFor({ state: 'visible' })
}
```

#### `goto()`

Metoda pro připojení na stránku přes její URL adresu a následné zavolání `expectLoaded()`. Tuto metodu využijeme, pokud chceme přímo přes URL přistoupit na některou ze stránek testované aplikace (nemusíme se aplikací na dané místo proklikávat)

```typescript
async goto() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' })
}
```

## Fixtures

### `user.fixture.ts`

V tomto souboru (`tests/examples/fixtures/user.fixture.ts`) definujeme metodu `describeAsUser()`, pomocí které přiřazujeme k testům jejich uživatele. Podle těchto uživatelů jsou testy seskupovány a následně spouštěny sériově.

### `test.fixture.ts`

Jeden z nejdůležitějších souborů projektu. Tady rozšiřujeme základní Playwright `test` o vlastní fixtures a options. Všechny definované fixtures a options můžeme následně použít jako vstupy pro naše testy.

#### Options

Jedná se o "worker based" objekty, tedy jejich instance se vytváří jednou pro každého workera - v našem případě tedy pro každého uživatele. Patří sem právě textace (překladové slovníky), uživatelské klíče a samotná uživatelská data. Obecně vše, co bude společné pro všechny testy na jednom uživateli. Tím pádem například také autentizace do aplikace - nechceme se přihlašovat pokaždé, pouze jednou. Inicializací `authentication` dojde k přihlášení do aplikace, po kterém se uloží cookies a origins do storage každého uživatele - `./.auth/${env}/${userKey}.json`

Protože projekt má nastaveno, aby pro svého uživatele použil právě danou storage, nemusíme se už poté znovu přihlašovat (viz `playwright.config.ts` a `projectMatrix`). Samotná implementace daných options je deklarována ve funkci

```typescript
const test = base.extend<Fixtures, Options> ...
```

#### Fixtures

Objekty, které jsou test scoped, tedy jejich vyhodnocení probíhá pokaždé, když je použijeme v testu. Patří sem inicializace Pages, na které v testech přistupujeme, respektive funkcí, které tyto Pages vytvoří pomocí naší `pageFactory`. Jejich implementace je stejně jako u Options uvnitř `base.extend()` a tyto Fixture můžeme následně použít jako vstupní objekty našich testů.

V tomto případě je vstupní fixture metoda `gotoAccountsPage`, která vytvoří instanci třídy `AccountsPage`, připojí se do ní skrze funkci `goto()` a následně ověří její načtení přes `expectLoaded()`. Na vstupu této fixture jsou definovány další fixtures nebo options. V tomto případě se jedná o option `authentication`, které zajistí přihlášení do aplikace, `page` je instance okna prohlížeče a `texts` je překladový slovník.

```typescript
import { expectPage, gotoPage } from "../helpers/pageFactory";

gotoAccountsPage: async ({ authentication, page, texts }, use) => {
  await use(() => gotoPage(page, texts, AccountsPage));
};
```

```typescript
test(`${TestGroup.ACCOUNTS} Standard account test`, async ({
  gotoAccountsPage,
}) => {
  const accountsPage = await gotoAccountsPage();
});
```

## Tests

### Pages

Pages (PO - PageObject) jsou třídy představující jednotlivé stránky testované aplikace. Každý takový PO musí obsahovat konstruktor s parametrem `page` (Playwright kontext stránky prohlížeče) a `texts` (překladový slovník). Oba tyto parametry jsou označeny jako `private` a `readonly` (přístup k nim mají pouze metody a props dané třídy).

```typescript
constructor(private readonly page: Page, private readonly t: Texts) { }
```

PO by měl obsahovat komponenty nebo elementy (zde záleží čistě na programátorovi - rozhoduje většinou složitost elementu, případně pokud chceme objekt, který zastupuje více elemementů, jedná se o komponentu), které se na dané stránce nachází. Tyto elementy a komponenty jsou reprezentovány `get` metodami, které vrací jejich Lokátor.

```typescript
get usernameInput() {
    return this.page.locator('input#username')
}
```

- `page` využíváme k definici lokátoru
- `texts` používáme v případě, že lokátor chceme obohatit o slovo/větu z překladového slovníku

```typescript
get loginButton() {
    return this.page.locator(`//button[contains(text(), '${this.t.loginPage.loginButton.title}')]`)
}
```

Další, co může PO obsahovat, jsou jednoduché metody pro práci s elementy, jako `click()`, `fill()`, `clickSave()` atp. Žádný PO však nesmí obsahovat business logiku, tedy metody většího rozsahu jako `sendForm()`, `fillForm()`, `createOrder()` nebo Assertions (mimo metody `expectLoaded()`). Složitější metody pro práci s několika elementy a komponentami na stránce pak deklarujeme v takzvaném [Test stepu](#test-steps). Stejně tak patří do Test stepu aplikační logika nebo Assertions.

## Components

Komponenty představují složitější elementy nebo větší celky nějakého PO. Používáme je také v případě, že některé elementy jsou v aplikaci na několika místech, tak abychom předešli duplicitám. Komponenta obsahuje opět ten samý konstruktor jako PO a deklaruje elementy nebo komponenty, ze kterých se skládá. Stejně jako u PO, komponenta neobsahuje složitější metody pro práci s elementy nebo business logiku. Tyto metody jsou deklarovány na `Test stepu`.

```typescript
export class Menu {
  constructor(
    private readonly page: Page,
    private readonly t: Texts,
  ) {}

  async expectLoaded(): Promise<Menu> {
    await this.menu.waitFor({ state: "visible" });
    return this;
  }

  get menu() {
    return this.page.locator("ul[role='menu']");
  }
}
```

Komponenta nesmí obsahovat také žádnou navigaci! Tímto pak ztrácíme znovupoužitelnost (komponenta neví (a nemá vědět), kam aplikace půjde dál).

```typescript
export class Menu {
  async clickOnSinglePayments() {
    await this.singlePaymentsButton.click();
    await this.page.waitForUrl("**/singlePayments"); // toto je špatně
  }
}
```

Business logiku bude obsahovat Test step, který zavolá metodu `clickOnSinglePayments()`, která pouze klikne na tlačítko v menu, ale kontrola přesměrování už proběhne v rámci Test stepu. Jednoduše řečeno, PO nebo Component něco udělá, ale už neřeší, co se má stát.

```typescript
export class MenuStep {
  async gotoSinglePayments() {
    await this.menu.clickOnSinglePayments();
    await this.page.waitForUrl("**/singlePayments");
  }
}
```

## Test steps

Takzvané Test Steps jsou třídy, které obsahují business logiku stránek, ke kterým jsou vázané. Každý PO má svůj Test Step, který obsahuje metody pro akce na daném PO. Tyto akce poté voláme z testu. Je to tedy vrstva mezi testy a PO a využíváme ji proto, že PO nesmí obsahovat business logiku a zároveň, business logiku je sdílena mezi testy a proto ji nechceme v každém testu deklarovat znovu - duplikovat.

## Inicializace

Initializace stepu by měla prpbíhat na úrovni testu. Pouze pokud se jedná o stepy, které se používají takřka ve všech testech, můžeme jejich inicializaci přesunout do Fixtures, abychom kód neduplikovali.

```typescript
test(`${TestGroup.PAYMENTS} Single payment test`, async ({
  gotoSinglePaymentPage,
}) => {
  const singlePaymentPage = await gotoSinglePaymentPage();

  const singlePaymentStep = new SinglePaymentStep(singlePaymentPage);
  await singlePaymentStep.expectPaymentFormVisible();
});
```

#### Co by měl/může obsahovat

- Uživatelské kroky
- Business flow
- Vše, co je sdíleno více scénáři
- Playwright `await test.step(...)` pro lepší reporting a přehlednost jednotlivých kroků
- Assertions

#### Co by neměl obsahovat

- Atomické práce s jedním elementem (`click`, `save`, atp.)
- Žádné `page.locator()`, toto má být v PO

#### Výhody

- Testy jsou čitelnější
- Logika na jednom místě
- PO/Component je pouze UI mapa aplikace
- Lepší práce s čekaním a stabilizací testů

#### Možné nevýhody

- Duplicitní umělá vrstva navíc - pokud pouze přeposílá 1:1 metody z PO/Component do testu

## Test Step pro PO

Každy PO by měl mít svůj Test Step, který obsahuje business logiku dané stránky, assertions atp. Testy poté volají funkce z daného Stepu, nikoliv přímo z PO.

## Test Step pro Component

Component Steps mohou být vytvářeny uvnitř PO Steps jako interní detail page flow, pokud nemá test důvod řešit komponentu samostatně. Pokud je však komponenta sdílena nebo testovaná samostatně, její Step se vytváří na úrovni testu.

```typescript
// PO pro Login page
export class LoginPage {
  constructor(
    private readonly page: Page,
    private readonly texts: Texts,
  ) {}

  cookiesModalComponent(): CookiesModalComponent {
    return new CookiesModalComponent(this.page.locator("form#cookies"));
  }
}

// Test Step pro LoginPage PO
export class LoginPageStep {
  constructor(readonly loginPage: LoginPage) {}
}
```

### Inicializace komponenty uvnitř PO Test Stepu nebo Testu

V následujícím příkladu je evedena inicializace Test Stepu pro komponentu uvnitř Test Stepu pro PO. Protože test nepotřebuje vůbec modální okno řešit, nemusíme komponentu vytvářet na jeho úrovni.

> V realitě bychom Test Step pro komponentu řešící Cookies modální okno ani neimplementovali - tato komponenta nebude sdílená mezi více PO a tím pádem bychom zbytečně vytvářeli další soubor/třídu. Uvedený kód je pouze pro představu práce s Test Step pro PO a Component.

```typescript
// PO pro Login page
export class LoginPage {
  constructor(
    private readonly page: Page,
    private readonly texts: Texts,
  ) {}

  cookiesModalComponent(): CookiesModalComponent {
    return new CookiesModalComponent(this.page.locator("form#cookies"));
  }
}

// Component pro modální okno Cookies
export class CookiesModalComponent {
  constructor(readonly root: Locator) {}

  async submit() {
    // klikám na tlačítko submit, víc už komponenta neřeší
    await this.root.locator("button#submit").click();
  }
}
// Test Step pro Login page
export class LoginPageStep {
  constructor(readonly loginPage: LoginPage) {}

  async submitCookiesModal() {
    // test vůbec neví, že něco jako CookiesModal komponenta existuje (nepotřebuje ji řešit)
    const cookiesModal = new CookiesModalStep(
      this.loginPage.cookiesModalComponent(),
    ); // step pro komponentu
    await cookiesModal.submit();
  }
}

// Test step pro Cookies komponentu
export class CookiesModalStep {
  constructor(readonly cookiesModalComponent: CookiesModalComponent) {}

  async submit() {
    await this.cookiesModalComponent.submit();
    // Assertion - logika patří na Step nebo do Testu
    await expect(this.cookiesModalComponent.root).toBeHidden();
  }
}
```

Pokud chceme ale nějakou komponentu přímo testovat, inicializujeme ji přímo v Testu.

```typescript
test(`${TestGroup.PAYMENTS} Single payment test`, async ({
  gotoSinglePaymentPage,
}) => {
  const singlePaymentPage = await gotoSinglePaymentPage();
  const accountSelectFormComponent =
    singlePaymentPage.accountSelectFormComponent();

  const accountSelectFormStep = new AccountSelectStep(
    accountSelectFormComponent,
  );
  await accountSelectFormStep.fillAccountNumber("123/123");
  await accountSelectFormStep.expectAccountNumberErrorVisible();
});
```
