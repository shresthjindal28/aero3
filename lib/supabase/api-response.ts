import { NextResponse } from "next/server";
import { formatSupabaseError, isMissingTableError } from "./errors";

export function supabaseErrorResponse(error: unknown, fallback: string) {
  console.error(fallback, formatSupabaseError(error));

  if (isMissingTableError(error)) {
    return NextResponse.json(
      {
        error: "Database tables missing. Run frontend/supabase/schema.sql (from airo_schema) in Supabase SQL Editor.",
        code: "DB_SCHEMA_MISSING",
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      error: fallback,
      details:
        process.env.NODE_ENV === "development"
          ? formatSupabaseError(error)
          : undefined,
    },
    { status: 500 }
  );
}
