export function formatSupabaseError(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as {
      message?: string;
      code?: string;
      details?: string;
      hint?: string;
    };
    const parts = [e.code, e.message, e.details, e.hint].filter(Boolean);
    if (parts.length) return parts.join(" — ");
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

/** True when tables are missing — run frontend/supabase/schema.sql in Supabase SQL Editor. */
export function isMissingTableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  const message = (err as { message?: string }).message ?? "";
  return (
    code === "PGRST205" ||
    code === "42P01" ||
    /could not find the table/i.test(message) ||
    /relation .* does not exist/i.test(message)
  );
}
