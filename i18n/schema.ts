export type Schema = {
  loginPage: {
    cookies: {
      accept: string;
    };
    loginButton: {
      title: string;
    };
  };
  certification: {
    sms: {
      loginButton: string;
    };
    otp: {};
  };
};
