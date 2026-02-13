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
    default: "LearnAnything — Learn Any Skill with AI-Powered Personalized Courses",
    template: "%s | LearnAnything",
  },
  description:
    "Master any skill through hands-on, AI-generated learning paths. Guitar, coding, photography, woodworking — tell our AI what you want to learn and get a personalized course built just for you. Free forever.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    languages: {
      "en": "/",
      "es": "/?lang=es",
      "fr": "/?lang=fr",
      "de": "/?lang=de",
      "it": "/?lang=it",
      "zh-CN": "/?lang=zh",
      "ja": "/?lang=ja",
    },
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
