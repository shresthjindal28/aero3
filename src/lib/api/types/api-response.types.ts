export type ApiSuccessResponse<T> = T;

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
};
