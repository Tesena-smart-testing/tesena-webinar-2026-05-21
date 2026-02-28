import { env } from "../../../config/environment";
import { MissingTestUserKeyError } from "../../../errors/test-data-errors";
import { users as ACC_USERS } from "./acc";
import { users as INT_USERS } from "./int";

/**
 * Načtení uživatelů podle testovacího prostředí.
 * Pro env hodnotu 'ACC' nebo 'ACC2' se načte soubor 'tests/examples/testdata/testUsers/acc.ts'
 */
const USERS_BY_ENV = {
  ACC: ACC_USERS,
  ACC2: ACC_USERS,
  INT: INT_USERS,
  INT2: INT_USERS,
} as const;

/**
 * Deklarace datových typů pro klíč a hodnotu uživatele ze schématu
 * Použitím těchto typů dále v projektu zajišťujeme automatickou kontrolu hodnot (že používáme existující klíč pro uživatele)
 */
export type TestUserKey = keyof ReturnType<typeof getTestUsers>;
export type TestUserData = ReturnType<typeof getTestUsers>[TestUserKey];

export function getTestUsers() {
  return USERS_BY_ENV[env];
}

/**
 * Načte data uživatele podle jeho klíče. Kontrola je typová, to nám značně usnadňuje případné problémy s tím, pokud bychom použili neexistující klíč (pokud bychom jako klíč používali pouze string)
 *
 * @param key klíč uživatele
 * @returns data uživatele
 */
export function getTestUserData(key: TestUserKey): TestUserData {
  if (!key) {
    throw new MissingTestUserKeyError();
  }
  return getTestUsers()[key];
}

/**
 * Funkce pro získání cesty ke storagePath podle uživatelského klíče a prostředí
 * @param key klíč uživatele
 * @returns cesta ke storagePath
 */
export const storagePath = (key: string) => `./.auth/${env}/${key}.json`;
