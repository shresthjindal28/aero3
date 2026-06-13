export function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function isStorageObjectKey(value: string | null | undefined): value is string {
  return Boolean(value && !isAbsoluteUrl(value));
}
