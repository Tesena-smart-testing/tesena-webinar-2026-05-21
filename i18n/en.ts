import type { Schema } from "@/i18n/schema";

export const en: Schema = {
  loginPage: {
    loginButton: {
      title: "Sign in",
    },
    authErrorAlert: "Authentication failed.",
  },
  searchResultsPage: {
    heading: "Search results",
    searchInput: "Search our catalog",
  },
  registrationPage: {
    heading: "Create an account",
    saveButton: "Save",
    passwordShowButton: "Show",
    firstNameLabel: "First name",
    lastNameLabel: "Last name",
    emailLabel: "Email",
    passwordLabel: "Password input",
    termsCheckboxLabel:
      "I agree to the terms and conditions and the privacy policy",
    customerPrivacyCheckboxLabel: "Customer data privacy",
    duplicateEmailError:
      "The email is already used, please choose another one or sign in",
  },
};
