import Link from "next/link";

import { routes } from "@/shared/constants/routes";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <Link href={routes.auth.doctorLogin} className="text-sm text-primary underline">
        Return to sign in
      </Link>
    </div>
  );
}
