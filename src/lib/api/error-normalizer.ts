import type { AxiosError } from "axios";

import type {
  ApiError,
  ApiErrorBody,
  ValidationErrorItem,
} from "@/lib/api/types/api-error.types";

function isValidationErrorItem(value: unknown): value is ValidationErrorItem {
  return (
    typeof value === "object" &&
    value !== null &&
    "loc" in value &&
    "msg" in value
  );
}

function mapFieldErrors(detail: ValidationErrorItem[]): Record<string, string> {
  return detail.reduce<Record<string, string>>((acc, item) => {
    const field = item.loc[item.loc.length - 1];
    if (typeof field === "string") {
      acc[field] = item.msg;
    }
    return acc;
  }, {});
}

export function normalizeApiError(
  error: AxiosError<ApiErrorBody>,
  requestId?: string,
): ApiError {
  const status = error.response?.status ?? 0;
  const data = error.response?.data;
  const detail = data?.detail;

  if (Array.isArray(detail)) {
    const validationItems = detail.filter(isValidationErrorItem);
    return {
      status,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      fieldErrors: mapFieldErrors(validationItems),
      requestId,
      raw: data,
    };
  }

  const message =
    (typeof detail === "string" ? detail : undefined) ??
    data?.message ??
    error.message ??
    "An unexpected error occurred";

  return {
    status,
    code: status ? `HTTP_${status}` : "NETWORK_ERROR",
    message,
    fieldErrors: {},
    requestId,
    raw: data,
  };
}
