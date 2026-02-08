import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import JsonLd from "@/components/JsonLd";
import {
  SITE_URL,
  LOCAL_BUSINESS_SCHEMA,
  ORGANIZATION_SCHEMA,
  WEBSITE_SCHEMA,
} from "@/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mochi y Bubble Tea en Norte Madrid | LearnAnything",
    template: "%s | LearnAnything",
  },
  description:
    "Mochi artesanal, bubble tea, cafe de especialidad y anko en la zona norte de Madrid. Ingredientes frescos, recetas japonesas autenticas. Visita nuestra tienda en Calle de Orense 32.",
  keywords: [
    "mochi madrid",
    "mochis madrid",
    "bubble tea madrid",
    "bubble tea norte madrid",
    "cafe madrid norte",
    "cafe especialidad madrid",
    "anko madrid",
    "tienda japonesa madrid",
    "mochi artesanal",
    "te de burbujas madrid",
    "boba tea madrid",
    "zona norte madrid",
    "mochi cerca de mi",
    "bubble tea cerca de mi",
  ],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    languages: {
      "es": "/",
      "en": "/?lang=en",
      "fr": "/?lang=fr",
      "de": "/?lang=de",
      "it": "/?lang=it",
      "zh-CN": "/?lang=zh",
      "ja": "/?lang=ja",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    alternateLocale: ["en_US", "fr_FR", "de_DE", "it_IT", "zh_CN", "ja_JP"],
    url: SITE_URL,
    siteName: "LearnAnything — Mochi & Bubble Tea",
    title: "Mochi y Bubble Tea en Norte Madrid | LearnAnything",
    description:
      "Mochi artesanal, bubble tea, cafe de especialidad y anko en la zona norte de Madrid. Ingredientes frescos y recetas japonesas autenticas.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mochi y Bubble Tea en Norte Madrid",
    description:
      "Mochi artesanal, bubble tea, cafe de especialidad y anko en zona norte de Madrid. Visita nuestra tienda.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "food & drink",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <JsonLd data={LOCAL_BUSINESS_SCHEMA} />
        <JsonLd data={ORGANIZATION_SCHEMA} />
        <JsonLd data={WEBSITE_SCHEMA} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
