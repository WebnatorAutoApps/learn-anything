import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "@/config/constants";
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
  category: "food & drink",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
