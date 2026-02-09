import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { SITE } from "@/lib/constants";
import { buildPageMetadata } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const rootMetadata = buildPageMetadata({
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  path: "/",
  keywords: ["AI portfolio", "Web3 portfolio", "Germany developer"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  applicationName: `${SITE.name} Portfolio`,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...rootMetadata,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        <div className="noise-overlay" aria-hidden="true" />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
