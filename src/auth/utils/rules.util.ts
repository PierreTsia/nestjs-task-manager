export const RULES = {
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 20,
    FORMAT: /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    MESSAGE:
      'Password must have at least 1 upperCase, 1 lowerCase, 1 number or special character',
  },
  USER_NAME: {
    MIN_LENGTH: 4,
    MAX_LENGTH: 20,
  },
};
