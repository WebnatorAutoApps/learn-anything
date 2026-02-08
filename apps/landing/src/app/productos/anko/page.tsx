import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, BUSINESS_NAME, BUSINESS_ADDRESS } from "@/seo";

export const metadata: Metadata = {
  title: "Anko y Dulces Japoneses en Madrid — Pasta de Judias Rojas",
  description:
    "Anko artesanal (pasta de judias rojas) y dulces japoneses tradicionales en Madrid. Dorayaki, taiyaki, yokan y mas. Zona norte de Madrid, Calle de Orense 32.",
  keywords: [
    "anko madrid",
    "pasta de judias rojas madrid",
    "dulces japoneses madrid",
    "dorayaki madrid",
    "taiyaki madrid",
    "wagashi madrid",
    "red bean paste madrid",
    "anko artesanal",
  ],
  alternates: {
    canonical: "/productos/anko",
  },
  openGraph: {
    title: "Anko y Dulces Japoneses en Madrid",
    description:
      "Anko artesanal y dulces japoneses tradicionales en zona norte de Madrid. Dorayaki, taiyaki, yokan y mas.",
    url: `${SITE_URL}/productos/anko`,
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Inicio",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Productos",
      item: `${SITE_URL}/productos`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Anko",
      item: `${SITE_URL}/productos/anko`,
    },
  ],
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Anko y Dulces Japoneses",
  description:
    "Anko artesanal (pasta de judias rojas azuki) elaborado de forma tradicional. Tambien ofrecemos dorayaki, taiyaki, yokan, daifuku y otros dulces japoneses clasicos (wagashi).",
  brand: {
    "@type": "Brand",
    name: BUSINESS_NAME,
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: "2.00",
    highPrice: "12.00",
    offerCount: "8",
    availability: "https://schema.org/InStock",
    seller: {
      "@type": "Organization",
      name: BUSINESS_NAME,
    },
  },
  category: "Dulces Japoneses",
};

export default function AnkoPage() {
  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={productSchema} />

      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-gray-900"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-white text-xs font-bold">
              LA
            </span>
            LearnAnything
          </Link>
          <Link
            href="/"
            className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            &larr; Volver al Inicio
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-20">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-green-600 transition-colors">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/norte-madrid" className="hover:text-green-600 transition-colors">
                Norte Madrid
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium">Anko</li>
          </ol>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          Anko y Dulces Japoneses en Madrid
        </h1>

        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          Descubre el sabor autentico del <strong>anko</strong> (pasta de judias
          rojas azuki) artesanal y nuestra seleccion de{" "}
          <strong>dulces japoneses tradicionales</strong> (wagashi). Elaborados
          con tecnicas centenarias y los mejores ingredientes, cada pieza es un
          homenaje a la reposteria japonesa en el corazon de la{" "}
          <strong>zona norte de Madrid</strong>.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Nuestra Seleccion de Dulces Japoneses
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                name: "Anko (Pasta de Judias Rojas)",
                desc: "Elaborado lentamente con judias azuki de primera calidad. Disponible en tsubuan (textura granulada) y koshian (textura suave).",
              },
              {
                name: "Dorayaki",
                desc: "Dos bizcochos esponjosos de estilo japones rellenos de anko. El dulce favorito de Doraemon.",
              },
              {
                name: "Taiyaki",
                desc: "Gofre con forma de pez relleno de anko, crema pastelera o chocolate. Crujiente por fuera, cremoso por dentro.",
              },
              {
                name: "Yokan",
                desc: "Gelatina dulce de anko con agar-agar. Suave, elegante y perfecta para acompanar con te verde.",
              },
              {
                name: "Daifuku",
                desc: "Mochi relleno de anko suave. La combinacion clasica de la reposteria japonesa.",
              },
              {
                name: "Wagashi de Temporada",
                desc: "Dulces japoneses que reflejan las estaciones. Flores de sakura en primavera, castana en otono.",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="rounded-xl border border-gray-100 p-4 hover:border-green-200 transition-colors"
              >
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Que es el Anko
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            El <strong>anko</strong> es una pasta dulce hecha a base de{" "}
            <strong>judias rojas azuki</strong> cocidas y endulzadas. Es el
            ingrediente estrella de la reposteria japonesa y se utiliza como
            relleno en multitud de dulces tradicionales como mochi, dorayaki,
            taiyaki y yokan.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Existen dos variedades principales: <strong>tsubuan</strong> (con
            textura granulada, donde se aprecian los trozos de judia) y{" "}
            <strong>koshian</strong> (textura completamente suave y fina). En
            nuestra tienda ofrecemos ambas variedades elaboradas artesanalmente.
          </p>
        </section>

        <section className="mb-12 rounded-2xl bg-green-50 border border-green-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Visita Nuestra Tienda
          </h2>
          <p className="text-gray-700">
            {BUSINESS_ADDRESS.streetAddress}, {BUSINESS_ADDRESS.postalCode}{" "}
            {BUSINESS_ADDRESS.addressLocality}
          </p>
          <p className="mt-2 text-gray-700">
            Zona norte de Madrid, cerca de AZCA y Cuatro Torres.
          </p>
          <Link
            href="/norte-madrid"
            className="mt-4 inline-block text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            Ver como llegar &rarr;
          </Link>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tambien te puede interesar
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/productos/mochi"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-green-300 hover:text-green-700 transition-colors"
            >
              Mochi Artesanal
            </Link>
            <Link
              href="/productos/bubble-tea"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-green-300 hover:text-green-700 transition-colors"
            >
              Bubble Tea
            </Link>
            <Link
              href="/productos/cafe"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-green-300 hover:text-green-700 transition-colors"
            >
              Cafe de Especialidad
            </Link>
            <Link
              href="/norte-madrid"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-green-300 hover:text-green-700 transition-colors"
            >
              Norte Madrid
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
