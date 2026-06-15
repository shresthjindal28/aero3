import type { Metadata } from "next";

const siteName = "Aevomed";
const siteDescription =
  "Clinical intelligence platform for practicing clinicians — notes, visits, and prescriptions in one place.";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName,
    title: siteName,
    description: siteDescription,
    url: siteUrl,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${siteName} — Clinical Intelligence Platform`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },
};

export const adminSiteMetadata: Metadata = {
  ...siteMetadata,
  title: {
    default: `${siteName} Admin`,
    template: `%s | ${siteName} Admin`,
  },
  description: `${siteName} platform operations console`,
  openGraph: {
    ...siteMetadata.openGraph,
    title: `${siteName} Admin`,
    description: `${siteName} platform operations console`,
  },
  twitter: {
    ...siteMetadata.twitter,
    title: `${siteName} Admin`,
    description: `${siteName} platform operations console`,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: `${siteName} Admin`,
  },
};
