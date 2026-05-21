import type { Schema } from "@/i18n/schema";

export const cs: Schema = {
  loginPage: {
    loginButton: {
      title: "Přihlásit se",
    },
    authErrorAlert: "Ověření se nezdařilo",
  },
  registrationPage: {
    heading: "Registrovat",
    saveButton: "Uložit",
    passwordShowButton: "Ukázat",
    firstNameLabel: "Jméno",
    lastNameLabel: "Příjmení",
    emailLabel: "E-mail",
    passwordLabel: "Pole pro heslo",
    termsCheckboxLabel:
      "I agree to the terms and conditions and the privacy policy",
    customerPrivacyCheckboxLabel: "Ochrana osobních údajů zákazníků",
    duplicateEmailError:
      "Tento e-mail je již zaregistrován, zadejte jiný nebo se přihlaste",
  },
};
