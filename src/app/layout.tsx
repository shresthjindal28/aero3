import type { Metadata } from "next";

import { AppProviders } from "@/providers/app-providers";
import "@/styles/globals.css";
import "@/styles/themes/doctor.css";
import "@/styles/themes/admin.css";
import "@/styles/tokens/colors.css";

export const metadata: Metadata = {
  title: "AIRO",
  description: "Clinical intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
