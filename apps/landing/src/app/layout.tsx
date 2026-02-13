import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL, APP_NAME } from "@/config/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const META_TITLE = `${APP_NAME} — Free AI-Powered Online Courses | Learn Any Skill`;
const META_DESCRIPTION =
  "Master any skill with free, AI-generated personalized courses. Learn coding, guitar, photography, cooking & more through hands-on projects. Better than Coursera & Udemy — your learning path is built just for you.";

export const metadata: Metadata = {
  title: {
    default: META_TITLE,
    template: `%s | ${APP_NAME}`,
  },
  description: META_DESCRIPTION,
  keywords: [
    "learn new skills",
    "online courses",
    "free online learning",
    "AI learning platform",
    "personalized courses",
    "skill training",
    "learn coding",
    "learn guitar",
    "learn photography",
    "hands-on learning",
    "project-based learning",
    "AI tutor",
  ],
  applicationName: APP_NAME,
  authors: [{ name: APP_NAME, url: SITE_URL }],
  creator: APP_NAME,
  publisher: APP_NAME,
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: APP_NAME,
    title: META_TITLE,
    description: META_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: META_TITLE,
    description: META_DESCRIPTION,
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
  category: "education",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: APP_NAME,
      url: SITE_URL,
      description: META_DESCRIPTION,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: APP_NAME,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: ["en", "es", "fr", "de", "it", "zh-CN", "ja"],
    },
    {
      "@type": "EducationalOccupationalProgram",
      "@id": `${SITE_URL}/#program`,
      name: `${APP_NAME} — AI-Powered Personalized Learning`,
      description: META_DESCRIPTION,
      provider: { "@id": `${SITE_URL}/#organization` },
      educationalProgramMode: "online",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
