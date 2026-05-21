export type Schema = {
  loginPage: {
    loginButton: {
      title: string;
    };
    authErrorAlert: string;
  };
  registrationPage: {
    heading: string;
    saveButton: string;
    passwordShowButton: string;
    firstNameLabel: string;
    lastNameLabel: string;
    emailLabel: string;
    passwordLabel: string;
    termsCheckboxLabel: string;
    customerPrivacyCheckboxLabel: string;
    duplicateEmailError: string;
  };
};

export type Texts = Schema;
