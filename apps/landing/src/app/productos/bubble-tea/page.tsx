import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, BUSINESS_NAME, BUSINESS_ADDRESS } from "@/seo";

export const metadata: Metadata = {
  title: "Bubble Tea en Madrid — Te de Burbujas y Boba Tea",
  description:
    "Bubble tea fresco en Madrid con perlas de tapioca hechas al momento. Te con leche, te de frutas, boba tea y creaciones exclusivas. Zona norte de Madrid, Calle de Orense 32.",
  keywords: [
    "bubble tea madrid",
    "boba tea madrid",
    "te de burbujas madrid",
    "bubble tea norte madrid",
    "perlas de tapioca madrid",
    "te con leche taiwan madrid",
    "bubble tea cerca de mi",
    "boba madrid",
  ],
  alternates: {
    canonical: "/productos/bubble-tea",
  },
  openGraph: {
    title: "Bubble Tea en Madrid — Te de Burbujas y Boba Tea",
    description:
      "Bubble tea fresco con perlas de tapioca hechas al momento. Te con leche, frutas y creaciones exclusivas. Norte de Madrid.",
    url: `${SITE_URL}/productos/bubble-tea`,
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
      name: "Bubble Tea",
      item: `${SITE_URL}/productos/bubble-tea`,
    },
  ],
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Bubble Tea",
  description:
    "Bubble tea fresco preparado al momento con perlas de tapioca caseras. Amplia variedad de sabores: te con leche clasico, taro, matcha, frutas tropicales y creaciones exclusivas de temporada.",
  brand: {
    "@type": "Brand",
    name: BUSINESS_NAME,
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: "4.00",
    highPrice: "7.50",
    offerCount: "15",
    availability: "https://schema.org/InStock",
    seller: {
      "@type": "Organization",
      name: BUSINESS_NAME,
    },
  },
  category: "Bebidas",
};

export default function BubbleTeaPage() {
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
            <li className="text-gray-900 font-medium">Bubble Tea</li>
          </ol>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          Bubble Tea en Madrid — Te de Burbujas Fresco
        </h1>

        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          Disfruta del mejor <strong>bubble tea en Madrid</strong>. Nuestras{" "}
          <strong>perlas de tapioca</strong> se preparan frescas cada dia, y
          ofrecemos una amplia carta de sabores que va desde el clasico{" "}
          <strong>te con leche taiwanes</strong> hasta creaciones de temporada
          con frutas frescas. Todo en la{" "}
          <strong>zona norte de Madrid</strong>.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Nuestra Carta de Bubble Tea
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                name: "Te con Leche Clasico",
                desc: "El bubble tea original taiwanes. Te negro con leche cremosa y perlas de tapioca.",
              },
              {
                name: "Taro Milk Tea",
                desc: "Te con leche de taro morado. Cremoso, dulce y con un sabor unico.",
              },
              {
                name: "Matcha Bubble Tea",
                desc: "Te verde matcha ceremonial con leche y perlas de tapioca. Intenso y equilibrado.",
              },
              {
                name: "Brown Sugar Boba",
                desc: "Leche fresca con perlas de tapioca caramelizadas con azucar moreno. El favorito de todos.",
              },
              {
                name: "Bubble Tea de Frutas",
                desc: "Te de frutas con popping boba. Mango, maracuya, lichi y melocoton.",
              },
              {
                name: "Bubble Tea de Temporada",
                desc: "Creaciones exclusivas que cambian con las estaciones. Pregunta por la novedad del mes.",
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
            Por Que Nuestro Bubble Tea Es Diferente
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>
                <strong>Perlas frescas cada dia</strong> — Preparamos nuestras
                perlas de tapioca cada manana. Nunca usamos perlas de bolsa.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>
                <strong>Te de hoja suelta</strong> — Usamos te de alta calidad
                importado directamente de Taiwan y Japon.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>
                <strong>Personalizable</strong> — Elige tu nivel de dulzor, hielo
                y toppings favoritos.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>
                <strong>Sin siropes artificiales</strong> — Endulzamos con
                azucar de cana y miel natural.
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
