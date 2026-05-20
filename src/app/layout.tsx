import type { Metadata, Viewport } from "next";

import { getAppUrl } from "@/lib/env/public";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: {
    default: "GabayGamot",
    template: "%s | GabayGamot",
  },
  applicationName: "GabayGamot",
  description:
    "AI-assisted medicine inventory, consultation, dispensing, referral, reporting, and operational insight support for barangay health centers.",
  appleWebApp: {
    capable: true,
    title: "GabayGamot",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
