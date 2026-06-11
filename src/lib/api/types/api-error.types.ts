export type ApiErrorBody = {
  detail?: string | ValidationErrorItem[];
  message?: string;
};

export type ValidationErrorItem = {
  loc: (string | number)[];
  msg: string;
  type: string;
};

export type ApiError = {
  status: number;
  code: string;
  message: string;
  fieldErrors: Record<string, string>;
  requestId?: string;
  raw?: unknown;
};
