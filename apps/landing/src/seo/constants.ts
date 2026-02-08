export const SITE_URL = "https://www.learnanything.com";
export const BUSINESS_NAME = "LearnAnything — Mochi & Bubble Tea";
export const BUSINESS_PHONE = "+34 910 123 456";
export const BUSINESS_EMAIL = "hola@learnanything.com";

export const BUSINESS_ADDRESS = {
  streetAddress: "Calle de Orense 32",
  addressLocality: "Madrid",
  addressRegion: "Madrid",
  postalCode: "28020",
  addressCountry: "ES",
};

export const BUSINESS_GEO = {
  latitude: 40.4530,
  longitude: -3.6923,
};

export const BUSINESS_HOURS = [
  "Mo-Fr 08:00-21:00",
  "Sa 09:00-22:00",
  "Su 10:00-20:00",
];

export const PRODUCT_CATEGORIES = [
  {
    slug: "mochi",
    keywords: ["mochi", "mochis", "mochi madrid", "mochi norte madrid"],
  },
  {
    slug: "bubble-tea",
    keywords: ["bubble tea", "bubble tea madrid", "te de burbujas", "boba tea"],
  },
  {
    slug: "cafe",
    keywords: ["cafe madrid norte", "cafe especialidad", "specialty coffee"],
  },
  {
    slug: "anko",
    keywords: ["anko", "pasta de judias rojas", "red bean paste", "anko madrid"],
  },
] as const;

export const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: BUSINESS_NAME,
  description:
    "Tienda especializada en mochi artesanal, bubble tea, cafe de especialidad y anko en la zona norte de Madrid. Ingredientes frescos y recetas autenticas japonesas.",
  url: SITE_URL,
  telephone: BUSINESS_PHONE,
  email: BUSINESS_EMAIL,
  address: {
    "@type": "PostalAddress",
    ...BUSINESS_ADDRESS,
  },
  geo: {
    "@type": "GeoCoordinates",
    ...BUSINESS_GEO,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "21:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "22:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "10:00",
      closes: "20:00",
    },
  ],
  priceRange: "$$",
  servesCuisine: ["Japanese", "Bubble Tea", "Specialty Coffee"],
  hasMenu: `${SITE_URL}/productos`,
  areaServed: {
    "@type": "City",
    name: "Madrid",
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: "Comunidad de Madrid",
    },
  },
  sameAs: [],
};

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BUSINESS_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: BUSINESS_PHONE,
    contactType: "customer service",
    availableLanguage: ["Spanish", "English"],
  },
  address: {
    "@type": "PostalAddress",
    ...BUSINESS_ADDRESS,
  },
};

export const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BUSINESS_NAME,
  url: SITE_URL,
  inLanguage: ["es", "en"],
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};
