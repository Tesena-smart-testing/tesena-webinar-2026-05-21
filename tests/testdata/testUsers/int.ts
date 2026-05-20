import type { Users } from "@/tests/testdata/testUsers/schema";

export const users: Users = {
  shopTestsUser: {
    email: "demo@prestashop.com",
    password: process.env.SHOP_PASSWORD ?? "",
  },
};
