import { Schema } from "./schema";

export const cs: Schema = {
  loginPage: {
    cookies: {
      accept: "Souhlasím",
    },
    loginButton: {
      title: "Přihlásit",
    },
  },
  certification: {
    sms: {
      loginButton: "Přihlásit",
    },
    otp: {},
  },
};
