import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, BUSINESS_NAME, BUSINESS_ADDRESS } from "@/seo";

export const metadata: Metadata = {
  title: "Mochi Artesanal en Madrid — Mochis Frescos Cada Dia",
  description:
    "Mochi artesanal hecho a mano cada dia en Madrid. Mochis de helado, daifuku, matcha, fresa, mango y sabores de temporada. Visita nuestra tienda en zona norte de Madrid.",
  keywords: [
    "mochi madrid",
    "mochis madrid",
    "mochi artesanal",
    "mochi helado madrid",
    "daifuku madrid",
    "mochi matcha",
    "mochi fresa",
    "dulces japoneses madrid",
    "comprar mochi madrid",
  ],
  alternates: {
    canonical: "/productos/mochi",
  },
  openGraph: {
    title: "Mochi Artesanal en Madrid — Mochis Frescos Cada Dia",
    description:
      "Mochi artesanal hecho a mano en Madrid. Sabores clasicos y de temporada. Zona norte de Madrid.",
    url: `${SITE_URL}/productos/mochi`,
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
      name: "Mochi",
      item: `${SITE_URL}/productos/mochi`,
    },
  ],
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Mochi Artesanal",
  description:
    "Mochi artesanal hecho a mano cada dia con harina de arroz glutinoso de primera calidad. Disponible en multiples sabores: matcha, fresa, mango, chocolate, sesamo negro y sabores de temporada.",
  brand: {
    "@type": "Brand",
    name: BUSINESS_NAME,
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: "2.50",
    highPrice: "15.00",
    offerCount: "12",
    availability: "https://schema.org/InStock",
    seller: {
      "@type": "Organization",
      name: BUSINESS_NAME,
    },
  },
  category: "Dulces Japoneses",
};

export default function MochiPage() {
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
            <li className="text-gray-900 font-medium">Mochi</li>
          </ol>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          Mochi Artesanal en Madrid
        </h1>

        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          Nuestros <strong>mochis artesanales</strong> estan hechos a mano cada
          dia con <strong>harina de arroz glutinoso</strong> de primera calidad
          y rellenos frescos. Desde el clasico daifuku hasta innovadoras
          creaciones de temporada, cada mochi es una experiencia unica en el
          corazon de la <strong>zona norte de Madrid</strong>.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Nuestros Sabores de Mochi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                name: "Mochi de Matcha",
                desc: "Relleno de crema de te verde matcha ceremonial. Intenso y autentico.",
              },
              {
                name: "Mochi de Fresa",
                desc: "Fresa fresca envuelta en mochi suave con pasta de judias blancas.",
              },
              {
                name: "Mochi de Mango",
                desc: "Crema de mango tropical con un toque de lima. Refrescante y afrutado.",
              },
              {
                name: "Mochi de Chocolate",
                desc: "Ganache de chocolate belga 70% cacao. Para los amantes del chocolate.",
              },
              {
                name: "Daifuku Clasico",
                desc: "El mochi tradicional japones con relleno de anko (pasta de judias rojas).",
              },
              {
                name: "Mochi de Sesamo Negro",
                desc: "Crema de sesamo negro tostado. Sabor intenso y textura cremosa.",
              },
              {
                name: "Mochi Ice Cream",
                desc: "Helado artesanal envuelto en mochi. Disponible en multiples sabores.",
              },
              {
                name: "Mochi de Temporada",
                desc: "Creaciones especiales que cambian con las estaciones. Pregunta por el sabor del mes.",
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
            Que Hace Especial Nuestro Mochi
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>
                <strong>Hecho a mano cada dia</strong> — Nunca vendemos mochi del
                dia anterior. Frescura garantizada.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>
                <strong>Ingredientes premium</strong> — Harina de arroz glutinoso
                importada de Japon, frutas frescas de temporada.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>
                <strong>Recetas autenticas</strong> — Tecnicas tradicionales
                japonesas combinadas con sabores mediterraneos.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>
                <strong>Sin conservantes</strong> — Ingredientes naturales, sin
                colorantes ni conservantes artificiales.
              </span>
            </li>
          </ul>
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

        {/* Internal links */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tambien te puede interesar
          </h2>
          <div className="flex flex-wrap gap-3">
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
              href="/productos/anko"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-green-300 hover:text-green-700 transition-colors"
            >
              Anko y Dulces Japoneses
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
