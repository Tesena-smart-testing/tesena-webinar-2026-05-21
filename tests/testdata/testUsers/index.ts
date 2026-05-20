import { env } from "@/config/environment";
import { MissingTestUserKeyError } from "@/errors/test-data-errors";
import { users as TEST_USERS } from "@/tests/testdata/testUsers/acc";
import { users as PROD_USERS } from "@/tests/testdata/testUsers/int";

const USERS_BY_ENV = {
  TEST: TEST_USERS,
  PROD: PROD_USERS,
} as const;

export type TestUserKey = keyof ReturnType<typeof getTestUsers>;
export type TestUserData = ReturnType<typeof getTestUsers>[TestUserKey];

export function getTestUsers() {
  return USERS_BY_ENV[env];
}

export function getTestUserData(key: TestUserKey): TestUserData {
  if (!key) {
    throw new MissingTestUserKeyError();
  }
  return getTestUsers()[key];
}

export const storagePath = (key: string) => `./.auth/${env}/${key}.json`;
