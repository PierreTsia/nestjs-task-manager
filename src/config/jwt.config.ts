const ONE_HOUR_IN_SECONDS = 3600;

export const jwtConfig = (secret: string) => ({
  secret,
  signOptions: {
    expiresIn: ONE_HOUR_IN_SECONDS,
  },
});
