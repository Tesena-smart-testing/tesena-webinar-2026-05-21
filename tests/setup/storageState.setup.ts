import { FullConfig } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { getTestUsers, storagePath } from "../testdata/testUsers";
import { env } from "../../config/environment";

export default async function createStorageStates(_config: FullConfig) {
  fs.mkdirSync(path.resolve(`./.auth/${env}`), { recursive: true });

  const testUsers = getTestUsers();
  const emptyState = {
    cookies: [],
    origins: [],
  };
  for (const user of Object.keys(testUsers) as Array<keyof typeof testUsers>) {
    const file = storagePath(user);

    if (fs.existsSync(file)) {
      fs.rmSync(file);
    }

    fs.writeFileSync(file, JSON.stringify(emptyState, null, 2));
  }
}
