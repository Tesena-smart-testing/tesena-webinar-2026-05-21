import type { TestUserKey } from "../tests/testdata/testUsers";
import { test } from "./test.fixture";

export function describeAsUser(
  userKey: TestUserKey,
  title: string,
  fn: () => void,
) {
  test.describe(`@${userKey} ${title}`, () => {
    fn();
  });
}
