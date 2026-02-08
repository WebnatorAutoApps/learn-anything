import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS_ADDRESS } from "@/config/constants";

export const metadata: Metadata = {
  title: "Cafe de Especialidad en Norte Madrid — Specialty Coffee",
  description:
    "Cafe de especialidad en la zona norte de Madrid. Granos de origen unico, tostado artesanal, espresso, pour-over y cold brew. Calle de Orense 32, cerca de AZCA.",
  alternates: {
    canonical: "/productos/cafe",
  },
};

export default function CafePage() {
  return (
    <div className="min-h-screen bg-white">
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
            <li className="text-gray-900 font-medium">Cafe</li>
          </ol>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          Cafe de Especialidad en Norte Madrid
        </h1>

        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          Descubre nuestro <strong>cafe de especialidad</strong> en la zona
          norte de Madrid. Seleccionamos <strong>granos de origen unico</strong>{" "}
          de las mejores fincas del mundo y los tostamos artesanalmente para
          resaltar sus sabores unicos. Ya sea un espresso rapido antes del
          trabajo o un pour-over relajado el fin de semana, tenemos el cafe
          perfecto para ti.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Metodos de Preparacion
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                name: "Espresso",
                desc: "Extraccion perfecta con nuestro blend house o granos single-origin. Base para cortado, flat white y latte.",
              },
              {
                name: "Pour-Over (V60)",
                desc: "Preparacion manual que resalta las notas de origen del cafe. Ideal para granos de especialidad.",
              },
              {
                name: "Cold Brew",
                desc: "Cafe infusionado en frio durante 18 horas. Suave, bajo en acidez y perfecto para el verano madrileno.",
              },
              {
                name: "AeroPress",
                desc: "Metodo de inmersion por presion. Cuerpo limpio con sabores concentrados y brillantes.",
              },
              {
                name: "French Press",
                desc: "Inmersion completa para un cafe con cuerpo pleno. Perfecto para disfrutar sin prisa.",
              },
              {
                name: "Matcha Latte",
                desc: "Te verde matcha ceremonial con leche espumada. La fusion perfecta entre Japon y la cafeteria moderna.",
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
            Nuestro Compromiso con el Cafe
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>
                <strong>Origen unico</strong> — Granos trazables de fincas en
                Colombia, Etiopia, Guatemala, Kenya y Brasil.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>
                <strong>Tostado artesanal</strong> — Tostamos en pequenos lotes
                para garantizar frescura y calidad constante.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>
                <strong>Comercio directo</strong> — Relacion directa con
                productores para garantizar precios justos y sostenibilidad.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>
                <strong>Baristas expertos</strong> — Nuestro equipo esta
                formado en tecnicas de extraccion y latte art.
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
              href="/productos/bubble-tea"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-green-300 hover:text-green-700 transition-colors"
            >
              Bubble Tea
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
